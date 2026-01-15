import { createClient } from '@/lib/supabase/server'
import { StudentsClient } from './students-client'

interface SearchParams {
    page?: string
    per_page?: string
    query?: string
}

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const perPage = Number(params.per_page) || 10
    const query = params.query || ''

    const supabase = await createClient()

    // 1. Get User IDs that have 'STUDENT' role
    // Since we need to paginate *profiles*, but filtered by *role*,
    // and they are in separate tables, this is tricky to do efficiently in one query without a View or RPC.
    // However, typical approach: join user_roles.

    // Supabase JS allows joining.
    // profiles!inner(user_roles!inner(role)) -> where role = 'STUDENT'

    let queryBuilder = supabase
        .from('profiles')
        .select('*, user_roles!inner(role)', { count: 'exact' })
        .eq('user_roles.role', 'STUDENT') as any

    // Apply search filter if present
    if (query) {
        queryBuilder = queryBuilder.or(`full_name.ilike.%${query}%,nisn.ilike.%${query}%,email.ilike.%${query}%`)
    }

    // Apply pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data: students, count, error } = await queryBuilder
        .order('full_name')
        .range(from, to)

    if (error) {
        console.error("Error fetching students:", error)
    }

    // 2. Fetch Classes for Filter/Import Validation
    const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .order('name')

    const pageCount = count ? Math.ceil(count / perPage) : 0

    return (
        <StudentsClient
            items={students || []}
            classes={classes || []}
            pageCount={pageCount}
            currentPage={page}
            totalItems={count || 0}
        />
    )
}
