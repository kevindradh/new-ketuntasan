'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Eye, Loader2, CheckCircle2, XCircle, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { approveAsCounselor, rejectAsCounselor } from '@/actions/completion'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject, Profile, Class } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from "@tanstack/react-table"

interface CounselorApprovalClientProps {
    items: (CompletionSheet & {
        student?: Profile
        exam?: { name: string; exam_type: string }
        class?: { name: string }
        homeroom_approver?: { full_name: string }
        completion_items?: (CompletionItem & { subject?: Subject; teacher?: Profile })[]
    })[]
    classes: { id: string; name: string }[]
    availableYears?: string[]
    pageCount: number
    currentPage: number
    totalItems: number
}

export function CounselorApprovalClient({ items, classes, availableYears = [], pageCount, currentPage, totalItems }: CounselorApprovalClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // URL state for filter
    const currentClassId = searchParams.get('classId') || 'all'
    const currentYear = searchParams.get('academic_year') || availableYears[0] || ''

    const [selectedSheet, setSelectedSheet] = useState<typeof items[0] | null>(null)
    const [approveDialog, setApproveDialog] = useState(false)
    const [rejectDialog, setRejectDialog] = useState(false)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    // Handle year change
    const handleYearChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('academic_year', value)
        params.delete('classId') // Reset class when year changes
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    // Handle class filter change
    const handleClassChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set('classId', value)
        } else {
            params.delete('classId')
        }
        // Reset page to 1 when filter changes
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    const handleApprove = async () => {
        if (!selectedSheet) return
        setLoading(true)
        try {
            const result = await approveAsCounselor(selectedSheet.id, notes)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Berhasil menyetujui lembar ketuntasan')
                setApproveDialog(false)
                setSelectedSheet(null)
                setNotes('')
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedSheet || !notes.trim()) {
            toast.error('Harap isi alasan penolakan')
            return
        }
        setLoading(true)
        try {
            const result = await rejectAsCounselor(selectedSheet.id, notes)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Lembar ketuntasan ditolak')
                setRejectDialog(false)
                setSelectedSheet(null)
                setNotes('')
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

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
            id: "homeroom",
            header: "Wali Kelas",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{row.original.homeroom_approver?.full_name || '-'}</span>
                    <span className="text-xs text-slate-500">
                        {row.original.homeroom_approved_at ? formatDate(row.original.homeroom_approved_at) : ''}
                    </span>
                </div>
            )
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Menunggu Approval
                </Badge>
            )
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
                        Review
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Final Approval</h1>
                    <p className="text-slate-500 mt-1">Verifikasi akhir lembar ketuntasan siswa</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full sm:w-[200px]">
                        <Label className="text-xs text-slate-500 mb-1.5 block">Tahun Ajaran</Label>
                        <Select value={currentYear} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-[250px]">
                        <Label className="text-xs text-slate-500 mb-1.5 block">Filter Kelas</Label>
                        <Select value={currentClassId} onValueChange={handleClassChange} disabled={!currentYear}>
                            <SelectTrigger className="w-full bg-white">
                                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Pilih Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kelas</SelectItem>
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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

            {/* Approve Dialog */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui Final</DialogTitle>
                        <DialogDescription>
                            Anda akan memberikan persetujuan akhir untuk {selectedSheet?.student?.full_name}.
                            Siswa akan dinyatakan LULUS verifikasi dan dapat mengikuti ujian.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Catatan (opsional)</Label>
                            <Textarea
                                placeholder="Tambahkan catatan jika diperlukan..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialog(false)}>Batal</Button>
                        <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Setujui Final
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Verifikasi</DialogTitle>
                        <DialogDescription>
                            Anda akan menolak verifikasi akhir untuk {selectedSheet?.student?.full_name}.
                            Status akan dikembalikan ke proses pengerjaan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Alasan Penolakan *</Label>
                            <Textarea
                                placeholder="Jelaskan alasan penolakan..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog(false)}>Batal</Button>
                        <Button onClick={handleReject} disabled={loading} variant="destructive">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Tolak
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={!!selectedSheet && !approveDialog && !rejectDialog} onOpenChange={(v) => !v && setSelectedSheet(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Ketuntasan</DialogTitle>
                        <DialogDescription>
                            {selectedSheet?.student?.full_name} - {selectedSheet?.class?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ujian:</span>
                                <span className="font-medium">{selectedSheet?.exam?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Wali Kelas:</span>
                                <span className="font-medium">{selectedSheet?.homeroom_approver?.full_name || '-'}</span>
                            </div>
                            {selectedSheet?.homeroom_notes && (
                                <div className="mt-2 text-sm bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200">
                                    <strong>Catatan Wali Kelas:</strong> {selectedSheet.homeroom_notes}
                                </div>
                            )}
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
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedSheet(null)}>Tutup</Button>
                        <Button
                            variant="destructive"
                            onClick={() => { setNotes(''); setRejectDialog(true) }}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Tolak
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => { setNotes(''); setApproveDialog(true) }}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Setujui Final
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
