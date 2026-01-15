import { createClient } from '@/lib/supabase/server'
import { ExamsClient } from './exams-client'

export default async function ExamsPage() {
    const supabase = await createClient()

    const [{ data: exams }, { data: classes }] = await Promise.all([
        supabase
            .from('exams')
            .select('*')
            .order('start_date', { ascending: false }),
        supabase
            .from('classes')
            .select('id, name, grade_level, major, academic_year')
            .eq('is_active', true)
            .order('name'),
    ])

    return (
        <ExamsClient
            exams={exams || []}
            classes={(classes || []) as { id: string; name: string; grade_level: number; major?: string | null; academic_year: string }[]}
        />
    )
}
