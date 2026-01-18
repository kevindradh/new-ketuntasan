'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createExam, updateExam, deleteExam, generateCompletionSheets } from '@/actions/admin'
import { formatDate } from '@/lib/utils'
import type { Exam } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from "@tanstack/react-table"

interface ClassForExam {
    id: string
    name: string
    grade_level: number
    major?: string | null
    academic_year: string
}

interface ExamsClientProps {
    items: Exam[]
    classes: ClassForExam[]
    pageCount: number
    currentPage: number
    totalItems: number
}

export function ExamsClient({ items, classes, pageCount, currentPage, totalItems }: ExamsClientProps) {
    const [open, setOpen] = useState(false)
    const [generateOpen, setGenerateOpen] = useState(false)
    const [editingExam, setEditingExam] = useState<Exam | null>(null)
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
    const [selectedClasses, setSelectedClasses] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = editingExam
                ? await updateExam(editingExam.id, formData)
                : await createExam(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(editingExam ? 'Ujian diperbarui' : 'Ujian ditambahkan')
                setOpen(false)
                setEditingExam(null)
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!selectedExam || selectedClasses.length === 0) {
            toast.error('Pilih minimal satu kelas')
            return
        }

        setLoading(true)
        try {
            const result = await generateCompletionSheets(selectedExam.id, selectedClasses)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`${result.totalCreated} lembar ketuntasan berhasil dibuat`)
                setGenerateOpen(false)
                setSelectedExam(null)
                setSelectedClasses([])
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus ujian ini?')) return

        const result = await deleteExam(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Ujian dihapus')
        }
    }

    const columns: ColumnDef<Exam>[] = [
        {
            accessorKey: "name",
            header: "Nama Ujian",
            cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>
        },
        {
            accessorKey: "exam_type",
            header: "Tipe",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("exam_type")}</Badge>
        },
        {
            accessorKey: "grade_level",
            header: "Tingkat",
            cell: ({ row }) => <span>Kelas {row.getValue("grade_level")}</span>
        },
        {
            accessorKey: "academic_year",
            header: "Tahun Ajaran",
        },
        {
            id: "period",
            header: "Periode",
            cell: ({ row }) => (
                <span className="text-sm text-slate-500">
                    {formatDate(row.original.start_date)} - {formatDate(row.original.end_date)}
                </span>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const exam = row.original
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedExam(exam); setGenerateOpen(true) }}
                        >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Generate
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingExam(exam); setOpen(true) }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(exam.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            }
        }
    ]

    const currentYear = new Date().getFullYear()
    const academicYears = [
        `${currentYear}/${currentYear + 1}`,
        `${currentYear - 1}/${currentYear}`,
    ]

    const examTypes = ['UTS', 'UAS', 'UKK', 'Ujian Praktik', 'Ujian Sekolah']

    // Filter classes for selected exam
    const filteredClassesForExam = selectedExam
        ? classes.filter(c => c.grade_level === selectedExam.grade_level)
        : []

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Ujian</h1>
                    <p className="text-slate-500 mt-1">Kelola ujian dan generate lembar ketuntasan</p>
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingExam(null) }}>
                    <DialogTrigger asChild>
                        <Button className="gradient-primary border-0">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Ujian
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingExam ? 'Edit Ujian' : 'Tambah Ujian'}</DialogTitle>
                            <DialogDescription>
                                {editingExam ? 'Edit data ujian' : 'Tambahkan ujian baru ke sistem'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Ujian</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="UAS Semester Genap 2024/2025"
                                    defaultValue={editingExam?.name}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="exam_type">Tipe Ujian</Label>
                                    <Select name="exam_type" defaultValue={editingExam?.exam_type || 'UAS'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {examTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">Tingkat Kelas</Label>
                                    <Select name="grade_level" defaultValue={editingExam?.grade_level?.toString() || '12'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tingkat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Kelas 10</SelectItem>
                                            <SelectItem value="11">Kelas 11</SelectItem>
                                            <SelectItem value="12">Kelas 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="academic_year">Tahun Ajaran</Label>
                                <Select name="academic_year" defaultValue={editingExam?.academic_year || academicYears[0]}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map(year => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="date"
                                        defaultValue={editingExam?.start_date}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="date"
                                        defaultValue={editingExam?.end_date}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" className="gradient-primary border-0" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingExam ? 'Simpan' : 'Tambah'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Generate Sheets Dialog */}
            <Dialog open={generateOpen} onOpenChange={(v) => { setGenerateOpen(v); if (!v) { setSelectedExam(null); setSelectedClasses([]) } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Generate Lembar Ketuntasan</DialogTitle>
                        <DialogDescription>
                            Pilih kelas untuk generate lembar ketuntasan ujian: {selectedExam?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {filteredClassesForExam.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">
                                Tidak ada kelas untuk tingkat {selectedExam?.grade_level}
                            </p>
                        ) : (
                            filteredClassesForExam.map((cls) => (
                                <div key={cls.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50">
                                    <Checkbox
                                        id={cls.id}
                                        checked={selectedClasses.includes(cls.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedClasses([...selectedClasses, cls.id])
                                            } else {
                                                setSelectedClasses(selectedClasses.filter(id => id !== cls.id))
                                            }
                                        }}
                                    />
                                    <label htmlFor={cls.id} className="flex-1 cursor-pointer">
                                        <p className="font-medium">{cls.name}</p>
                                        <p className="text-sm text-slate-500">{cls.major} • {cls.academic_year}</p>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            className="gradient-primary border-0"
                            onClick={handleGenerate}
                            disabled={loading || selectedClasses.length === 0}
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Generate ({selectedClasses.length} kelas)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DataTable
                columns={columns}
                data={items}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari ujian..."
            />
        </div>
    )
}
