'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeNotifications } from '@/hooks/use-notifications'
import type { UserRole } from '@/types/database'

interface DashboardClientProps {
    user: {
        id: string
        full_name: string
        email: string
        avatar_url?: string
        roles: UserRole[]
    }
    children: React.ReactNode
}

export function DashboardClient({ user, children }: DashboardClientProps) {
    const router = useRouter()
    const { unreadCount } = useRealtimeNotifications(user?.id || null)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar
                user={user}
                onSignOut={handleSignOut}
                notificationCount={unreadCount}
            />
            <main className="flex-1 lg:ml-0">
                {children}
            </main>
        </div>
    )
}
