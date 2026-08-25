'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { Notification } from '@/types/database'
import { formatDistanceToNow } from '@/lib/utils'

interface HeaderProps {
    title: string
    description?: string
    notifications: Notification[]
    unreadCount: number
    onMarkAsRead: (id: string) => void
    onMarkAllAsRead: () => void
}

export function Header({
    title,
    description,
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
}: HeaderProps) {
    return (
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="relative">
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifikasi</span>
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs h-auto py-1">
                                    Tandai semua dibaca
                                </Button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <ScrollArea className="h-80">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">
                                    Tidak ada notifikasi
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <DropdownMenuItem
                                        key={notif.id}
                                        className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                        onClick={() => onMarkAsRead(notif.id)}
                                    >
                                        <div className="flex items-start gap-2 w-full">
                                            {!notif.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{notif.title}</p>
                                                <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {formatDistanceToNow(new Date(notif.created_at))}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
