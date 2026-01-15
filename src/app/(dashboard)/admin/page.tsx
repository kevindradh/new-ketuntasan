import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    FileText,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    BookOpen,
    School,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch stats
    const [
        { count: totalExams },
        { count: totalSheets },
        { count: approvedSheets },
        { count: pendingSheets },
        { count: totalSubjects },
        { count: totalClasses },
    ] = await Promise.all([
        supabase.from('exams').select('*', { count: 'exact', head: true }),
        supabase.from('completion_sheets').select('*', { count: 'exact', head: true }),
        supabase.from('completion_sheets').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
        supabase.from('completion_sheets').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'IN_PROGRESS']),
        supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])

    // Fetch recent completion sheets
    const { data: recentSheets } = await supabase
        .from('completion_sheets')
        .select(`
      *,
      student:profiles!completion_sheets_student_id_fkey(full_name),
      exam:exams(name),
      class:classes(name)
    `)
        .order('updated_at', { ascending: false })
        .limit(5)

    const stats = [
        { label: 'Total Ujian', value: totalExams || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Lembar Ketuntasan', value: totalSheets || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Sudah Disetujui', value: approvedSheets || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Menunggu Proses', value: pendingSheets || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    ]

    const statusColors: Record<string, string> = {
        PENDING: 'bg-slate-100 text-slate-700',
        IN_PROGRESS: 'bg-blue-100 text-blue-700',
        HOMEROOM_REVIEW: 'bg-amber-100 text-amber-700',
        COUNSELOR_REVIEW: 'bg-purple-100 text-purple-700',
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
    }

    const statusLabels: Record<string, string> = {
        PENDING: 'Menunggu',
        IN_PROGRESS: 'Proses',
        HOMEROOM_REVIEW: 'Review Wali Kelas',
        COUNSELOR_REVIEW: 'Review Guru BK',
        APPROVED: 'Disetujui',
        REJECTED: 'Ditolak',
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Admin</h1>
                    <p className="text-slate-500 mt-1">Kelola sistem ketuntasan mata pelajaran</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/exams">
                        <Button className="gradient-primary border-0">
                            <FileText className="h-4 w-4 mr-2" />
                            Kelola Ujian
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                        <CardDescription>Kelola data master sistem</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Link href="/admin/subjects">
                            <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                <BookOpen className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-sm">Mata Pelajaran</p>
                                <p className="text-xs text-slate-500">{totalSubjects} aktif</p>
                            </div>
                        </Link>
                        <Link href="/admin/classes">
                            <div className="p-4 rounded-xl border border-slate-200 hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer group">
                                <School className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-sm">Kelas</p>
                                <p className="text-xs text-slate-500">{totalClasses} aktif</p>
                            </div>
                        </Link>
                        <Link href="/admin/teachers">
                            <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-200 hover:bg-purple-50/50 transition-all cursor-pointer group">
                                <Users className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-sm">Pengajaran</p>
                                <p className="text-xs text-slate-500">Kelola tugas</p>
                            </div>
                        </Link>
                        <Link href="/admin/exams">
                            <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50/50 transition-all cursor-pointer group">
                                <FileText className="h-8 w-8 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-sm">Ujian</p>
                                <p className="text-xs text-slate-500">{totalExams} ujian</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-2 border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                        <CardDescription>Lembar ketuntasan yang baru diperbarui</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSheets && recentSheets.length > 0 ? (
                            <div className="space-y-4">
                                {recentSheets.map((sheet) => (
                                    <div key={sheet.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium text-sm">
                                                {sheet.student?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-slate-900">{sheet.student?.full_name}</p>
                                                <p className="text-xs text-slate-500">{sheet.exam?.name} • {sheet.class?.name}</p>
                                            </div>
                                        </div>
                                        <Badge className={statusColors[sheet.status]}>
                                            {statusLabels[sheet.status]}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>Belum ada aktivitas</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
