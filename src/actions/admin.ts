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
        counselor_id: formData.get('counselor_id') as string || null,
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
        counselor_id: formData.get('counselor_id') as string || null,
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

export async function bulkAddStudentsToClass(classId: string, studentIds: string[]) {
    // const supabase = await createClient() -> Switch to Admin for RLS bypass
    const supabaseAdmin = createAdminClient()

    if (!studentIds || studentIds.length === 0) {
        return { error: 'Tidak ada siswa yang dipilih' }
    }

    // 1. Check valid students & existing enrollments
    // Ideally we should check if they are already enrolled in *another* class if that rule is strict.
    // However, for bulk add, let's assume the UI filters them well, but we can do a quick check.
    // For performance, we might skip detailed per-student checks or do a single query.

    const { data: existingEnrollments } = await supabaseAdmin
        .from('class_students')
        .select('student_id')
        .in('student_id', studentIds)

    // We strictly want to prevent students who are already in a class (any class)
    // If the requirement is unique class per student:
    const alreadyEnrolledIds = new Set(existingEnrollments?.map(e => e.student_id))
    const validStudentIds = studentIds.filter(id => !alreadyEnrolledIds.has(id))

    if (validStudentIds.length === 0) {
        return { error: 'Semua siswa yang dipilih sudah terdaftar di kelas lain (atau kelas ini)' }
    }

    // 2. Bulk Insert
    const rowsToInsert = validStudentIds.map(studentId => ({
        class_id: classId,
        student_id: studentId,
    }))

    const { error } = await supabaseAdmin.from('class_students').insert(rowsToInsert)

    if (error) return { error: error.message }

    revalidatePath('/admin/classes')
    revalidatePath(`/admin/classes/${classId}`)

    // Return explicit success with info on how many were added vs skipped
    const skippedCount = studentIds.length - validStudentIds.length
    if (skippedCount > 0) {
        return {
            success: true,
            message: `Berhasil menambahkan ${validStudentIds.length} siswa. ${skippedCount} siswa dilewati karena sudah punya kelas.`
        }
    }

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

// ========== TEACHERS ==========
export async function createTeacher(formData: FormData) {
    const supabaseAdmin = createAdminClient()

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    // Assuming 'nip' is stored in 'nisn' column or 'nip' column if it existed.
    // Based on grep, 'nip' might not exist. Let's stick to standard profile fields.
    // If the user wants NIP later, we can add it. For now, name/email/phone.
    // Default password for teachers
    const password = "guru" + (phone?.slice(-4) || "12345")

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

    // 2. Insert into Profiles
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            full_name: fullName,
            email: email,
            phone: phone || null,
            updated_at: new Date().toISOString(),
        })

    if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return { error: `Gagal membuat profil: ${profileError.message}` }
    }

    // 3. Assign Role
    const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
            user_id: userId,
            role: 'TEACHER'
        })

    if (roleError) {
        return { error: `Gagal assign role: ${roleError.message}` }
    }

    revalidatePath('/admin/teachers')
    return { success: true }
}

export async function updateTeacher(id: string, formData: FormData) {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.from('profiles').update({
        full_name: formData.get('full_name') as string,
        phone: formData.get('phone') as string || null,
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/teachers')
    return { success: true }
}

export async function deleteTeacher(id: string) {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) return { error: error.message }

    revalidatePath('/admin/teachers')
    return { success: true }
}

// ========== STUDENTS ==========
export async function createStudent(formData: FormData) {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const nis = formData.get('nis') as string
    const nisn = formData.get('nisn') as string
    const phone = formData.get('phone') as string
    const status = (formData.get('status') as string) || 'ACTIVE'

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

    // 2. Insert into Profiles
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            full_name: fullName,
            email: email,
            nis: nis || null,
            nisn: nisn || null,
            phone: phone || null,
            status: status,
            updated_at: new Date().toISOString(),
        })

    if (profileError) {
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

    // 4. Enroll in Class (Optional)
    const classId = formData.get('class_id') as string
    if (classId) {
        const { error: enrollError } = await supabaseAdmin
            .from('class_students')
            .insert({
                class_id: classId,
                student_id: userId
            })

        if (enrollError) {
            console.error("Failed to auto-enroll student:", enrollError)
        }
    }

    revalidatePath('/admin/students')
    if (classId) revalidatePath(`/admin/classes/${classId}`)

    return { success: true }
}

export async function updateStudent(id: string, formData: FormData) {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.from('profiles').update({
        full_name: formData.get('full_name') as string,
        nisn: formData.get('nisn') as string,
        phone: formData.get('phone') as string || null,
        status: formData.get('status') as string,
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
}

export async function bulkUpdateStudentStatus(studentIds: string[], status: string) {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ status: status })
        .in('id', studentIds)

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

// ========== PASSWORD RESET ==========
export async function resetUserPassword(userId: string, newPassword: string) {
    try {
        const supabaseAdmin = createAdminClient()

        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword
        })

        if (error) return { error: error.message }

        return { success: true }
    } catch (err: any) {
        console.error('Reset password error:', err)
        return { error: `Gagal mereset password: ${err.message || 'Terjadi kesalahan sistem'}` }
    }
}

export async function createStudentsBulk(students: any[]) {
    const supabaseAdmin = createAdminClient()
    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
    }

    // Process in batches to avoid overwhelming the Auth API
    // Small batch size because parallel createUsers might hit rate limits
    const batchSize = 5
    for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize)

        await Promise.all(batch.map(async (student) => {
            try {
                const email = student.email
                const fullName = student.full_name
                const nis = student.nis
                const nisn = student.nisn
                const phone = student.phone
                const status = student.status || 'ACTIVE'
                const password = student.password || "siswa" + (nis || "12345")
                const classId = student.class_id

                // 1. Create Auth User
                const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: { full_name: fullName }
                })

                if (authError) throw new Error(`Auth error: ${authError.message}`)
                if (!userData.user) throw new Error("No user data returned")

                const userId = userData.user.id

                // 2. Insert Profile
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name: fullName,
                        email: email,
                        nis: nis || null,
                        nisn: nisn || null,
                        phone: phone || null,
                        status: status,
                        updated_at: new Date().toISOString(),
                    })

                if (profileError) {
                    // Try to rollback user creation
                    await supabaseAdmin.auth.admin.deleteUser(userId)
                    throw new Error(`Profile error: ${profileError.message}`)
                }

                // 3. Assign Role
                const { error: roleError } = await supabaseAdmin
                    .from('user_roles')
                    .insert({ user_id: userId, role: 'STUDENT' })

                if (roleError) throw new Error(`Role error: ${roleError.message}`)

                // 4. Enroll in Class
                if (classId) {
                    const { error: enrollError } = await supabaseAdmin
                        .from('class_students')
                        .insert({ class_id: classId, student_id: userId })

                    if (enrollError) console.error(`Enroll error for ${email}:`, enrollError)
                }

                results.success++
            } catch (err: any) {
                results.failed++
                results.errors.push(`${student.full_name} (${student.email}): ${err.message}`)
            }
        }))
    }

    revalidatePath('/admin/students')
    revalidatePath('/admin/classes')
    return { success: true, results }
}

// ========== PROMOTIONS ==========
export async function getStudentsByClass(classId: string) {
    const supabase = await createClient()

    const { data: students, error } = await supabase
        .from('class_students')
        .select(`
            student_id,
            student:profiles!student_id(
                id,
                full_name,
                nis,
                nisn
            )
        `)
        .eq('class_id', classId)

    if (error) throw new Error(error.message)

    // Flatten and return
    return students.map((s: any) => s.student).sort((a: any, b: any) => a.full_name.localeCompare(b.full_name))
}

export async function promoteStudents(studentIds: string[], targetClassId: string) {
    const supabaseAdmin = createAdminClient()

    if (!studentIds.length) return { error: 'Tidak ada siswa yang dipilih' }
    if (!targetClassId) return { error: 'Kelas tujuan harus dipilih' }

    // 0. Validation: Fetch Class Details
    const { data: targetClass } = await supabaseAdmin.from('classes').select('grade_level, major, academic_year').eq('id', targetClassId).single()

    // We need the source class. We can get it from the *current* enrollment of the first student.
    // Assuming all selected students are from the same source class (which UI ensures).
    const { data: firstStudentEnrollment } = await supabaseAdmin.from('class_students').select('class_id, class:classes(grade_level, major, academic_year)').eq('student_id', studentIds[0]).single()

    if (!targetClass) return { error: 'Kelas tujuan tidak valid' }
    if (!firstStudentEnrollment || !firstStudentEnrollment.class) {
        // Technically possible if student has no class, but promotion implies moving FROM a class.
        // If "new student" assignment, use addStudentToClass instead.
        return { error: 'Data kelas asal tidak ditemukan' }
    }

    const rawClass = firstStudentEnrollment.class
    // @ts-ignore
    const sourceClass = Array.isArray(rawClass) ? rawClass[0] : rawClass

    // Rule 1: Same Major
    if (sourceClass.major && sourceClass.major !== targetClass.major) {
        return { error: `Jurusan tidak sesuai. Asal: ${sourceClass.major}, Tujuan: ${targetClass.major}` }
    }

    // Rule 2: Higher Grade
    if (targetClass.grade_level <= sourceClass.grade_level) {
        return { error: 'Kelas tujuan harus lebih tinggi dari kelas asal.' }
    }

    // Rule 3: Newer Year
    const getYearStart = (ay: string) => parseInt(ay.split('/')[0])
    if (getYearStart(targetClass.academic_year) <= getYearStart(sourceClass.academic_year)) {
        return { error: 'Tahun ajaran kelas tujuan harus lebih baru.' }
    }


    // 1. Check for existing enrollment in target class to prevent duplicates
    const { data: existing } = await supabaseAdmin
        .from('class_students')
        .select('student_id')
        .eq('class_id', targetClassId)
        .in('student_id', studentIds)

    const existingIds = new Set(existing?.map(e => e.student_id))
    const toInsert = studentIds
        .filter(id => !existingIds.has(id))
        .map(id => ({
            class_id: targetClassId,
            student_id: id
        }))

    if (toInsert.length === 0) {
        return { success: true, message: 'Semua siswa sudah terdaftar di kelas tujuan.' }
    }

    // 2. Insert new enrollments
    const { error } = await supabaseAdmin
        .from('class_students')
        .insert(toInsert)

    if (error) return { error: error.message }

    revalidatePath('/admin/classes')
    return { success: true, count: toInsert.length }
}

// ========== USER ROLES ==========
export async function toggleCounselorRole(userId: string, isCounselor: boolean) {
    const supabase = await createClient()

    if (isCounselor) {
        // Add role
        const { error } = await supabase.from('user_roles').upsert({
            user_id: userId,
            role: 'COUNSELOR'
        }, { onConflict: 'user_id, role' })

        if (error) return { error: 'Gagal menambahkan role Guru BK: ' + error.message }
    } else {
        // Remove role
        const { error } = await supabase.from('user_roles').delete()
            .eq('user_id', userId)
            .eq('role', 'COUNSELOR')

        if (error) return { error: 'Gagal menghapus role Guru BK: ' + error.message }
    }

    revalidatePath('/admin/teachers')
    return { success: true }
}
