'use client'

import { useState } from 'react'
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
import { UserCheck, Eye, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { approveAsHomeroom, rejectAsHomeroom } from '@/actions/completion'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject, Profile } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from "@tanstack/react-table"

interface ApprovalClientProps {
    items: (CompletionSheet & {
        student?: Profile
        exam?: { name: string; exam_type: string }
        class?: { name: string }
        completion_items?: (CompletionItem & { subject?: Subject; teacher?: Profile })[]
    })[]
    pageCount: number
    currentPage: number
    totalItems: number
}

export function ApprovalClient({ items, pageCount, currentPage, totalItems }: ApprovalClientProps) {
    const [selectedSheet, setSelectedSheet] = useState<typeof items[0] | null>(null)
    const [approveDialog, setApproveDialog] = useState(false)
    const [rejectDialog, setRejectDialog] = useState(false)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleApprove = async () => {
        if (!selectedSheet) return
        setLoading(true)
        try {
            const result = await approveAsHomeroom(selectedSheet.id, notes)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Berhasil menyetujui lembar ketuntasan')
                setApproveDialog(false)
                setSelectedSheet(null)
                setNotes('')
                // In a real app we might want to refresh data here, 
                // but Next.js server actions + router.refresh() in parent usually handles it. 
                // However, since we are in a transition, we might rely on the page reload or router.refresh() 
                // if the action calls revalidatePath.
                // Assuming the action does revalidatePath('/homeroom/approval').
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
            const result = await rejectAsHomeroom(selectedSheet.id, notes)
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
            accessorKey: "exam.name",
            header: "Ujian",
            cell: ({ row }) => <Badge variant="outline">{row.original.exam?.name}</Badge>
        },
        {
            id: "progress",
            header: "Ketuntasan",
            cell: ({ row }) => {
                const total = row.original.completion_items?.length || 0
                const completed = row.original.completion_items?.filter(i => i.is_completed).length || 0
                return <span className="text-green-600 font-medium">{completed}/{total}</span>
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
                        Review
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Approval Ketuntasan</h1>
                <p className="text-slate-500 mt-1">Kelola persetujuan lembar ketuntasan siswa</p>
            </div>

            <DataTable
                columns={columns}
                data={items}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari siswa atau kelas..."
            />

            {/* Approve Dialog */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui Lembar Ketuntasan</DialogTitle>
                        <DialogDescription>
                            Anda akan menyetujui lembar ketuntasan {selectedSheet?.student?.full_name}
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
                            Setujui
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Lembar Ketuntasan</DialogTitle>
                        <DialogDescription>
                            Anda akan menolak lembar ketuntasan {selectedSheet?.student?.full_name}
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
                        <DialogTitle>Detail Lembar Ketuntasan</DialogTitle>
                        <DialogDescription>
                            {selectedSheet?.student?.full_name} - {selectedSheet?.class?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="font-medium">{selectedSheet?.exam?.name}</p>
                            <p className="text-sm text-slate-500">{selectedSheet?.exam?.exam_type}</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium">Daftar Ketuntasan</h4>
                            {selectedSheet?.completion_items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.subject?.name}</p>
                                        <p className="text-sm text-slate-500">Guru: {item.teacher?.full_name}</p>
                                    </div>
                                    {item.is_completed ? (
                                        <Badge className="bg-green-100 text-green-700">
                                            ✓ Tuntas {formatDate(item.completed_at!)}
                                        </Badge>
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
                            Setujui
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
