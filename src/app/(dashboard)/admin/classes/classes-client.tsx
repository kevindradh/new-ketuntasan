'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, School, Loader2, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createClass, updateClass, deleteClass } from '@/actions/admin'
import type { Class } from '@/types/database'

interface ClassesClientProps {
    classes: (Class & { homeroom_teacher?: { id: string; full_name: string }; class_students?: { count: number }[] })[]
    teachers: { id: string; full_name: string }[]
}

export function ClassesClient({ classes, teachers }: ClassesClientProps) {
    const [open, setOpen] = useState(false)
    const [editingClass, setEditingClass] = useState<Class | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.major?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = editingClass
                ? await updateClass(editingClass.id, formData)
                : await createClass(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(editingClass ? 'Kelas diperbarui' : 'Kelas ditambahkan')
                setOpen(false)
                setEditingClass(null)
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus kelas ini?')) return

        const result = await deleteClass(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Kelas dihapus')
        }
    }

    const currentYear = new Date().getFullYear()
    const academicYears = [
        `${currentYear}/${currentYear + 1}`,
        `${currentYear - 1}/${currentYear}`,
        `${currentYear + 1}/${currentYear + 2}`,
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Kelas</h1>
                    <p className="text-slate-500 mt-1">Kelola daftar kelas</p>
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingClass(null) }}>
                    <DialogTrigger asChild>
                        <Button className="gradient-primary border-0">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Kelas
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingClass ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
                            <DialogDescription>
                                {editingClass ? 'Edit data kelas' : 'Tambahkan kelas baru ke sistem'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Kelas</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="XII RPL 1"
                                        defaultValue={editingClass?.name}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">Tingkat</Label>
                                    <Select name="grade_level" defaultValue={editingClass?.grade_level?.toString() || '12'}>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="major">Jurusan</Label>
                                    <Input
                                        id="major"
                                        name="major"
                                        placeholder="RPL"
                                        defaultValue={editingClass?.major || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="academic_year">Tahun Ajaran</Label>
                                    <Select name="academic_year" defaultValue={editingClass?.academic_year || academicYears[0]}>
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="homeroom_teacher_id">Wali Kelas</Label>
                                <Select name="homeroom_teacher_id" defaultValue={editingClass?.homeroom_teacher_id || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih wali kelas" />
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
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" className="gradient-primary border-0" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingClass ? 'Simpan' : 'Tambah'}
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
                            <CardTitle className="text-lg">Daftar Kelas</CardTitle>
                            <CardDescription>{classes.length} kelas terdaftar</CardDescription>
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
                                <TableHead>Nama</TableHead>
                                <TableHead>Tingkat</TableHead>
                                <TableHead>Jurusan</TableHead>
                                <TableHead>Tahun Ajaran</TableHead>
                                <TableHead>Wali Kelas</TableHead>
                                <TableHead>Siswa</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClasses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                        <School className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>Belum ada kelas</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClasses.map((cls) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="font-medium">{cls.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">Kelas {cls.grade_level}</Badge>
                                        </TableCell>
                                        <TableCell>{cls.major || '-'}</TableCell>
                                        <TableCell>{cls.academic_year}</TableCell>
                                        <TableCell>{cls.homeroom_teacher?.full_name || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                {cls.class_students?.[0]?.count || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => { setEditingClass(cls); setOpen(true) }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(cls.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
