import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get profile with roles
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

    const userData = {
        ...profile,
        roles: roles?.map(r => r.role) || [],
    }

    return <DashboardClient user={userData}>{children}</DashboardClient>
}
