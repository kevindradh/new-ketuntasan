'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    Users,
    School,
    ClipboardCheck,
    FileText,
    UserCheck,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import type { UserRole } from '@/types/database'

interface SidebarProps {
    user: {
        full_name: string
        email: string
        avatar_url?: string
        roles: UserRole[]
    }
    onSignOut: () => void
    notificationCount?: number
}

const roleMenus: Record<UserRole, { label: string; href: string; icon: React.ElementType }[]> = {
    ADMIN: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Ujian', href: '/admin/exams', icon: FileText },
        { label: 'Mata Pelajaran', href: '/admin/subjects', icon: BookOpen },
        { label: 'Kelas', href: '/admin/classes', icon: School },
        { label: 'Pengajaran', href: '/admin/teachers', icon: Users },
    ],
    TEACHER: [
        { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
        { label: 'Lembar Ketuntasan', href: '/teacher/completion-sheets', icon: ClipboardCheck },
    ],
    HOMEROOM: [
        { label: 'Dashboard', href: '/homeroom', icon: LayoutDashboard },
        { label: 'Approval', href: '/homeroom/approval', icon: UserCheck },
    ],
    COUNSELOR: [
        { label: 'Dashboard', href: '/counselor', icon: LayoutDashboard },
        { label: 'Final Approval', href: '/counselor/approval', icon: UserCheck },
    ],
    STUDENT: [
        { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    ],
}

const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    TEACHER: 'Guru Mata Pelajaran',
    HOMEROOM: 'Wali Kelas',
    COUNSELOR: 'Guru BK',
    STUDENT: 'Siswa',
}

const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    HOMEROOM: 'bg-green-100 text-green-700',
    COUNSELOR: 'bg-purple-100 text-purple-700',
    STUDENT: 'bg-amber-100 text-amber-700',
}

export function Sidebar({ user, onSignOut, notificationCount = 0 }: SidebarProps) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    // Get all menus for user's roles
    const allMenus = user.roles.flatMap(role => roleMenus[role] || [])
    // Remove duplicates based on href
    const uniqueMenus = allMenus.filter((menu, index, self) =>
        index === self.findIndex(m => m.href === menu.href)
    )

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
                <Link href="/" className="flex items-center gap-3">
                    <div className="p-2 rounded-xl gradient-primary">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Si-Tuntas
                    </span>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="gradient-primary text-white font-medium">
                            {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                    {user.roles.map(role => (
                        <Badge key={role} variant="secondary" className={cn('text-xs', roleColors[role])}>
                            {roleLabels[role]}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="px-3 space-y-1">
                    {uniqueMenus.map((menu) => {
                        const isActive = pathname === menu.href || pathname.startsWith(menu.href + '/')
                        return (
                            <Link
                                key={menu.href}
                                href={menu.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                )}
                            >
                                <menu.icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-slate-400')} />
                                {menu.label}
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-200 space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                    <Settings className="h-5 w-5 text-slate-400" />
                    Pengaturan
                </Link>
                <button
                    onClick={onSignOut}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut className="h-5 w-5" />
                    Keluar
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg gradient-primary">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-blue-600">Si-Tuntas</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback className="gradient-primary text-white text-xs">
                                            {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{user.full_name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onSignOut}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
        </>
    )
}
