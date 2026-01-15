import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompletionSheetsClient } from './sheets-client'

export default async function CompletionSheetsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get teacher assignments
    const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select('class_id, subject_id')
        .eq('teacher_id', user.id)
        .eq('is_active', true)

    const classIds = [...new Set(assignments?.map(a => a.class_id) || [])]

    // Get ALL completion sheets for these classes (History included)
    const { data: sheets } = await supabase
        .from('completion_sheets')
        .select(`
      *,
      student:profiles!completion_sheets_student_id_fkey(id, full_name, nisn),
      exam:exams(name, exam_type),
      class:classes(name),
      completion_items(
        *,
        subject:subjects(id, name, code)
      )
    `)
        .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000'])
        .order('updated_at', { ascending: false })

    // Fetch full assignment details for cards
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

    return (
        <CompletionSheetsClient
            sheets={sheets || []}
            assignments={fullAssignments || []}
            teacherId={user.id}
        />
    )
}
