'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react'
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
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-subtle" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[100px] animate-pulse-subtle delay-1000" />
            </div>

            {/* Main Content */}
            <div className={`relative z-10 w-full max-w-md px-4 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <Card className="border-white/10 shadow-2xl bg-white/10 backdrop-blur-xl text-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500" />

                    <CardHeader className="text-center pb-2 pt-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                                <div className="relative p-4 rounded-2xl bg-slate-950 border border-white/10 shadow-xl">
                                    <GraduationCap className="h-8 w-8 text-blue-400" />
                                </div>
                                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400 animate-bounce delay-700" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            e-Tuntas
                        </CardTitle>
                        <CardDescription className="text-slate-300 font-medium text-base">
                            Sistem Ketuntasan Terpadu
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4 px-6 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-200">Email Sekolah</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@sekolah.sch.id"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="h-12 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="h-12 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all pr-12 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 font-semibold text-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    "Masuk Sekarang"
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <div className="py-4 bg-slate-950/30 text-center text-xs text-slate-500 border-t border-white/5">
                        <p>© 2026 e-Tuntas SMKN 1 Bondowoso</p>
                    </div>
                </Card>

                <p className="text-center text-slate-400 text-sm mt-6 hover:text-white transition-colors cursor-default">
                    Mengalami kendala? <span className="underline underline-offset-4 decoration-slate-600 hover:decoration-blue-400">Hubungi Admin</span>
                </p>
            </div>
        </div>
    )
}
