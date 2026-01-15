import { createClient } from '@/lib/supabase/server'
import { AssignmentsClient } from './assignments-client'
import { notFound } from 'next/navigation'

export default async function TeacherAssignmentsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id: teacherId } = await params
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

    // 2. Fetch Assignments for this teacher
    const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select(`
            *,
            subject:subjects(id, name, code),
            class:classes(id, name, academic_year)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

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
        />
    )
}
