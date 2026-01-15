import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
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

    // Get roles
    const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

    const userRoles = roles?.map(r => r.role) || []

    // Check if user is a student
    if (!userRoles.includes('STUDENT')) {
        redirect('/admin')
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {children}
        </div>
    )
}
