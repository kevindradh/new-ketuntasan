
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { PromotionWizard } from "./promotion-wizard"

export const metadata: Metadata = {
    title: "Kenaikan Kelas | Admin Dashboard",
    description: "Menu proses kenaikan kelas siswa",
}

export default async function PromotionsPage() {
    const supabase = await createClient()

    // Fetch classes ordered by name (or logic: grade_level asc, name asc)
    // We fetch all active classes
    const { data: classes } = await supabase
        .from('classes')
        .select('id, name, grade_level, academic_year, major')
        .order('name', { ascending: true })
    // .eq('is_active', true) // assuming we only promote between active classes

    return (
        <div className="space-y-6">
            <PromotionWizard classes={classes || []} />
        </div>
    )
}
