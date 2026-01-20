'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database'
import { toast } from 'sonner'

export function useRealtimeNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        // Register Service Worker and Request Permission
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered:', registration)
                })
                .catch((err) => {
                    console.log('SW registration failed:', err)
                })

            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission()
            }
        }

        const supabase = createClient()

        // Fetch initial notifications
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) setNotifications(data)
            setLoading(false)
        }

        fetchNotifications()

        // Subscribe to new notifications
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                async (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications((prev) => [newNotif, ...prev])

                    // Show toast
                    toast(newNotif.title, {
                        description: newNotif.message,
                    })

                    // Show Service Worker Notification (System Notification)
                    if (
                        typeof window !== 'undefined' &&
                        'serviceWorker' in navigator &&
                        'Notification' in window &&
                        Notification.permission === 'granted'
                    ) {
                        try {
                            const registration = await navigator.serviceWorker.ready
                            registration.showNotification(newNotif.title, {
                                body: newNotif.message,
                                icon: '/icon.png', // Fallback or use specific icon
                                tag: newNotif.id,
                            })
                        } catch (e) {
                            console.error('Failed to show system notification', e)
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const markAsRead = async (notificationId: string) => {
        const supabase = createClient()
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId)

        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, is_read: true } : n
            )
        )
    }

    const markAllAsRead = async () => {
        if (!userId) return

        const supabase = createClient()
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('is_read', false)

        setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
        )
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    }
}
