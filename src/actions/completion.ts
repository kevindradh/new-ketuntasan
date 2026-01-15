'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ========== TOGGLE COMPLETION ITEM ==========
export async function bulkMarkComplete(items: { itemId: string; notes?: string }[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Validate ownership for ALL items (simple check: if count matches)
    // For efficiency, we just assume client is correct but Supabase RLS would block if not owned?
    // Actually, completion_items RLS usually allows UPDATE if teacher_id = auth.uid()
    // We will loop for now as bulk updates in Supabase are tricky without a custom function or RPC

    // Better: Filter items by teacher_id first
    // Since we need to save distinct notes, we iterate.
    // To be safe and reasonably fast:

    // Use Promise.all to handle updates in parallel
    const results = await Promise.all(items.map(async (item) => {
        // Update and select related data for notification
        const { data: updatedItem, error } = await supabase
            .from('completion_items')
            .update({
                is_completed: true,
                completed_by: user.id,
                completed_at: new Date().toISOString(),
                notes: item.notes,
            })
            .eq('id', item.itemId)
            .eq('teacher_id', user.id)
            .select('*, completion_sheets(student_id)')
            .single()

        if (error || !updatedItem) return error

        // Send notification to student
        await supabase.from('notifications').insert({
            user_id: updatedItem.completion_sheets.student_id,
            type: 'SUBJECT_COMPLETED',
            title: 'Mata Pelajaran Tuntas',
            message: 'Guru telah menandai ketuntasan mata pelajaran Anda via Batch Approval',
            metadata: { completion_item_id: item.itemId },
        })

        return null
    }))

    const errors = results.filter(e => e !== null)
    if (errors.length > 0) return { error: 'Beberapa item gagal diperbarui' }

    revalidatePath('/teacher/completion-sheets')
    return { success: true }
}

export async function toggleCompletionItem(itemId: string, notes?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get current item
    const { data: item, error: getError } = await supabase
        .from('completion_items')
        .select('*, completion_sheets(student_id)')
        .eq('id', itemId)
        .single()

    if (getError || !item) return { error: 'Item tidak ditemukan' }

    // Check if user is the teacher for this subject
    if (item.teacher_id !== user.id) {
        return { error: 'Anda tidak berhak mengubah item ini' }
    }

    // Toggle completion
    const newCompleted = !item.is_completed
    const { error: updateError } = await supabase
        .from('completion_items')
        .update({
            is_completed: newCompleted,
            completed_by: newCompleted ? user.id : null,
            completed_at: newCompleted ? new Date().toISOString() : null,
            notes: notes || item.notes,
        })
        .eq('id', itemId)

    if (updateError) return { error: updateError.message }

    // Send notification to student if completed
    if (newCompleted) {
        await supabase.from('notifications').insert({
            user_id: item.completion_sheets.student_id,
            type: 'SUBJECT_COMPLETED',
            title: 'Mata Pelajaran Tuntas',
            message: 'Guru telah menandai ketuntasan salah satu mata pelajaran Anda',
            metadata: { completion_item_id: itemId },
        })
    }

    revalidatePath('/teacher/completion-sheets')
    return { success: true }
}

// ========== HOMEROOM APPROVAL ==========
export async function approveAsHomeroom(sheetId: string, notes?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get sheet and verify
    const { data: sheet, error: getError } = await supabase
        .from('completion_sheets')
        .select('*, classes(homeroom_teacher_id)')
        .eq('id', sheetId)
        .single()

    if (getError || !sheet) return { error: 'Lembar ketuntasan tidak ditemukan' }

    // Check if user is homeroom teacher
    if (sheet.classes.homeroom_teacher_id !== user.id) {
        return { error: 'Anda bukan wali kelas untuk siswa ini' }
    }

    // Check if all subjects completed
    if (!sheet.all_subjects_completed) {
        return { error: 'Belum semua mata pelajaran tuntas' }
    }

    // Update approval
    const { error: updateError } = await supabase
        .from('completion_sheets')
        .update({
            homeroom_approved: true,
            homeroom_approved_by: user.id,
            homeroom_approved_at: new Date().toISOString(),
            homeroom_notes: notes,
            status: 'COUNSELOR_REVIEW',
        })
        .eq('id', sheetId)

    if (updateError) return { error: updateError.message }

    // Get counselor
    const { data: counselors } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'COUNSELOR')
        .limit(1)

    // Send notifications
    await supabase.from('notifications').insert([
        {
            user_id: sheet.student_id,
            type: 'HOMEROOM_APPROVED',
            title: 'Wali Kelas Menyetujui',
            message: 'Lembar ketuntasan Anda telah disetujui wali kelas, menunggu approval Guru BK',
            metadata: { completion_sheet_id: sheetId },
        },
        ...(counselors?.map(c => ({
            user_id: c.user_id,
            type: 'HOMEROOM_APPROVED',
            title: 'Menunggu Approval Final',
            message: 'Ada siswa yang memerlukan approval final dari Anda',
            metadata: { completion_sheet_id: sheetId },
        })) || []),
    ])

    revalidatePath('/homeroom/approval')
    return { success: true }
}

export async function rejectAsHomeroom(sheetId: string, reason: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: sheet } = await supabase
        .from('completion_sheets')
        .select('student_id')
        .eq('id', sheetId)
        .single()

    if (!sheet) return { error: 'Lembar ketuntasan tidak ditemukan' }

    // Update status
    const { error } = await supabase
        .from('completion_sheets')
        .update({
            homeroom_approved: false,
            homeroom_notes: reason,
            status: 'IN_PROGRESS',
        })
        .eq('id', sheetId)

    if (error) return { error: error.message }

    // Notify student
    await supabase.from('notifications').insert({
        user_id: sheet.student_id,
        type: 'HOMEROOM_REJECTED',
        title: 'Lembar Ketuntasan Ditolak',
        message: `Wali kelas menolak lembar ketuntasan: ${reason}`,
        metadata: { completion_sheet_id: sheetId },
    })

    revalidatePath('/homeroom/approval')
    return { success: true }
}

// ========== COUNSELOR APPROVAL ==========
export async function approveAsCounselor(sheetId: string, notes?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get sheet
    const { data: sheet, error: getError } = await supabase
        .from('completion_sheets')
        .select('*')
        .eq('id', sheetId)
        .single()

    if (getError || !sheet) return { error: 'Lembar ketuntasan tidak ditemukan' }

    // Check if homeroom approved
    if (!sheet.homeroom_approved) {
        return { error: 'Wali kelas belum menyetujui' }
    }

    // Update approval
    const { error: updateError } = await supabase
        .from('completion_sheets')
        .update({
            counselor_approved: true,
            counselor_approved_by: user.id,
            counselor_approved_at: new Date().toISOString(),
            counselor_notes: notes,
            status: 'APPROVED',
        })
        .eq('id', sheetId)

    if (updateError) return { error: updateError.message }

    // Notify student
    await supabase.from('notifications').insert({
        user_id: sheet.student_id,
        type: 'COUNSELOR_APPROVED',
        title: 'Lembar Ketuntasan Disetujui!',
        message: 'Selamat! Anda sudah dapat mengikuti ujian. Silakan download lembar ketuntasan.',
        metadata: { completion_sheet_id: sheetId },
    })

    revalidatePath('/counselor/approval')
    return { success: true }
}

export async function rejectAsCounselor(sheetId: string, reason: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: sheet } = await supabase
        .from('completion_sheets')
        .select('student_id')
        .eq('id', sheetId)
        .single()

    if (!sheet) return { error: 'Lembar ketuntasan tidak ditemukan' }

    // Update status
    const { error } = await supabase
        .from('completion_sheets')
        .update({
            counselor_approved: false,
            counselor_notes: reason,
            status: 'IN_PROGRESS',
        })
        .eq('id', sheetId)

    if (error) return { error: error.message }

    // Notify student
    await supabase.from('notifications').insert({
        user_id: sheet.student_id,
        type: 'COUNSELOR_REJECTED',
        title: 'Lembar Ketuntasan Ditolak',
        message: `Guru BK menolak lembar ketuntasan: ${reason}`,
        metadata: { completion_sheet_id: sheetId },
    })

    revalidatePath('/counselor/approval')
    return { success: true }
}
