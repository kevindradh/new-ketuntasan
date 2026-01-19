import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompletionSheetsClient } from './sheets-client'

export default async function CompletionSheetsPage({
    searchParams
}: {
    searchParams: Promise<{ class_id?: string; subject_id?: string; page?: string; query?: string }>
}) {
    const supabase = await createClient()
    const { class_id, subject_id, page, query } = await searchParams

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Get teacher assignments (Needed for both views)
    const { data: fullAssignments } = await supabase
        .from('teacher_assignments')
        .select(`
            id,
            class_id,
            subject_id,
            class:classes(id, name),
            subject:subjects(id, name, code)
        `)
        .eq('teacher_id', user.id)
        .eq('is_active', true)

    const formattedAssignments = fullAssignments?.map(a => ({
        ...a,
        class: Array.isArray(a.class) ? a.class[0] : a.class,
        subject: Array.isArray(a.subject) ? a.subject[0] : a.subject
    })) || []

    const classIds = [...new Set(formattedAssignments.map(a => a.class_id))]

    // --- VIEW 1: DASHBOARD STATS (No class selected) ---
    if (!class_id || !subject_id) {
        // Fetch simplified sheets just for stats (all classes)
        // We only need: class_id, and completion_items(subject_id, is_completed)
        const { data: statsSheets } = await supabase
            .from('completion_sheets')
            .select(`
                class_id,
                completion_items(subject_id, is_completed)
            `)
            .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000'])

        return (
            <CompletionSheetsClient
                teacherId={user.id}
                assignments={formattedAssignments as any}
                view="dashboard"
                statsSheets={statsSheets as any}
            />
        )
    }

    // --- VIEW 2: DETAIL LIST (Class selected) ---
    const currentPage = Number(page) || 1
    const limit = 10
    const from = (currentPage - 1) * limit
    const to = from + limit - 1

    // Build the query
    let sheetQuery = supabase
        .from('completion_sheets')
        .select(`
            *,
            student:profiles!completion_sheets_student_id_fkey!inner(id, full_name, nisn),
            exam:exams(name, exam_type),
            class:classes(name),
            completion_items(
                *,
                subject:subjects(id, name, code)
            )
        `, { count: 'exact' })
        .eq('class_id', class_id)
        .order('updated_at', { ascending: false })

    // Apply Search
    if (query) {
        // Use !inner to force join and filter by student name
        // The syntax `student!inner` works if the relationship name matches
        sheetQuery = sheetQuery.ilike('student.full_name', `%${query}%`)
        // Note: We need to modify the select to include `!inner` for this to work implicitly 
        // OR we can rely on `!inner` being inferred if we filter? NO, must specificy in select.
    }

    // For now, we will paginate strictly. If search is needed on server, 
    // we assume the user accepts we might filter after fetch or we need a specific search function.
    // Let's apply basic pagination first.

    const { data: sheets, count } = await sheetQuery.range(from, to)

    // Transform
    const formattedSheets = sheets?.map(s => ({
        ...s,
        student: Array.isArray(s.student) ? s.student[0] : s.student,
        exam: Array.isArray(s.exam) ? s.exam[0] : s.exam,
        class: Array.isArray(s.class) ? s.class[0] : s.class,
        completion_items: s.completion_items?.map((i: any) => ({
            ...i,
            subject: Array.isArray(i.subject) ? i.subject[0] : i.subject
        })).filter((i: any) => i.subject_id === subject_id) // Filter items for just this subject
    })) || []

    const totalItems = count || 0
    const pageCount = Math.ceil(totalItems / limit)

    return (
        <CompletionSheetsClient
            teacherId={user.id}
            assignments={formattedAssignments as any}
            view="detail"
            paginatedSheets={formattedSheets as any}
            currentAssignment={{
                class_id,
                subject_id
            }}
            metadata={{
                currentPage,
                pageCount,
                totalItems,
                limit
            }}
        />
    )
}
