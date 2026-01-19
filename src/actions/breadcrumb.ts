'use server'

import { createClient } from '@/lib/supabase/server'

export type EntityType = 'teacher' | 'class' | 'subject' | 'exam'

export async function resolveEntityName(id: string, type: EntityType): Promise<string | null> {
    const supabase = await createClient()

    try {
        if (type === 'teacher') {
            const { data } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', id)
                .single()
            return data?.full_name || null
        }

        if (type === 'class') {
            const { data } = await supabase
                .from('classes')
                .select('name')
                .eq('id', id)
                .single()
            return data?.name || null
        }

        if (type === 'subject') {
            const { data } = await supabase
                .from('subjects')
                .select('name')
                .eq('id', id)
                .single()
            return data?.name || null
        }

        if (type === 'exam') {
            const { data } = await supabase
                .from('exams')
                .select('name')
                .eq('id', id)
                .single()
            return data?.name || null
        }

        return null
    } catch (error) {
        console.error('Error resolving entity name:', error)
        return null
    }
}
