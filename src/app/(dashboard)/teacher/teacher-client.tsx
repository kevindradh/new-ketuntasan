'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { ClipboardCheck, Search, Eye, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { toggleCompletionItem } from '@/actions/completion'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject } from '@/types/database'

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

export function TeacherDashboardClient({ sheets, teacherSubjectIds, teacherId }: TeacherDashboardClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSheet, setSelectedSheet] = useState<typeof sheets[0] | null>(null)
    const [loading, setLoading] = useState<string | null>(null)
    const [notes, setNotes] = useState<Record<string, string>>({})

    const filteredSheets = sheets.filter(s =>
        s.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.class?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleToggle = async (itemId: string) => {
        setLoading(itemId)
        try {
            const result = await toggleCompletionItem(itemId, notes[itemId])
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Ketuntasan diperbarui')
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(null)
        }
    }

    // Calculate stats
    const myItems = sheets.flatMap(s =>
        s.completion_items?.filter(i => i.teacher_id === teacherId) || []
    )
    const completedItems = myItems.filter(i => i.is_completed)

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Guru</h1>
                <p className="text-slate-500 mt-1">Kelola ketuntasan mata pelajaran siswa</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Siswa</p>
                                <p className="text-2xl font-bold">{sheets.length}</p>
                            </div>
                            <ClipboardCheck className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Item Mapel</p>
                                <p className="text-2xl font-bold">{myItems.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Sudah Tuntas</p>
                                <p className="text-2xl font-bold">{completedItems.length}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Belum Tuntas</p>
                                <p className="text-2xl font-bold">{myItems.length - completedItems.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sheet Detail Dialog */}
            <Dialog open={!!selectedSheet} onOpenChange={(v) => !v && setSelectedSheet(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Ketuntasan</DialogTitle>
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
                            {selectedSheet?.completion_items
                                ?.filter(item => item.teacher_id === teacherId)
                                .map((item) => (
                                    <div key={item.id} className="p-4 border rounded-lg">
                                        <div className="flex items-start gap-4">
                                            <Checkbox
                                                checked={item.is_completed}
                                                onCheckedChange={() => handleToggle(item.id)}
                                                disabled={loading === item.id}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{item.subject?.name}</span>
                                                    <Badge variant="outline">{item.subject?.code}</Badge>
                                                </div>
                                                {item.is_completed ? (
                                                    <p className="text-sm text-green-600 mt-1">
                                                        ✓ Tuntas pada {formatDate(item.completed_at!)}
                                                    </p>
                                                ) : (
                                                    <Textarea
                                                        placeholder="Catatan (opsional)"
                                                        value={notes[item.id] || ''}
                                                        onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                                                        className="mt-2"
                                                        rows={2}
                                                    />
                                                )}
                                            </div>
                                            {loading === item.id && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sheets Table */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Lembar Ketuntasan Siswa</CardTitle>
                            <CardDescription>Klik untuk mengisi ketuntasan</CardDescription>
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
                                <TableHead>Progress Anda</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSheets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>Tidak ada lembar ketuntasan</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSheets.map((sheet) => {
                                    const mySheetItems = sheet.completion_items?.filter(i => i.teacher_id === teacherId) || []
                                    const completedCount = mySheetItems.filter(i => i.is_completed).length
                                    const totalCount = mySheetItems.length

                                    return (
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
                                                {totalCount > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full transition-all"
                                                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-slate-600">{completedCount}/{totalCount}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedSheet(sheet)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
