'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Eye, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject, Profile } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from "@tanstack/react-table"
import { Progress } from '@/components/ui/progress'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonitoringClientProps {
    items: (CompletionSheet & {
        student?: Profile
        exam?: { name: string; exam_type: string }
        class?: { name: string }
        completion_items?: (CompletionItem & { subject?: Subject; teacher?: Profile })[]
    })[]
    pageCount: number
    currentPage: number
    totalItems: number
    availableClasses?: { id: string, name: string, academic_year: string }[]
    availableYears?: string[]
}

const statusLabels: Record<string, string> = {
    'PENDING': 'Belum Mulai',
    'IN_PROGRESS': 'Dalam Proses',
    'HOMEROOM_REVIEW': 'Menunggu Approval Wali Kelas',
    'COUNSELOR_REVIEW': 'Menunggu Approval BK',
    'APPROVED': 'Selesai',
}

const statusColors: Record<string, string> = {
    'PENDING': 'bg-slate-100 text-slate-700',
    'IN_PROGRESS': 'bg-blue-100 text-blue-700',
    'HOMEROOM_REVIEW': 'bg-amber-100 text-amber-700',
    'COUNSELOR_REVIEW': 'bg-purple-100 text-purple-700',
    'APPROVED': 'bg-green-100 text-green-700',
}

export function MonitoringClient({ items, pageCount, currentPage, totalItems, availableClasses = [], availableYears = [] }: MonitoringClientProps) {
    const [selectedSheet, setSelectedSheet] = useState<typeof items[0] | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentYear = searchParams.get('academic_year') || availableYears[0] || ''
    const currentClass = searchParams.get('class_id') || ''

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('academic_year', year)
        params.delete('class_id') // Reset class when year changes
        params.set('page', '1') // Reset paging
        router.push(`?${params.toString()}`)
    }

    const handleClassChange = (classId: string) => {
        const params = new URLSearchParams(searchParams)
        if (classId === 'all') {
            params.delete('class_id')
        } else {
            params.set('class_id', classId)
        }
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    // Filter classes based on selected year
    const filteredClasses = availableClasses.filter(c => c.academic_year === currentYear)

    const columns: ColumnDef<typeof items[0]>[] = [
        {
            accessorKey: "student.full_name",
            header: "Siswa",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.student?.full_name}</p>
                    <p className="text-xs text-slate-500">{row.original.student?.nisn}</p>
                </div>
            )
        },
        {
            accessorKey: "class.name",
            header: "Kelas",
            cell: ({ row }) => row.original.class?.name
        },
        {
            accessorKey: "exam.name",
            header: "Ujian",
            cell: ({ row }) => <Badge variant="outline">{row.original.exam?.name}</Badge>
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status || 'PENDING'
                return (
                    <Badge className={`${statusColors[status]} hover:${statusColors[status]}`}>
                        {statusLabels[status]}
                    </Badge>
                )
            }
        },
        {
            id: "progress",
            header: "Progress",
            cell: ({ row }) => {
                const total = row.original.completion_items?.length || 0
                const completed = row.original.completion_items?.filter(i => i.is_completed).length || 0
                const percentage = total > 0 ? (completed / total) * 100 : 0

                return (
                    <div className="w-[140px] space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{completed}/{total} Mapel</span>
                            <span className="text-slate-500">{Math.round(percentage)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSheet(row.original)}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Monitoring Ketuntasan</h1>
                    <p className="text-slate-500 mt-1">Pantau progress ketuntasan semua siswa</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={currentYear} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Pilih Tahun Ajaran" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={currentClass || 'all'} onValueChange={handleClassChange} disabled={!currentYear}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kelas</SelectItem>
                            {filteredClasses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={items}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari siswa..."
            />

            {/* Detail Dialog */}
            <Dialog open={!!selectedSheet} onOpenChange={(v) => !v && setSelectedSheet(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Progress Siswa</DialogTitle>
                        <DialogDescription>
                            {selectedSheet?.student?.full_name} - {selectedSheet?.class?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-medium">{selectedSheet?.exam?.name}</p>
                                <p className="text-sm text-slate-500">{selectedSheet?.exam?.exam_type}</p>
                            </div>
                            <Badge className={`${statusColors[selectedSheet?.status || 'PENDING']}`}>
                                {statusLabels[selectedSheet?.status || 'PENDING']}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium">Daftar Mata Pelajaran</h4>
                            {selectedSheet?.completion_items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.subject?.name}</p>
                                        <p className="text-sm text-slate-500">Guru: {item.teacher?.full_name}</p>
                                    </div>
                                    {item.is_completed ? (
                                        <div className="text-right">
                                            <Badge className="bg-green-100 text-green-700 mb-1">
                                                ✓ Tuntas
                                            </Badge>
                                            <p className="text-xs text-slate-500">
                                                {formatDate(item.completed_at!)}
                                            </p>
                                        </div>
                                    ) : (
                                        <Badge variant="secondary">Belum Tuntas</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedSheet(null)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
