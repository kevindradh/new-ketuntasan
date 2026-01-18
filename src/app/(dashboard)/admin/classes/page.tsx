import { createClient } from '@/lib/supabase/server'
import { ClassesClient } from './classes-client'

export default async function ClassesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, query?: string }>
}) {
    const supabase = await createClient()

    // Parse search params
    const params = await searchParams
    const currentPage = Number(params?.page) || 1
    const query = params?.query || ''
    const pageSize = 10

    // Fetch teachers for dropdown
    const { data: teacherRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['TEACHER', 'HOMEROOM'])

    const teacherIds = teacherRoles?.map(r => r.user_id) || []

    const { data: teachers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', teacherIds.length > 0 ? teacherIds : ['00000000-0000-0000-0000-000000000000'])

    // Build query for classes
    let dbQuery = supabase
        .from('classes')
        .select(`
        *,
        homeroom_teacher:profiles!classes_homeroom_teacher_id_fkey(id, full_name),
        class_students(count)
      `, { count: 'exact' })

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,major.ilike.%${query}%`)
    }

    // Apply pagination
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1

    const { data: classes, count, error } = await dbQuery
        .order('name')
        .range(from, to)

    if (error) {
        console.error('Error fetching classes:', error)
    }

    const totalItems = count || 0
    const pageCount = Math.ceil(totalItems / pageSize)

    return (
        <ClassesClient
            items={classes || []}
            teachers={(teachers || []) as { id: string; full_name: string }[]}
            pageCount={pageCount}
            currentPage={currentPage}
            totalItems={totalItems}
        />
    )
}
