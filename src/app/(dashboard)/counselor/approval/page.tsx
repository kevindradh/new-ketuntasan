import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CounselorApprovalClient } from './counselor-approval-client'

export default async function CounselorApprovalPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, query?: string, classId?: string, academic_year?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const params = await searchParams
    const currentPage = Number(params?.page) || 1
    const query = params?.query || ''
    const currentAcademicYear = params?.academic_year
    const classId = params?.classId || 'all'
    const pageSize = 10

    // Fetch Active Classes Assigned to Counselor
    const { data: classes } = await supabase
        .from('classes')
        .select('id, name, academic_year')
        .eq('is_active', true)
        .eq('counselor_id', user.id) // Only assigned classes
        .order('academic_year', { ascending: false })
        .order('name')

    const availableYears = [...new Set(classes?.map(c => c.academic_year) || [])].sort().reverse()
    const activeYear = currentAcademicYear || availableYears[0]

    // Filter classes by active year
    const activeClasses = classes?.filter(c => c.academic_year === activeYear) || []
    const activeClassIds = activeClasses.map(c => c.id)

    // If no classes assigned for this year, show empty
    if (activeClassIds.length === 0) {
        return (
            <CounselorApprovalClient
                items={[]}
                classes={[]}
                availableYears={availableYears}
                pageCount={0}
                currentPage={1}
                totalItems={0}
            />
        )
    }

    // Build query for sheets to approve
    let dbQuery = supabase
        .from('completion_sheets')
        .select(`
        *,
        student:profiles!completion_sheets_student_id_fkey(id, full_name, nisn),
        exam:exams(name, exam_type),
        class:classes(name),
        homeroom_approver:profiles!completion_sheets_homeroom_approved_by_fkey(full_name),
        completion_items(
          *,
          subject:subjects(name, code),
          teacher:profiles!completion_items_teacher_id_fkey(full_name)
        )
      `, { count: 'exact' })
        .eq('status', 'COUNSELOR_REVIEW')
        .in('class_id', activeClassIds) // Security: Only assigned classes for active year

    // Apply filters
    if (classId !== 'all') {
        // Verify class is assigned
        if (activeClassIds.includes(classId)) {
            dbQuery = dbQuery.eq('class_id', classId)
        } else {
            // Invalid class selection (security), restrict to assigned
            dbQuery = dbQuery.eq('class_id', classId)
        }
    }

    if (query) {
        // Use !inner filter for student name
        dbQuery = supabase
            .from('completion_sheets')
            .select(`
            *,
            student:profiles!completion_sheets_student_id_fkey!inner(id, full_name, nisn),
            exam:exams(name, exam_type),
            class:classes(name),
            homeroom_approver:profiles!completion_sheets_homeroom_approved_by_fkey(full_name),
            completion_items(
            *,
            subject:subjects(name, code),
            teacher:profiles!completion_items_teacher_id_fkey(full_name)
            )
        `, { count: 'exact' })
            .eq('status', 'COUNSELOR_REVIEW')
            .in('class_id', activeClassIds) // Re-apply security
            .ilike('student.full_name', `%${query}%`)

        if (classId !== 'all') {
            dbQuery = dbQuery.eq('class_id', classId)
        }
    }

    // Apply pagination
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1

    // UX: Force class selection. If "all" (default), show empty list.
    let sheets: any[] = []
    let count = 0

    if (classId !== 'all') {
        const result = await dbQuery
            .order('updated_at', { ascending: false })
            .range(from, to)
        sheets = result.data || []
        count = result.count || 0
    }

    const totalItems = count || 0
    const pageCount = Math.ceil(totalItems / pageSize)

    return (
        <CounselorApprovalClient
            items={sheets}
            classes={activeClasses}
            availableYears={availableYears}
            pageCount={pageCount}
            currentPage={currentPage}
            totalItems={totalItems}
        />
    )
}
