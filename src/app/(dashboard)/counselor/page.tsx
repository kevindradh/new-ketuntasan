import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CounselorDashboardClient } from './counselor-client'

export default async function CounselorDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get sheets needing counselor approval
    const { data: sheets } = await supabase
        .from('completion_sheets')
        .select(`
      *,
      student:profiles!completion_sheets_student_id_fkey(id, full_name, nisn),
      exam:exams(name, exam_type),
      class:classes(name),
      homeroom_approver:profiles!completion_sheets_homeroom_approved_by_fkey(full_name),
      completion_items(
        *,
        subject:subjects(name, code),
        teacher:profiles!completion_items_teacher_id_fkey(full_name)
      )
    `)
        .eq('status', 'COUNSELOR_REVIEW')
        .order('updated_at', { ascending: false })

    // Get stats
    const { data: allSheets } = await supabase
        .from('completion_sheets')
        .select('status')

    const stats = {
        pending: allSheets?.filter(s => s.status === 'COUNSELOR_REVIEW').length || 0,
        approved: allSheets?.filter(s => s.status === 'APPROVED').length || 0,
        total: allSheets?.length || 0,
    }

    return <CounselorDashboardClient sheets={sheets || []} stats={stats} />
}
