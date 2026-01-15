"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createSubject, updateSubject, deleteSubject } from '@/actions/admin'
import type { Subject } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { getColumns } from './columns'

interface SubjectsClientProps {
    subjects: Subject[]
    pageCount: number
    currentPage: number
    totalItems: number
}

export function SubjectsClient({
    subjects,
    pageCount,
    currentPage,
    totalItems
}: SubjectsClientProps) {
    const [open, setOpen] = useState(false)
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
    const [loading, setLoading] = useState(false)

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

    const columns = useMemo(() => getColumns({
        onEdit: (subject) => {
            setEditingSubject(subject)
            setOpen(true)
        },
        onDelete: handleDelete
    }), [])

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

            <DataTable
                columns={columns}
                data={subjects}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari mata pelajaran..."
            />
        </div>
    )
}
