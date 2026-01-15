'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ========== SUBJECTS ==========
export async function createSubject(formData: FormData) {
    const supabase = await createClient()

    const { error } = await supabase.from('subjects').insert({
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string || null,
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/subjects')
    return { success: true }
}

export async function updateSubject(id: string, formData: FormData) {
    const supabase = await createClient()

    const { error } = await supabase.from('subjects').update({
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string || null,
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/subjects')
    return { success: true }
}

export async function deleteSubject(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('subjects').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/subjects')
    return { success: true }
}

// ========== CLASSES ==========
export async function createClass(formData: FormData) {
    const supabase = await createClient()

    const { error } = await supabase.from('classes').insert({
        name: formData.get('name') as string,
        grade_level: parseInt(formData.get('grade_level') as string),
        major: formData.get('major') as string || null,
        academic_year: formData.get('academic_year') as string,
        homeroom_teacher_id: formData.get('homeroom_teacher_id') as string || null,
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/classes')
    return { success: true }
}

export async function updateClass(id: string, formData: FormData) {
    const supabase = await createClient()

    const { error } = await supabase.from('classes').update({
        name: formData.get('name') as string,
        grade_level: parseInt(formData.get('grade_level') as string),
        major: formData.get('major') as string || null,
        academic_year: formData.get('academic_year') as string,
        homeroom_teacher_id: formData.get('homeroom_teacher_id') as string || null,
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/classes')
    return { success: true }
}

export async function deleteClass(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('classes').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/classes')
    return { success: true }
}

// ========== TEACHER ASSIGNMENTS ==========
export async function createTeacherAssignment(formData: FormData) {
    const supabase = await createClient()

    const { error } = await supabase.from('teacher_assignments').insert({
        teacher_id: formData.get('teacher_id') as string,
        subject_id: formData.get('subject_id') as string,
        class_id: formData.get('class_id') as string,
        academic_year: formData.get('academic_year') as string,
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/teachers')
    return { success: true }
}

export async function deleteTeacherAssignment(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('teacher_assignments').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/teachers')
    return { success: true }
}

// ========== EXAMS ==========
export async function createExam(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('exams').insert({
        name: formData.get('name') as string,
        exam_type: formData.get('exam_type') as string,
        academic_year: formData.get('academic_year') as string,
        grade_level: parseInt(formData.get('grade_level') as string),
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        created_by: user?.id,
    }).select().single()

    if (error) return { error: error.message }

    revalidatePath('/admin/exams')
    return { success: true, data }
}

export async function updateExam(id: string, formData: FormData) {
    const supabase = await createClient()

    const { error } = await supabase.from('exams').update({
        name: formData.get('name') as string,
        exam_type: formData.get('exam_type') as string,
        academic_year: formData.get('academic_year') as string,
        grade_level: parseInt(formData.get('grade_level') as string),
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/exams')
    return { success: true }
}

export async function deleteExam(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('exams').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/exams')
    return { success: true }
}

// ========== GENERATE COMPLETION SHEETS ==========
export async function generateCompletionSheets(examId: string, classIds: string[]) {
    const supabase = await createClient()

    // Get exam details
    const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single()

    if (examError || !exam) return { error: 'Ujian tidak ditemukan' }

    let totalCreated = 0

    for (const classId of classIds) {
        // Get class details
        const { data: classData } = await supabase
            .from('classes')
            .select('*, class_students(student_id)')
            .eq('id', classId)
            .single()

        if (!classData) continue

        // Create completion sheet for each student
        for (const enrollment of classData.class_students || []) {
            // Check if sheet already exists
            const { data: existing } = await supabase
                .from('completion_sheets')
                .select('id')
                .eq('exam_id', examId)
                .eq('student_id', enrollment.student_id)
                .single()

            if (existing) continue

            // Create completion sheet
            const { data: sheet, error: sheetError } = await supabase
                .from('completion_sheets')
                .insert({
                    exam_id: examId,
                    student_id: enrollment.student_id,
                    class_id: classId,
                    status: 'IN_PROGRESS',
                })
                .select()
                .single()

            if (sheetError || !sheet) continue

            // Generate completion items
            await supabase.rpc('generate_completion_items', {
                p_completion_sheet_id: sheet.id,
                p_class_id: classId,
                p_academic_year: exam.academic_year,
            })

            // Notify student
            await supabase.from('notifications').insert({
                user_id: enrollment.student_id,
                type: 'SHEET_CREATED',
                title: 'Lembar Ketuntasan Dibuat',
                message: `Lembar ketuntasan untuk ${exam.name} telah dibuat. Silakan pantau progress Anda.`,
                metadata: { completion_sheet_id: sheet.id, exam_id: examId },
            })

            totalCreated++
        }
    }

    revalidatePath('/admin/exams')
    return { success: true, totalCreated }
}

// ========== CLASS STUDENTS ==========
export async function addStudentToClass(formData: FormData) {
    // const supabase = await createClient() -> Switch to Admin for RLS bypass
    const supabaseAdmin = createAdminClient()
    const studentId = formData.get('student_id') as string
    const classId = formData.get('class_id') as string

    // 1. Check if student is already enrolled in ANY class
    const { data: existingEnrollment } = await supabaseAdmin
        .from('class_students')
        .select('class_id, class:classes(name)')
        .eq('student_id', studentId)
        .single()

    if (existingEnrollment) {
        // @ts-ignore
        const className = existingEnrollment.class?.name || 'kelas lain'
        return { error: `Siswa ini sudah terdaftar di ${className}. Siswa hanya boleh memiliki 1 kelas.` }
    }

    // 2. Add to class
    const { error } = await supabaseAdmin.from('class_students').insert({
        class_id: classId,
        student_id: studentId,
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/classes')
    revalidatePath(`/admin/classes/${classId}`) // Revalidate details page
    return { success: true }
}

export async function removeStudentFromClass(id: string) {
    // const supabase = await createClient() -> Switch to Admin for RLS bypass
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.from('class_students').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/classes')
    // Note: We can't revalidate the specific class page easily without the class ID here, 
    // unless we fetch it first or pass it. 
    // For now, nextjs cache usually handles it if we revalidate layout or if the page fetches fresh data.
    return { success: true }
}

import { createAdminClient } from '@/lib/supabase/admin'

// ========== STUDENTS ==========
export async function createStudent(formData: FormData) {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const nisn = formData.get('nisn') as string
    const phone = formData.get('phone') as string

    // Default password for new students (in a real app, use email invite or random password)
    const password = "siswa" + (nisn || "12345")

    // 1. Create Auth User
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
        }
    })

    if (authError) return { error: `Gagal membuat user: ${authError.message}` }
    if (!userData.user) return { error: "Gagal membuat user: Data user tidak kembali" }

    const userId = userData.user.id

    // 2. Insert into Profiles (if trigger doesn't handle it or to ensure data)
    // Note: If you have a trigger on auth.users -> profiles, this might fail with duplicate key.
    // We should safely upsert or checking if trigger exists.
    // Assuming standard starter kit trigger: it usually inserts id, raw_user_meta_data info.
    // Let's try to update the profile with specific fields that might not be in metadata (like nisn, phone)

    // Wait for a moment for trigger? Or just update.
    // Better: Update the profile that should exist (or insert if not).
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            full_name: fullName,
            email: email,
            nisn: nisn || null,
            phone: phone || null,
            updated_at: new Date().toISOString(),
        })

    if (profileError) {
        // Rollback auth user if profile fails? 
        // Ideally yes, but for now we just return error.
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return { error: `Gagal membuat profil: ${profileError.message}` }
    }

    // 3. Assign Role
    const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
            user_id: userId,
            role: 'STUDENT'
        })

    if (roleError) {
        return { error: `Gagal assign role: ${roleError.message}` }
    }

    revalidatePath('/admin/students')
    return { success: true }
}

export async function updateStudent(id: string, formData: FormData) {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.from('profiles').update({
        full_name: formData.get('full_name') as string,
        nisn: formData.get('nisn') as string,
        phone: formData.get('phone') as string || null,
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
}

export async function deleteStudent(id: string) {
    const supabaseAdmin = createAdminClient()

    // Deleting the user from Auth will cascade to profiles (usually)
    // But let's be safe and delete using admin API which is the comprehensive way
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
}
