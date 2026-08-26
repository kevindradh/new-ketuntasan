'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
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

const testimonials = [
    {
        quote: "Tuntasin sangat memangkas birokrasi rekap nilai di akhir semester. Proses validasi yang biasanya memakan waktu berhari-hari kini bisa selesai dalam hitungan jam.",
        author: "Budi Santoso",
        role: "Guru Matematika",
        initials: "BS"
    },
    {
        quote: "Memantau progres ketuntasan kelas binaan menjadi sangat praktis. Saya bisa mendeteksi siswa yang butuh bantuan akademik lebih cepat.",
        author: "Siti Aminah",
        role: "Wali Kelas XI RPL 2",
        initials: "SA"
    },
    {
        quote: "Sistemnya sangat transparan dan otomatis. Pengurusan lembar ketuntasan bagi siswa tidak lagi membingungkan bagi BK.",
        author: "Rini Astuti",
        role: "Guru BK",
        initials: "RA"
    }
]

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    useEffect(() => {
        setMounted(true)
        const interval = setInterval(() => {
            setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(interval)
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
        <div className="min-h-screen w-full flex bg-slate-50">
            {/* Left Column: Form (Takes 100% on mobile, 45% on desktop) */}
            <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 md:p-10 lg:p-16 bg-white relative">
                
                {/* Back to Home Link */}
                <div className="flex items-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Main Content Form Wrapper */}
                <div className={`my-auto max-w-[380px] w-full mx-auto transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    
                    {/* Brand Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                <Image
                                    src="/etuntas-logo.png"
                                    alt="Logo TUNTASIN"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-lg object-cover"
                                    priority
                                />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">TUNTASIN</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">Selamat Datang Kembali</h1>
                        <p className="text-slate-500 text-sm">Masuk ke akun Anda untuk memantau & memvalidasi ketuntasan siswa.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@sekolah.sch.id"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="h-10 border-slate-200 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 bg-white"
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="h-10 border-slate-200 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 bg-white pr-10"
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
                            className="w-full h-10 mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Masuk ke Akun"
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer copyright */}
                <div className="text-slate-400 text-xs mt-8">
                    &copy; {new Date().getFullYear()} TUNTASIN. Hak Cipta Dilindungi.
                </div>
            </div>

            {/* Right Column: Brand Banner (Only visible on desktop lg:flex) */}
            <div className="hidden lg:flex lg:w-[55%] bg-emerald-950 text-white relative overflow-hidden flex-col justify-between p-12 lg:p-16">
                
                {/* Background decorative glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-800/15 rounded-full blur-[120px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-800/10 rounded-full blur-[120px] -ml-32 -mb-32" />
                
                {/* Placeholder to match spacing now that watermark is removed */}
                <div className="h-8" />

                {/* Middle: Content & Rotating Testimonial */}
                <div className="relative z-10 my-auto max-w-md w-full">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight">
                        Satu Platform untuk Semua Validasi Ketuntasan Belajar
                    </h2>
                    <p className="text-emerald-200/70 leading-relaxed mb-10">
                        Menghubungkan data kelulusan akademik secara transparan antara guru mata pelajaran, wali kelas, guru BK, dan siswa demi mewujudkan efisiensi sekolah digital yang modern.
                    </p>

                    {/* Rotating Testimonial Card */}
                    <div 
                        key={currentTestimonialIndex} 
                        className="min-h-[140px] flex flex-col justify-between border-l-2 border-emerald-500 pl-6 py-1 animate-fadeIn"
                    >
                        <p className="text-lg text-emerald-100/90 italic leading-relaxed mb-6">
                            "{testimonials[currentTestimonialIndex].quote}"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-800/80 border border-emerald-700/50 text-emerald-200 flex items-center justify-center font-bold text-sm">
                                {testimonials[currentTestimonialIndex].initials}
                            </div>
                            <div>
                                <p className="font-semibold text-white text-sm">{testimonials[currentTestimonialIndex].author}</p>
                                <p className="text-xs text-emerald-300">{testimonials[currentTestimonialIndex].role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom credit info */}
                <div className="relative z-10 text-xs text-emerald-300/50 border-t border-white/5 pt-6 flex justify-between items-center">
                    <span>Sistem Penjaminan Mutu Akademik</span>
                    <span>Sekolah Anda</span>
                </div>
            </div>
        </div>
    )
}
