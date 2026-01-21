import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MonitoringClient } from './monitoring-client'

export default async function HomeroomMonitoringPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; query?: string; academic_year?: string; class_id?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const params = await searchParams
    const currentPage = Number(params?.page) || 1
    const query = params?.query || ''
    const currentAcademicYear = params?.academic_year
    const currentClassId = params?.class_id
    const pageSize = 10

    // Get ALL classes where user is homeroom teacher (needed for filter options)
    const { data: myClasses } = await supabase
        .from('classes')
        .select('id, name, academic_year')
        .eq('homeroom_teacher_id', user.id)
        .order('academic_year', { ascending: false })
        .order('name', { ascending: true })

    if ((!myClasses || myClasses.length === 0)) {
        return <MonitoringClient items={[]} pageCount={0} currentPage={1} totalItems={0} availableClasses={[]} availableYears={[]} />
    }

    // Derive filter options
    const availableClasses = myClasses || []
    const availableYears = [...new Set(myClasses?.map(c => c.academic_year) || [])].sort().reverse()

    // Determine active filters (default to latest year if not set)
    const activeYear = currentAcademicYear || availableYears[0]
    const activeClassIds = currentClassId
        ? [currentClassId]
        : myClasses?.filter(c => c.academic_year === activeYear).map(c => c.id) || []

    // Build query for ALL sheets (no status filtering)
    let dbQuery = supabase
        .from('completion_sheets')
        .select(`
        *,
        student:profiles!completion_sheets_student_id_fkey(id, full_name, nisn),
        exam:exams(name, exam_type),
        class:classes(name, academic_year),
        completion_items(
          *,
          subject:subjects(name, code),
          teacher:profiles!completion_items_teacher_id_fkey(full_name)
        )
      `, { count: 'exact' })
        .in('class_id', activeClassIds)

    // Apply search if present
    if (query) {
        // Using !inner hint to filter by student name
        dbQuery = supabase
            .from('completion_sheets')
            .select(`
            *,
            student:profiles!completion_sheets_student_id_fkey!inner(id, full_name, nisn),
            exam:exams(name, exam_type),
            class:classes(name),
            completion_items(
            *,
            subject:subjects(name, code),
            teacher:profiles!completion_items_teacher_id_fkey(full_name)
            )
        `, { count: 'exact' })
            .in('class_id', activeClassIds)
            .ilike('student.full_name', `%${query}%`)
    }

    // Apply pagination
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1

    const { data: sheets, count } = await dbQuery
        .order('updated_at', { ascending: false })
        .range(from, to)

    const totalItems = count || 0
    const pageCount = Math.ceil(totalItems / pageSize)

    return (
        <MonitoringClient
            items={sheets || []}
            pageCount={pageCount}
            currentPage={currentPage}
            totalItems={totalItems}
            availableClasses={availableClasses}
            availableYears={availableYears}
        />
    )
}
