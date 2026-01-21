'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Search, Users, ClipboardCheck, ArrowRight, CheckCircle2, CheckSquare, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { toggleCompletionItem, bulkMarkComplete } from '@/actions/completion'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject } from '@/types/database'
import { useDebounce } from '@/hooks/use-debounce'
import { useEffect } from 'react'

// Simplified interface for stats view
interface StatsSheet {
    class_id: string
    completion_items: {
        subject_id: string
        is_completed: boolean
    }[]
}

interface CompletionSheetsClientProps {
    teacherId: string
    assignments: {
        id: string
        class_id: string
        subject_id: string
        class?: { id: string; name: string }
        subject?: { id: string; name: string; code: string }
    }[]
    // View Mode Props
    view: 'dashboard' | 'detail'
    // Dashboard Props
    statsSheets?: StatsSheet[]
    // Detail Props
    paginatedSheets?: (CompletionSheet & {
        student?: { id: string; full_name: string; nisn?: string }
        exam?: { name: string; exam_type: string }
        class?: { name: string }
        completion_items?: (CompletionItem & { subject?: Subject })[]
    })[]
    currentAssignment?: {
        class_id: string
        subject_id: string
    }
    metadata?: {
        currentPage: number
        pageCount: number
        totalItems: number
        limit: number
    }
}

export function CompletionSheetsClient({
    teacherId,
    assignments,
    view,
    statsSheets = [],
    paginatedSheets = [],
    currentAssignment,
    metadata
}: CompletionSheetsClientProps) {
    const router = useRouter()

    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Search State
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '')
    const debouncedSearch = useDebounce(searchTerm, 300)

    useEffect(() => {
        // Only update if value changed to prevent loops
        const currentQuery = searchParams.get('query') || ''
        if (debouncedSearch === currentQuery) return

        const params = new URLSearchParams(searchParams)
        if (debouncedSearch) {
            params.set('query', debouncedSearch)
        } else {
            params.delete('query')
        }
        params.set('page', '1') // Reset to page 1
        router.push(`${pathname}?${params.toString()}`)
    }, [debouncedSearch, pathname, router, searchParams])

    const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)
    const [loading, setLoading] = useState<string | null>(null)
    const [notes, setNotes] = useState<Record<string, string>>({})

    // Pagination (Client state for UI only, actual range is server-side)
    // We use metadata from props for controls

    // Bulk Action State
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const [showBulkDialog, setShowBulkDialog] = useState(false)
    const [bulkNotes, setBulkNotes] = useState<Record<string, string>>({})
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

    // Derived State
    const activeStatsAssignment = assignments.find(a =>
        a.class_id === currentAssignment?.class_id &&
        a.subject_id === currentAssignment?.subject_id
    )

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', String(newPage))
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleAssignmentSelect = (assign: typeof assignments[0]) => {
        const params = new URLSearchParams()
        params.set('class_id', assign.class_id)
        params.set('subject_id', assign.subject_id)
        router.push(`${pathname}?${params.toString()}`)
    }

    // Identify selected sheet
    const selectedSheet = paginatedSheets?.find(s => s.id === selectedSheetId) || null



    const handleToggle = async (itemId: string) => {
        setLoading(itemId)
        try {
            const result = await toggleCompletionItem(itemId, notes[itemId])
            if (result.error) toast.error(result.error)
            else toast.success('Ketuntasan diperbarui')
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(null)
        }
    }

    // --- Bulk Selection Logic ---
    const getSubjectItem = (sheet: typeof paginatedSheets[0]) => {
        // In detail view, we already filtered items by subject_id in server
        // So the first item should be the correct one, or find match just in case
        return sheet.completion_items?.find(i => i.subject_id === currentAssignment?.subject_id)
    }

    // Uncompleted sheets on CURRENT PAGE (for header checkbox which usually selects visible items)
    const uncompletedSheetsOnPage = paginatedSheets.filter(s => {
        const item = getSubjectItem(s)
        return item && !item.is_completed // Only select items that are NOT completed
    })

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const pageIds = uncompletedSheetsOnPage.map(s => getSubjectItem(s)?.id).filter(id => id) as string[]
            // Add visible uncompleted items to selection, avoiding duplicates
            setSelectedItemIds(prev => Array.from(new Set([...prev, ...pageIds])))
        } else {
            // Unselect items visible on this page
            const pageIds = uncompletedSheetsOnPage.map(s => getSubjectItem(s)?.id).filter(id => id) as string[]
            setSelectedItemIds(prev => prev.filter(id => !pageIds.includes(id)))
        }
    }

    const handleSelectOne = (itemId: string, checked: boolean) => {
        if (checked) setSelectedItemIds(prev => [...prev, itemId])
        else setSelectedItemIds(prev => prev.filter(id => id !== itemId))
    }

    const handleBulkSubmit = async () => {
        setIsBulkSubmitting(true)
        const itemsToUpdate = selectedItemIds.map(id => ({
            itemId: id,
            notes: bulkNotes[id]
        }))

        try {
            const result = await bulkMarkComplete(itemsToUpdate)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`${selectedItemIds.length} siswa berhasil ditandai tuntas!`)
                setSelectedItemIds([])
                setBulkNotes({})
                setShowBulkDialog(false)
            }
        } catch {
            toast.error('Gagal melakukan update massal')
        } finally {
            setIsBulkSubmitting(false)
        }
    }

    // VIEW 1: SELECTION GRID (Dashboard)
    if (view === 'dashboard') {
        return (
            <div className="p-6 lg:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Lembar Ketuntasan & Arsip</h1>
                    <p className="text-slate-500 mt-1">Pilih kelas dan mata pelajaran untuk dikelola</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map(assign => {
                        // Calculate stats from statsSheets
                        const classSheets = statsSheets.filter(s => s.class_id === assign.class_id)
                        const totalStudents = classSheets.length
                        const completedCount = classSheets.filter(s =>
                            s.completion_items?.some(i => i.subject_id === assign.subject_id && i.is_completed)
                        ).length

                        return (
                            <Card
                                key={assign.id}
                                className="group hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer border-slate-200"
                                onClick={() => handleAssignmentSelect(assign)}
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                            {assign.class?.name}
                                        </Badge>
                                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
                                        {assign.subject?.name}
                                    </CardTitle>
                                    <CardDescription>{assign.subject?.code}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" />
                                            <span>{totalStudents} Siswa</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ClipboardCheck className="h-4 w-4" />
                                            <span className={completedCount === totalStudents && totalStudents > 0 ? "text-green-600 font-medium" : ""}>
                                                {completedCount} Tuntas
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${totalStudents ? (completedCount / totalStudents) * 100 : 0}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }

    // VIEW 2: DETAIL TABLE
    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>


                    <Button
                        variant="ghost"
                        className="pl-0 hover:pl-2 transition-all mb-1 text-slate-500 hover:text-slate-900"
                        onClick={() => router.push(pathname)} // Clear params to go back
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Kembali ke Daftar Kelas
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        {/* Class Filter */}
                        <div className="w-[200px]">
                            <Select
                                value={currentAssignment?.class_id}
                                onValueChange={(value) => {
                                    const params = new URLSearchParams(searchParams)
                                    params.set('class_id', value)
                                    router.push(`${pathname}?${params.toString()}`)
                                }}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Get unique classes from assignments */}
                                    {Array.from(new Set(assignments.map(a => a.class_id))).map(classId => {
                                        const assignment = assignments.find(a => a.class_id === classId)
                                        return (
                                            <SelectItem key={classId} value={classId}>
                                                {assignment?.class?.name || 'Unknown Class'}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Subject Filter */}
                        <div className="w-[250px]">
                            <Select
                                value={currentAssignment?.subject_id}
                                onValueChange={(value) => {
                                    const params = new URLSearchParams(searchParams)
                                    params.set('subject_id', value)
                                    router.push(`${pathname}?${params.toString()}`)
                                }}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Pilih Mapel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Get unique subjects from assignments */}
                                    {Array.from(new Set(assignments.map(a => a.subject_id))).map(subjectId => {
                                        const assignment = assignments.find(a => a.subject_id === subjectId)
                                        return (
                                            <SelectItem key={subjectId} value={subjectId}>
                                                {assignment?.subject?.name || 'Unknown Subject'}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {selectedItemIds.length > 0 && (
                        <Button onClick={() => setShowBulkDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white animate-in fade-in zoom-in duration-200">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Tandai Tuntas ({selectedItemIds.length})
                        </Button>
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari siswa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-64 lg:w-80"
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Approval Dialog */}
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Ketuntasan Massal</DialogTitle>
                        <DialogDescription>
                            Anda akan menandai {selectedItemIds.length} siswa sebagai <b>Tuntas</b>.
                            Silakan tambahkan catatan spesifik untuk masing-masing siswa jika perlu.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {paginatedSheets
                            .filter(s => getSubjectItem(s) && selectedItemIds.includes(getSubjectItem(s)!.id))
                            .map(sheet => {
                                const item = getSubjectItem(sheet)!
                                return (
                                    <div key={item.id} className="flex gap-4 items-start p-3 border rounded-lg bg-slate-50">
                                        <div className="w-1/3">
                                            <p className="font-medium text-sm">{sheet.student?.full_name}</p>
                                            <p className="text-xs text-slate-500">{sheet.student?.nisn}</p>
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Berikan catatan khusus untuk siswa ini..."
                                                value={bulkNotes[item.id] || ''}
                                                onChange={(e) => setBulkNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                className="bg-white text-sm"
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Batal</Button>
                        <Button onClick={handleBulkSubmit} disabled={isBulkSubmitting}>
                            {isBulkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Semua
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sheet Detail Dialog (Single View) */}
            <Dialog open={!!selectedSheetId} onOpenChange={(v) => !v && setSelectedSheetId(null)}>
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
                                ?.filter(item => item.subject_id === currentAssignment?.subject_id)
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
                            {selectedSheet?.completion_items?.filter(item => item.subject_id === currentAssignment?.subject_id).length === 0 && (
                                <p className="text-slate-500 italic text-center py-4">Item mapel tidak ditemukan di lembar ini.</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sheets Table */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center text-slate-400">
                                    <Checkbox
                                        checked={uncompletedSheetsOnPage.length > 0 && selectedItemIds.length >= uncompletedSheetsOnPage.length}
                                        onCheckedChange={(c) => handleSelectAll(!!c)}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead className="pl-2">Siswa</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ujian</TableHead>
                                <TableHead className="text-right pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSheets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <Users className="h-12 w-12 text-slate-200 mb-3" />
                                            <p className="font-medium">Tidak ada siswa ditemukan</p>
                                            <p className="text-sm">Untuk kelas ini pada halaman ini.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSheets.map((sheet) => {
                                    const subjectItem = sheet.completion_items?.find(i => i.subject_id === currentAssignment?.subject_id)
                                    const isCompleted = subjectItem?.is_completed
                                    const itemId = subjectItem?.id

                                    return (
                                        <TableRow key={sheet.id} className="hover:bg-slate-50">
                                            <TableCell className="text-center">
                                                {!isCompleted && itemId && (
                                                    <Checkbox
                                                        checked={selectedItemIds.includes(itemId)}
                                                        onCheckedChange={(c) => handleSelectOne(itemId, !!c)}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="pl-2">
                                                <div>
                                                    <p className="font-medium">{sheet.student?.full_name}</p>
                                                    <p className="text-xs text-slate-500">{sheet.student?.nisn}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isCompleted ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Tuntas
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200">
                                                        Belum Tuntas
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{sheet.exam?.name}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedSheetId(sheet.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Detail & Nilai
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {/* Pagination Context from DataTable style */}
                    {metadata && (
                        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(1)}
                                disabled={metadata.currentPage === 1}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(metadata.currentPage - 1)}
                                disabled={metadata.currentPage === 1}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {metadata.currentPage} of {metadata.pageCount}
                            </div>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(metadata.currentPage + 1)}
                                disabled={metadata.currentPage === metadata.pageCount}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(metadata.pageCount)}
                                disabled={metadata.currentPage === metadata.pageCount}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
