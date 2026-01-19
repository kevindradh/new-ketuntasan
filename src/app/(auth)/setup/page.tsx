'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, UserPlus, Database, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const demoUsers = [
    { email: 'admin@situntas.com', name: 'Admin e-Tuntas', role: 'ADMIN' },
    { email: 'guru.matematika@situntas.com', name: 'Budi Santoso', role: 'TEACHER' },
    { email: 'guru.bahasa@situntas.com', name: 'Siti Rahayu', role: 'TEACHER' },
    { email: 'guru.rpl@situntas.com', name: 'Ahmad Wijaya', role: 'TEACHER' },
    { email: 'walikelas12rpl1@situntas.com', name: 'Dewi Lestari', role: 'HOMEROOM' },
    { email: 'gurubk@situntas.com', name: 'Dr. Wahyu Pratama', role: 'COUNSELOR' },
    { email: 'siswa1@situntas.com', name: 'Andi Pratama', role: 'STUDENT' },
    { email: 'siswa2@situntas.com', name: 'Rina Wulandari', role: 'STUDENT' },
    { email: 'siswa3@situntas.com', name: 'Dimas Prayoga', role: 'STUDENT' },
]

export default function SetupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('password123')
    const [createdUsers, setCreatedUsers] = useState<string[]>([])
    const [currentStep, setCurrentStep] = useState('')

    const handleSetup = async () => {
        if (!password || password.length < 6) {
            toast.error('Password minimal 6 karakter')
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            for (const user of demoUsers) {
                setCurrentStep(`Membuat user: ${user.name}...`)

                // Sign up user
                const { data, error } = await supabase.auth.signUp({
                    email: user.email,
                    password: password,
                    options: {
                        data: {
                            full_name: user.name,
                        },
                    },
                })

                if (error) {
                    console.error(`Error creating ${user.email}:`, error)
                    continue
                }

                if (data.user) {
                    // Assign role
                    await supabase.from('user_roles').insert({
                        user_id: data.user.id,
                        role: user.role,
                    })

                    setCreatedUsers(prev => [...prev, user.email])
                }
            }

            // Sign out after creating all users
            await supabase.auth.signOut()

            toast.success('Setup selesai! Silakan login dengan salah satu akun demo.')
            setCurrentStep('')
        } catch (error) {
            console.error('Setup error:', error)
            toast.error('Terjadi kesalahan saat setup')
        } finally {
            setLoading(false)
        }
    }

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-red-100 text-red-700',
        TEACHER: 'bg-blue-100 text-blue-700',
        HOMEROOM: 'bg-green-100 text-green-700',
        COUNSELOR: 'bg-purple-100 text-purple-700',
        STUDENT: 'bg-amber-100 text-amber-700',
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center text-white">
                    <GraduationCap className="h-16 w-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">Setup Demo e-Tuntas</h1>
                    <p className="text-blue-200 mt-2">Buat akun demo untuk testing aplikasi</p>
                </div>

                <Card className="shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Buat Akun Demo
                        </CardTitle>
                        <CardDescription>
                            Akun-akun berikut akan dibuat secara otomatis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            {demoUsers.map((user) => (
                                <div key={user.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {createdUsers.includes(user.email) ? (
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <Check className="h-4 w-4 text-green-600" />
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Badge className={roleColors[user.role]}>
                                        {user.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password untuk semua akun</Label>
                            <Input
                                id="password"
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                            />
                            <p className="text-xs text-slate-500">Password yang sama akan digunakan untuk semua akun demo</p>
                        </div>

                        {currentStep && (
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {currentStep}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                className="flex-1 gradient-primary border-0"
                                onClick={handleSetup}
                                disabled={loading || createdUsers.length === demoUsers.length}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Membuat akun...
                                    </>
                                ) : createdUsers.length === demoUsers.length ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Setup Selesai
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-4 w-4 mr-2" />
                                        Buat Semua Akun
                                    </>
                                )}
                            </Button>
                            {createdUsers.length > 0 && (
                                <Button variant="outline" onClick={() => router.push('/login')}>
                                    Ke Login
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Alur Testing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</div>
                            <div>
                                <p className="font-medium">Login sebagai Admin</p>
                                <p className="text-slate-500">Buat ujian dan generate lembar ketuntasan</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</div>
                            <div>
                                <p className="font-medium">Login sebagai Guru</p>
                                <p className="text-slate-500">Isi ketuntasan mata pelajaran siswa</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</div>
                            <div>
                                <p className="font-medium">Login sebagai Wali Kelas</p>
                                <p className="text-slate-500">Approve lembar ketuntasan siswa</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</div>
                            <div>
                                <p className="font-medium">Login sebagai Guru BK</p>
                                <p className="text-slate-500">Final approval untuk kelayakan ujian</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">5</div>
                            <div>
                                <p className="font-medium">Login sebagai Siswa</p>
                                <p className="text-slate-500">Lihat progress dan download PDF</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
