import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HomeroomDashboardClient } from './homeroom-client'

export default async function HomeroomDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get classes where user is homeroom teacher
    const { data: myClasses } = await supabase
        .from('classes')
        .select('id')
        .eq('homeroom_teacher_id', user.id)

    const classIds = myClasses?.map(c => c.id) || []

    // Get sheets needing homeroom approval
    const { data: sheets } = await supabase
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
    `)
        .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000'])
        .eq('status', 'HOMEROOM_REVIEW')
        .order('updated_at', { ascending: false })

    // Get all sheets for stats
    const { data: allSheets } = await supabase
        .from('completion_sheets')
        .select('status')
        .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000'])

    const stats = {
        pending: allSheets?.filter(s => s.status === 'HOMEROOM_REVIEW').length || 0,
        approved: allSheets?.filter(s => ['COUNSELOR_REVIEW', 'APPROVED'].includes(s.status)).length || 0,
        inProgress: allSheets?.filter(s => ['PENDING', 'IN_PROGRESS'].includes(s.status)).length || 0,
    }

    return <HomeroomDashboardClient sheets={sheets || []} stats={stats} />
}
