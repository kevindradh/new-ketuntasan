'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    useEffect(() => {
        setMounted(true)
    }, [])

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

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
            <div className={`w-full max-w-[400px] transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Logo / Brand Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">e-Tuntas</h1>
                    <p className="text-slate-500 text-sm mt-1">Sistem Ketuntasan SMKN 1 Bondowoso</p>
                </div>

                <Card className="border-slate-200 shadow-xl bg-white">
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-xl font-semibold text-center">Masuk ke Akun</CardTitle>
                        <CardDescription className="text-center">
                            Masukkan email dan password Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
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
                                    className="h-10 bg-white"
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
                                        className="h-10 bg-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-400 text-xs mt-8">
                    &copy; 2026 e-Tuntas. All rights reserved.
                </p>
            </div>
        </div>
    )
}
