'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Users, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { createTeacherAssignment, deleteTeacherAssignment } from '@/actions/admin'
import type { TeacherAssignment } from '@/types/database'

interface SimpleProfile {
    id: string
    full_name: string
}

interface SimpleSubject {
    id: string
    name: string
    code: string
}

interface SimpleClass {
    id: string
    name: string
    academic_year: string
}

interface TeachersClientProps {
    assignments: (TeacherAssignment & { teacher?: SimpleProfile; subject?: SimpleSubject; class?: SimpleClass })[]
    teachers: SimpleProfile[]
    subjects: SimpleSubject[]
    classes: SimpleClass[]
}

export function TeachersClient({ assignments, teachers, subjects, classes }: TeachersClientProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredAssignments = assignments.filter(a =>
        a.teacher?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.class?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = await createTeacherAssignment(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Pengajaran ditambahkan')
                setOpen(false)
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus pengajaran ini?')) return

        const result = await deleteTeacherAssignment(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Pengajaran dihapus')
        }
    }

    const currentYear = new Date().getFullYear()
    const academicYears = [
        `${currentYear}/${currentYear + 1}`,
        `${currentYear - 1}/${currentYear}`,
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Pengajaran</h1>
                    <p className="text-slate-500 mt-1">Kelola tugas mengajar guru</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gradient-primary border-0">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Pengajaran
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Pengajaran</DialogTitle>
                            <DialogDescription>
                                Tentukan guru yang mengajar mata pelajaran di kelas tertentu
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="teacher_id">Guru</Label>
                                <Select name="teacher_id" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih guru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(teacher => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject_id">Mata Pelajaran</Label>
                                <Select name="subject_id" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih mata pelajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(subject => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name} ({subject.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class_id">Kelas</Label>
                                <Select name="class_id" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(cls => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name} ({cls.academic_year})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="academic_year">Tahun Ajaran</Label>
                                <Select name="academic_year" defaultValue={academicYears[0]}>
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
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" className="gradient-primary border-0" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Tambah
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Daftar Pengajaran</CardTitle>
                            <CardDescription>{assignments.length} pengajaran terdaftar</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari..."
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
                                <TableHead>Guru</TableHead>
                                <TableHead>Mata Pelajaran</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Tahun Ajaran</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAssignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>Belum ada pengajaran</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.teacher?.full_name}</TableCell>
                                        <TableCell>{assignment.subject?.name}</TableCell>
                                        <TableCell>{assignment.class?.name}</TableCell>
                                        <TableCell>{assignment.academic_year}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(assignment.id)}
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
