import { createClient } from '@/lib/supabase/server'
import { ClassesClient } from './classes-client'

export default async function ClassesPage() {
    const supabase = await createClient()

    const { data: teacherRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['TEACHER', 'HOMEROOM'])

    const teacherIds = teacherRoles?.map(r => r.user_id) || []

    const [{ data: classes }, { data: teachers }] = await Promise.all([
        supabase
            .from('classes')
            .select(`
        *,
        homeroom_teacher:profiles!classes_homeroom_teacher_id_fkey(id, full_name),
        class_students(count)
      `)
            .order('name'),
        supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', teacherIds.length > 0 ? teacherIds : ['00000000-0000-0000-0000-000000000000']),
    ])

    return (
        <ClassesClient
            classes={classes || []}
            teachers={(teachers || []) as { id: string; full_name: string }[]}
        />
    )
}
