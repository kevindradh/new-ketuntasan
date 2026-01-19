import { createClient } from '@/lib/supabase/server'
import { AssignmentsClient } from './assignments-client'
import { notFound } from 'next/navigation'

export default async function TeacherAssignmentsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ page?: string, query?: string }>
}) {
    const { id: teacherId } = await params
    const search = await searchParams
    const currentPage = Number(search?.page) || 1
    const query = search?.query || ''
    const classId = search?.classId || 'all'
    const pageSize = 10
    const supabase = await createClient()

    // 1. Fetch Teacher Profile
    const { data: teacher, error: teacherError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', teacherId)
        .single()

    if (teacherError || !teacher) {
        notFound()
    }

    // 2. Fetch Assignments for this teacher with pagination
    let dbQuery = supabase
        .from('teacher_assignments')
        .select(`
            *,
            subject:subjects(id, name, code),
            class:classes(id, name, academic_year)
        `, { count: 'exact' })
        .eq('teacher_id', teacherId)

    if (classId !== 'all') {
        dbQuery = dbQuery.eq('class_id', classId)
    }

    if (query) {
        // Note: Searching on joined tables can be tricky with Supabase. 
        // Simple solution: filter by known fields or relying on client search for small datasets.
        // But for server-side search, we need !inner join or specific filter.
        // Let's assume query filters subject name or class name.
        // dbQuery = dbQuery.or(`subject.name.ilike.%${query}%,class.name.ilike.%${query}%`)
        // This complex join filter often requires inner joins. 
        // Given "server-side pagination" request usually implies handling large data, 
        // but complex search might be out of scope unless asked. 
        // I'll skip complex search implementation for now or stick to simple valid filters if any.
        // The user only asked for pagination explicitly, but usually they go together.
        // Let's keep it simple: just pagination for now as per request.
    }

    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1

    const { data: assignments, count } = await dbQuery
        .order('created_at', { ascending: false })
        .range(from, to)

    const totalItems = count || 0
    const pageCount = Math.ceil(totalItems / pageSize)

    // 3. Fetch all classes and subjects for the dropdowns
    const [{ data: subjects }, { data: classes }] = await Promise.all([
        supabase.from('subjects').select('id, name, code').eq('is_active', true).order('name'),
        supabase.from('classes').select('id, name, academic_year').eq('is_active', true).order('name'),
    ])

    return (
        <AssignmentsClient
            teacher={teacher}
            assignments={assignments || []}
            subjects={subjects || []}
            classes={classes || []}
            pageCount={pageCount}
            currentPage={currentPage}
            totalItems={totalItems}
        />
    )
}
