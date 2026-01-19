'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
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

// Path to breadcrumb mapping
const pathLabels: Record<string, string> = {
    admin: 'Admin',
    teacher: 'Guru',
    homeroom: 'Wali Kelas',
    counselor: 'Guru BK',
    exams: 'Ujian',
    subjects: 'Mata Pelajaran',
    classes: 'Kelas',
    students: 'Siswa',
    teachers: 'Guru',
    'completion-sheets': 'Lembar Ketuntasan',
    approval: 'Approval',
    assignments: 'Penugasan',
    settings: 'Pengaturan',
    notifications: 'Notifikasi',
}

export function DashboardClient({ user, children }: DashboardClientProps) {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)

    // Build breadcrumbs
    const breadcrumbs = pathSegments
        .map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/')
            const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
            const isLast = index === pathSegments.length - 1
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)

            return { href, label, isLast, isUuid }
        })
        .filter((crumb) => !crumb.isUuid)

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                {/* Header with breadcrumb */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, index) => (
                                <BreadcrumbItem key={crumb.href}>
                                    {index > 0 && <BreadcrumbSeparator />}
                                    {crumb.isLast ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* Main content */}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
