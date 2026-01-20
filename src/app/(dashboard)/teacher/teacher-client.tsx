'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, CheckCircle2, Clock, ArrowRight, BarChart3 } from 'lucide-react'
import type { CompletionSheet, CompletionItem, Subject } from '@/types/database'
import Link from 'next/link'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

interface TeacherDashboardClientProps {
    sheets: (CompletionSheet & {
        student?: { id: string; full_name: string; nisn?: string }
        exam?: { name: string; exam_type: string }
        class?: { name: string }
        completion_items?: (CompletionItem & { subject?: Subject })[]
    })[]
    teacherSubjectIds: string[]
    teacherId: string
}

export function TeacherDashboardClient({ sheets, teacherId }: TeacherDashboardClientProps) {
    // Calculate global stats
    const myItems = sheets.flatMap(s =>
        s.completion_items?.filter(i => i.teacher_id === teacherId) || []
    )
    const completedItems = myItems.filter(i => i.is_completed)

    // Calculate chart data: Average completion per class
    const classDataMap = new Map<string, { total: number, completed: number, name: string }>()

    sheets.forEach(sheet => {
        const className = sheet.class?.name || 'Unknown'
        // Only count items for this teacher
        const sheetItems = sheet.completion_items?.filter(i => i.teacher_id === teacherId) || []

        if (sheetItems.length === 0) return

        if (!classDataMap.has(className)) {
            classDataMap.set(className, { total: 0, completed: 0, name: className })
        }

        const data = classDataMap.get(className)!
        data.total += sheetItems.length
        data.completed += sheetItems.filter(i => i.is_completed).length
    })

    const chartData = Array.from(classDataMap.values()).map(d => ({
        name: d.name,
        percentage: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
        completed: d.completed,
        total: d.total
    })).sort((a, b) => b.percentage - a.percentage) // Sort by highest completion

    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Guru</h1>
                    <p className="text-slate-500 mt-1">Ringkasan performa ketuntasan siswa</p>
                </div>
                <Button asChild className="gradient-primary">
                    <Link href="/teacher/completion-sheets">
                        Kelola Ketuntasan
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Siswa</p>
                                <p className="text-2xl font-bold">{sheets.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <ClipboardCheck className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Item Mapel</p>
                                <p className="text-2xl font-bold">{myItems.length}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Sudah Tuntas</p>
                                <p className="text-2xl font-bold text-green-600">{completedItems.length}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Belum Tuntas</p>
                                <p className="text-2xl font-bold text-orange-600">{myItems.length - completedItems.length}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm bg-white lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Rata-rata Ketuntasan per Kelas</CardTitle>
                        <CardDescription>Persentase siswa yang sudah tuntas (berdasarkan item mapel Anda)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            unit="%"
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="percentage" name="Ketuntasan" radius={[4, 4, 0, 0]} barSize={40}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <BarChart3 className="h-10 w-10 mb-2 opacity-50" />
                                    <p>Belum ada data visualisasi</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Aktivitas Terbaru</CardTitle>
                        <CardDescription className="text-indigo-100">
                            Ringkasan akses cepat
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <p className="text-sm text-indigo-100 mb-1">Kelas dengan Ketuntasan Tertinggi</p>
                            <p className="text-xl font-bold">
                                {chartData.length > 0 ? chartData[0].name : '-'}
                            </p>
                            <p className="text-xs text-indigo-200 mt-1">
                                {chartData.length > 0 ? `${chartData[0].percentage}% Tuntas` : ''}
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <p className="text-sm text-indigo-100 mb-1">Perlu Perhatian</p>
                            <p className="text-xl font-bold">
                                {chartData.length > 0 ? chartData[chartData.length - 1].name : '-'}
                            </p>
                            <p className="text-xs text-indigo-200 mt-1">
                                {chartData.length > 0 ? `${chartData[chartData.length - 1].percentage}% Tuntas` : ''}
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button asChild variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-white/90">
                                <Link href="/teacher/completion-sheets">
                                    Lihat Detail Approval
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
