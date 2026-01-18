import { createClient } from '@/lib/supabase/server'
import { ExamsClient } from './exams-client'

export default async function ExamsPage({
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

    // Build query for exams
    let dbQuery = supabase
        .from('exams')
        .select('*', { count: 'exact' })

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,exam_type.ilike.%${query}%`)
    }

    // Apply pagination
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1

    const [{ data: exams, count }, { data: classes }] = await Promise.all([
        dbQuery
            .order('start_date', { ascending: false })
            .range(from, to),
        supabase
            .from('classes')
            .select('id, name, grade_level, major, academic_year')
            .eq('is_active', true)
            .order('name'),
    ])

    const totalItems = count || 0
    const pageCount = Math.ceil(totalItems / pageSize)

    return (
        <ExamsClient
            items={exams || []}
            classes={(classes || []) as { id: string; name: string; grade_level: number; major?: string | null; academic_year: string }[]}
            pageCount={pageCount}
            currentPage={currentPage}
            totalItems={totalItems}
        />
    )
}
