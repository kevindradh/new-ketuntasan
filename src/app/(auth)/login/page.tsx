'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, Eye, EyeOff, Shield, BookOpen, Users, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Role priority for redirect
const rolePriority: Record<string, string> = {
    ADMIN: '/admin',
    TEACHER: '/teacher',
    HOMEROOM: '/homeroom',
    COUNSELOR: '/counselor',
    STUDENT: '/student',
}

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [openDemo, setOpenDemo] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (error) {
                toast.error(error.message)
                return
            }

            // Get user roles to determine redirect
            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', authData.user?.id)

            // Determine redirect path based on highest priority role
            let redirectPath = '/admin' // default fallback
            if (roles && roles.length > 0) {
                const userRoles = roles.map(r => r.role)
                // Check roles in priority order
                for (const role of ['ADMIN', 'TEACHER', 'HOMEROOM', 'COUNSELOR', 'STUDENT']) {
                    if (userRoles.includes(role)) {
                        redirectPath = rolePriority[role]
                        break
                    }
                }
            }

            toast.success('Berhasil masuk!')
            router.push(redirectPath)
            router.refresh()
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const fillDemo = (email: string) => {
        setFormData({ email, password: 'password123' })
        setOpenDemo(false)
        toast.info('Akun demo dipilih. Silakan klik Masuk.')
    }

    return (
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm w-full max-w-md mx-4 sm:mx-auto">
            <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl gradient-primary shadow-lg shadow-blue-500/25">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
                <CardDescription>Masuk ke akun e-Tuntas Anda</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nama@sekolah.sch.id"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-11 gradient-primary border-0 font-medium" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Masuk
                    </Button>
                </form>

                {/* Demo Dialog Trigger */}
                <div className="mt-6">
                    <Dialog open={openDemo} onOpenChange={setOpenDemo}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full h-11 border-dashed border-2 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50">
                                <Shield className="mr-2 h-4 w-4" />
                                Mode Demo (Development)
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Pilih Akun Demo</DialogTitle>
                                <DialogDescription>
                                    Klik salah satu akun di bawah untuk mengisi form login secara otomatis.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
                                <button
                                    onClick={() => fillDemo('admin@demo.situntas.id')}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">Administrator</div>
                                        <div className="text-xs text-slate-500">Full Access</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => fillDemo('budi@demo.situntas.id')}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">Guru Mapel</div>
                                        <div className="text-xs text-slate-500">Input Nilai & Ketuntasan</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => fillDemo('dewi@demo.situntas.id')}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">Wali Kelas</div>
                                        <div className="text-xs text-slate-500">Review & Approval</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => fillDemo('wahyu@demo.situntas.id')}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">Guru BK</div>
                                        <div className="text-xs text-slate-500">Final Approval</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => fillDemo('andi@demo.situntas.id')}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">Siswa</div>
                                        <div className="text-xs text-slate-500">View Progress & Download</div>
                                    </div>
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
            <div className="text-center text-sm text-slate-600 pb-6">
                Sistem Tertutup &copy; 2026 e-Tuntas
            </div>
        </Card>
    )
}
