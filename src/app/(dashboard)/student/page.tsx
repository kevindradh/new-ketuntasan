import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentDashboardClient } from './student-client'

export default async function StudentDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get student's completion sheets
    const { data: sheets } = await supabase
        .from('completion_sheets')
        .select(`
      *,
      exam:exams(name, exam_type, start_date, end_date),
      class:classes(name),
      homeroom_approver:profiles!completion_sheets_homeroom_approved_by_fkey(full_name),
      counselor_approver:profiles!completion_sheets_counselor_approved_by_fkey(full_name),
      completion_items(
        *,
        subject:subjects(name, code),
        teacher:profiles!completion_items_teacher_id_fkey(full_name)
      )
    `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

    // Get student profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get student's class
    const { data: enrollment } = await supabase
        .from('class_students')
        .select('class:classes(name, grade_level, major)')
        .eq('student_id', user.id)
        .single()

    // Extract class data properly - Supabase returns array for nested relations
    const classInfo = enrollment?.class
    const classData = Array.isArray(classInfo) ? classInfo[0] : classInfo

    return (
        <StudentDashboardClient
            sheets={(sheets || []) as any}
            profile={profile as any}
            currentClass={classData as { name: string; grade_level: number; major: string } | null}
        />
    )
}
