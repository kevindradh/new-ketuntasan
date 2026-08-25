'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { UserCheck, Search, Eye, Loader2, CheckCircle2, XCircle, Clock, Award } from 'lucide-react'
import { toast } from 'sonner'
import { approveAsCounselor, rejectAsCounselor } from '@/actions/completion'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject, Profile } from '@/types/database'

interface CounselorDashboardClientProps {
    sheets: (CompletionSheet & {
        student?: Profile
        exam?: { name: string; exam_type: string }
        class?: { name: string }
        homeroom_approver?: Profile
        completion_items?: (CompletionItem & { subject?: Subject; teacher?: Profile })[]
    })[]
    stats: {
        pending: number
        approved: number
        total: number
    }
}

export function CounselorDashboardClient({ sheets, stats }: CounselorDashboardClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSheet, setSelectedSheet] = useState<typeof sheets[0] | null>(null)
    const [approveDialog, setApproveDialog] = useState(false)
    const [rejectDialog, setRejectDialog] = useState(false)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const filteredSheets = sheets.filter(s =>
        s.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.class?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleApprove = async () => {
        if (!selectedSheet) return
        setLoading(true)
        try {
            const result = await approveAsCounselor(selectedSheet.id, notes)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Berhasil menyetujui - Siswa dapat mengikuti ujian!')
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

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Guru BK</h1>
                <p className="text-slate-500 mt-1">Final approval lembar ketuntasan siswa</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Menunggu Approval</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-emerald-700" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Sudah Disetujui</p>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                            </div>
                            <Award className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Lembar</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-emerald-700" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Approve Dialog */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            Final Approval
                        </DialogTitle>
                        <DialogDescription>
                            Anda akan memberikan persetujuan final untuk {selectedSheet?.student?.full_name}.
                            Siswa akan dapat mengikuti ujian setelah disetujui.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Catatan (opsional)</Label>
                            <Textarea
                                placeholder="Siswa layak mengikuti ujian..."
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

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800">Disetujui Wali Kelas</p>
                            <p className="text-sm text-green-700">
                                {selectedSheet?.homeroom_approver?.full_name} • {selectedSheet?.homeroom_approved_at && formatDate(selectedSheet.homeroom_approved_at)}
                            </p>
                            {selectedSheet?.homeroom_notes && (
                                <p className="text-sm text-green-600 mt-1">Catatan: {selectedSheet.homeroom_notes}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium">Daftar Ketuntasan</h4>
                            {selectedSheet?.completion_items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.subject?.name}</p>
                                        <p className="text-sm text-slate-500">Guru: {item.teacher?.full_name}</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">
                                        ✓ Tuntas
                                    </Badge>
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
                            <Award className="h-4 w-4 mr-2" />
                            Setujui Final
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sheets Table */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Menunggu Final Approval</CardTitle>
                            <CardDescription>Lembar ketuntasan yang sudah disetujui wali kelas</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari siswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Siswa</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Ujian</TableHead>
                                <TableHead>Approved by</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSheets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        <UserCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>Tidak ada lembar ketuntasan yang menunggu final approval</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSheets.map((sheet) => (
                                    <TableRow key={sheet.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{sheet.student?.full_name}</p>
                                                <p className="text-xs text-slate-500">{sheet.student?.nisn}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{sheet.class?.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{sheet.exam?.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-600">{sheet.homeroom_approver?.full_name}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedSheet(sheet)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
