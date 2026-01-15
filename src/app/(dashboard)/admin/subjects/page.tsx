import { createClient } from '@/lib/supabase/server'
import { SubjectsClient } from './subjects-client'

export default async function SubjectsPage() {
    const supabase = await createClient()

    const { data: subjects } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

    return <SubjectsClient subjects={subjects || []} />
}
