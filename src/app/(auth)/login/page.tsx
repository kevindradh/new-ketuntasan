'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

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
    }

    return (
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl gradient-primary shadow-lg shadow-blue-500/25">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
                <CardDescription>Masuk ke akun Si-Tuntas Anda</CardDescription>
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

                {/* Demo accounts info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm font-medium text-blue-900 mb-2">Demo Accounts (klik untuk isi):</p>
                    <div className="space-y-1.5 text-xs">
                        <button onClick={() => fillDemo('admin@demo.situntas.id')} className="block w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-700">
                            Admin: admin@demo.situntas.id
                        </button>
                        <button onClick={() => fillDemo('budi@demo.situntas.id')} className="block w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-700">
                            Guru MTK: budi@demo.situntas.id
                        </button>
                        <button onClick={() => fillDemo('dewi@demo.situntas.id')} className="block w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-700">
                            Wali Kelas: dewi@demo.situntas.id
                        </button>
                        <button onClick={() => fillDemo('wahyu@demo.situntas.id')} className="block w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-700">
                            Guru BK: wahyu@demo.situntas.id
                        </button>
                        <button onClick={() => fillDemo('andi@demo.situntas.id')} className="block w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-700">
                            Siswa: andi@demo.situntas.id
                        </button>
                        <p className="text-blue-500 mt-2 px-2">Password: password123</p>
                    </div>
                </div>
            </CardContent>
            <div className="text-center text-sm text-slate-600">
                Sistem Tertutup &copy; 2026 Si-Tuntas
            </div>
        </Card>
    )
}
