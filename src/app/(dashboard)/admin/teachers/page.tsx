import { createClient } from '@/lib/supabase/server'
import { TeachersClient } from './teachers-client'

interface SearchParams {
    page?: string
    per_page?: string
    query?: string
}

export default async function TeachersPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const perPage = Number(params.per_page) || 10
    const query = params.query || ''

    const supabase = await createClient()

    // Query for profiles with 'TEACHER' role
    let queryBuilder = supabase
        .from('profiles')
        .select('*, user_roles!inner(role)', { count: 'exact' })
        .eq('user_roles.role', 'TEACHER') as any

    if (query) {
        queryBuilder = queryBuilder.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data: teachers, count, error } = await queryBuilder
        .order('full_name')
        .range(from, to)

    if (error) {
        console.error("Error fetching teachers:", error)
    }

    // Check for counselor role
    const teacherIds = teachers?.map((t: any) => t.id) || []

    // Default to empty array if no teachers found to avoid error in .in()
    let counselorMap = new Set()
    if (teacherIds.length > 0) {
        const { data: counselorRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'COUNSELOR')
            .in('user_id', teacherIds)

        counselorRoles?.forEach(r => counselorMap.add(r.user_id))
    }

    const items = teachers?.map((t: any) => ({
        ...t,
        is_counselor: counselorMap.has(t.id)
    })) || []

    const pageCount = count ? Math.ceil(count / perPage) : 0

    return (
        <TeachersClient
            items={items}
            pageCount={pageCount}
            currentPage={page}
            totalItems={count || 0}
        />
    )
}
