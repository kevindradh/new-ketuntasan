"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Plus, Trash2, BookOpen, GraduationCap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createTeacherAssignment, deleteTeacherAssignment } from '@/actions/admin' // Reuse existing actions
import type { Profile } from '@/types/database'

interface AssignmentsClientProps {
    teacher: Profile
    assignments: any[]
    subjects: { id: string, name: string, code: string }[]
    classes: { id: string, name: string, academic_year: string }[]
}

export function AssignmentsClient({
    teacher,
    assignments,
    subjects,
    classes
}: AssignmentsClientProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const classId = formData.get('class_id') as string
        const selectedClass = classes.find(c => c.id === classId)

        if (selectedClass) {
            formData.append('academic_year', selectedClass.academic_year)
        }

        // Append teacher_id manually since it's not in the form (select) but from props
        formData.append('teacher_id', teacher.id)

        const result = await createTeacherAssignment(formData)

        setLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Penugasan berhasil ditambahkan')
            setOpen(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus penugasan ini?')) return

        const result = await deleteTeacherAssignment(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Penugasan dihapus')
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <Link
                    href="/admin/teachers"
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Data Guru
                </Link>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Penugasan Mengajar</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {teacher.full_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">{teacher.full_name}</p>
                                <p className="text-sm text-slate-500">{teacher.email}</p>
                            </div>
                        </div>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="gradient-primary border-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Penugasan
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Penugasan</DialogTitle>
                                <DialogDescription>
                                    Tetapkan mata pelajaran dan kelas untuk guru ini.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject_id">Mata Pelajaran</Label>
                                    <Select name="subject_id" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Mapel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="class_id">Kelas</Label>
                                    <Select name="class_id" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name} ({c.academic_year})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="gradient-primary border-0" disabled={loading}>
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Daftar Kelas Ajar</CardTitle>
                    <CardDescription>Mata pelajaran yang diampu oleh {teacher.full_name}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mata Pelajaran</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Tahun Ajar</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                        Belum ada penugasan aktif
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-slate-400" />
                                                {item.subject.name}
                                                <span className="text-xs text-slate-400">({item.subject.code})</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-slate-400" />
                                                {item.class.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.academic_year}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
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
