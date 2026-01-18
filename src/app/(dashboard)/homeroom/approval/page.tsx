import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApprovalClient } from './approval-client'

export default async function HomeroomApprovalPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, query?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const params = await searchParams
    const currentPage = Number(params?.page) || 1
    const query = params?.query || ''
    const pageSize = 10

    // Get classes where user is homeroom teacher
    const { data: myClasses } = await supabase
        .from('classes')
        .select('id')
        .eq('homeroom_teacher_id', user.id)

    const classIds = myClasses?.map(c => c.id) || []

    if (classIds.length === 0) {
        return <ApprovalClient items={[]} pageCount={0} currentPage={1} totalItems={0} />
    }

    // Build query for sheets
    let dbQuery = supabase
        .from('completion_sheets')
        .select(`
        *,
        student:profiles!completion_sheets_student_id_fkey(id, full_name, nisn),
        exam:exams(name, exam_type),
        class:classes(name),
        completion_items(
          *,
          subject:subjects(name, code),
          teacher:profiles!completion_items_teacher_id_fkey(full_name)
        )
      `, { count: 'exact' })
        .in('class_id', classIds)
        .eq('status', 'HOMEROOM_REVIEW')

    // Apply search if present
    if (query) {
        // Search by student name or class name
        // Note: Searching strictly on related tables (student.full_name) in Supabase/PostgREST 
        // via basic SDK can be tricky with complex filters. 
        // For simplicity with the standard client, we might rely on client-side filtering 
        // OR a more complex query. 
        // Text search on related tables often requires embedding the filter:
        // .ilike('student.full_name', `%${query}%`) might not work directly without specifically allowing embedded filtering.
        // Let's try to filter by what's available or consider a direct RPC if strictly needed.
        // For now, let's try a best-effort simpler path or search locally if dataset is small, 
        // BUT the requirement is server-side.
        //
        // Workaround: We can't easily ILIKE on a joined table column in a simple top-level OR without raw SQL or deeper config.
        // A common pattern is to just search on top-level fields or simple joins if enabled.
        // Since `student` is foreign key `student_id`, we can't search name directly here easily without !inner join trick.

        // Let's use the !inner hint to filter rows based on child table properties
        // This makes the join inner, so only rows matching the student name will return.
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
            .in('class_id', classIds)
            .eq('status', 'HOMEROOM_REVIEW')
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
        <ApprovalClient
            items={sheets || []}
            pageCount={pageCount}
            currentPage={currentPage}
            totalItems={totalItems}
        />
    )
}
