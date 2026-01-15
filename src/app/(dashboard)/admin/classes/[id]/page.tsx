import { createClient } from '@/lib/supabase/server'
import { ClassDetailsClient } from './class-details-client'
import { notFound } from 'next/navigation'

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Class Data
    const { data: classData, error } = await supabase
        .from('classes')
        .select(`
            *,
            homeroom_teacher:profiles!classes_homeroom_teacher_id_fkey(full_name)
        `)
        .eq('id', id)
        .single()

    if (error || !classData) {
        if (error) console.error("Error fetching class:", JSON.stringify(error, null, 2))
        notFound()
    }

    // 2. Fetch Enrolled Students
    const { data: enrolledData } = await supabase
        .from('class_students')
        .select(`
            id,
            student:profiles!class_students_student_id_fkey(*)
        `)
        .eq('class_id', id)
        .order('created_at')

    // 3. Fetch All Available Students (Not in any class)
    // First, find all students who are already in ANY class
    const { data: alreadyEnrolled } = await supabase
        .from('class_students')
        .select('student_id')

    const alreadyEnrolledIds = new Set(alreadyEnrolled?.map(e => e.student_id))

    // Fetch all students with role 'STUDENT'
    const { data: studentRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'STUDENT')

    const allStudentIds = studentRoles?.map(r => r.user_id) || []

    // Filter IDs: must be student role AND not in alreadyEnrolledIds
    const availableStudentIds = allStudentIds.filter(studentId => !alreadyEnrolledIds.has(studentId))

    const { data: allStudents } = await supabase
        .from('profiles')
        .select('*')
        .in('id', availableStudentIds.length > 0 ? availableStudentIds : ['00000000-0000-0000-0000-000000000000'])
        .order('full_name')

    // Transform enrolled data to match component expectation
    const enrolledStudents = (enrolledData || []).map(item => ({
        id: item.id,
        // @ts-ignore: Supabase types complexity with joins
        student: item.student
    }))

    return (
        <ClassDetailsClient
            classData={classData}
            // @ts-ignore
            enrolledStudents={enrolledStudents}
            allStudents={allStudents || []}
        />
    )
}
