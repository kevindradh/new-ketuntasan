import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentMobileApp } from './student-mobile-app'

export default async function StudentPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get current class membership
    const { data: classStudent } = await supabase
        .from('class_students')
        .select(`
            class:classes(id, name, grade_level, major)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Get completion sheets for this student
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


    // Handle potential array response from Supabase relation
    const rawClass = classStudent?.class
    const currentClassData = Array.isArray(rawClass) ? rawClass[0] : rawClass

    // Normalize sheets data to handle potential array returns from Supabase joins
    const formattedSheets = sheets?.map(sheet => ({
        ...sheet,
        homeroom_approver: Array.isArray(sheet.homeroom_approver) ? sheet.homeroom_approver[0] : sheet.homeroom_approver,
        counselor_approver: Array.isArray(sheet.counselor_approver) ? sheet.counselor_approver[0] : sheet.counselor_approver,
        completion_items: sheet.completion_items?.map((item: any) => ({
            ...item,
            teacher: Array.isArray(item.teacher) ? item.teacher[0] : item.teacher,
            subject: Array.isArray(item.subject) ? item.subject[0] : item.subject
        }))
    })) || []

    return (
        <StudentMobileApp
            profile={profile}
            currentClass={currentClassData as { name: string; grade_level: number; major: string } | null}
            sheets={formattedSheets}
        />
    )
}
