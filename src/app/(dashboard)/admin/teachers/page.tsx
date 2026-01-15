import { createClient } from '@/lib/supabase/server'
import { TeachersClient } from './teachers-client'

export default async function TeachersPage() {
    const supabase = await createClient()

    const { data: teacherRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'TEACHER')

    const teacherIds = teacherRoles?.map(r => r.user_id) || []

    const [{ data: assignments }, { data: teachers }, { data: subjects }, { data: classes }] = await Promise.all([
        supabase
            .from('teacher_assignments')
            .select(`
        *,
        teacher:profiles!teacher_assignments_teacher_id_fkey(id, full_name),
        subject:subjects(id, name, code),
        class:classes(id, name)
      `)
            .order('created_at', { ascending: false }),
        supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', teacherIds.length > 0 ? teacherIds : ['00000000-0000-0000-0000-000000000000']),
        supabase.from('subjects').select('id, name, code').eq('is_active', true),
        supabase.from('classes').select('id, name, academic_year').eq('is_active', true),
    ])

    return (
        <TeachersClient
            assignments={(assignments || []) as any}
            teachers={(teachers || []) as { id: string; full_name: string }[]}
            subjects={(subjects || []) as { id: string; name: string; code: string }[]}
            classes={(classes || []) as { id: string; name: string; academic_year: string }[]}
        />
    )
}
