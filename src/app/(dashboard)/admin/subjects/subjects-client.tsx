'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, BookOpen, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { createSubject, updateSubject, deleteSubject } from '@/actions/admin'
import type { Subject } from '@/types/database'

interface SubjectsClientProps {
    subjects: Subject[]
}

export function SubjectsClient({ subjects }: SubjectsClientProps) {
    const [open, setOpen] = useState(false)
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = editingSubject
                ? await updateSubject(editingSubject.id, formData)
                : await createSubject(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(editingSubject ? 'Mata pelajaran diperbarui' : 'Mata pelajaran ditambahkan')
                setOpen(false)
                setEditingSubject(null)
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus mata pelajaran ini?')) return

        const result = await deleteSubject(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Mata pelajaran dihapus')
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Mata Pelajaran</h1>
                    <p className="text-slate-500 mt-1">Kelola daftar mata pelajaran</p>
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingSubject(null) }}>
                    <DialogTrigger asChild>
                        <Button className="gradient-primary border-0">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Mapel
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</DialogTitle>
                            <DialogDescription>
                                {editingSubject ? 'Edit data mata pelajaran' : 'Tambahkan mata pelajaran baru ke sistem'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="MTK"
                                    defaultValue={editingSubject?.code}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Matematika"
                                    defaultValue={editingSubject?.name}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Deskripsi mata pelajaran..."
                                    defaultValue={editingSubject?.description || ''}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" className="gradient-primary border-0" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingSubject ? 'Simpan' : 'Tambah'}
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
                            <CardTitle className="text-lg">Daftar Mata Pelajaran</CardTitle>
                            <CardDescription>{subjects.length} mata pelajaran terdaftar</CardDescription>
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
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>Belum ada mata pelajaran</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell className="font-mono font-medium">{subject.code}</TableCell>
                                        <TableCell className="font-medium">{subject.name}</TableCell>
                                        <TableCell className="text-slate-500 max-w-xs truncate">
                                            {subject.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                                                {subject.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => { setEditingSubject(subject); setOpen(true) }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(subject.id)}
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
