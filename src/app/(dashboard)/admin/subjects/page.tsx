import { createClient } from '@/lib/supabase/server'
import { SubjectsClient } from './subjects-client'

interface SearchParams {
    page?: string
    per_page?: string
    query?: string
}

export default async function SubjectsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const perPage = Number(params.per_page) || 10
    const query = params.query || ''

    const supabase = await createClient()

    // Create base query
    let queryBuilder = supabase
        .from('subjects')
        .select('*', { count: 'exact' })

    // Apply search filter if present
    if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,code.ilike.%${query}%`)
    }

    // Apply pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data: subjects, count } = await queryBuilder
        .order('name')
        .range(from, to)

    const pageCount = count ? Math.ceil(count / perPage) : 0

    return (
        <SubjectsClient
            subjects={subjects || []}
            pageCount={pageCount}
            currentPage={page}
            totalItems={count || 0}
        />
    )
}
