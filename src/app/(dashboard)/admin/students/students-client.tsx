"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { updateStudent, deleteStudent, createStudent } from '@/actions/admin'
import type { Profile } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { getColumns } from './columns'
import { StudentImportWizard } from './import-wizard'

interface StudentsClientProps {
    items: Profile[]
    classes: { id: string, name: string }[]
    pageCount: number
    currentPage: number
    totalItems: number
}

export function StudentsClient({
    items,
    classes,
    pageCount,
    currentPage,
    totalItems
}: StudentsClientProps) {
    const [open, setOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            let result;
            if (editingStudent) {
                result = await updateStudent(editingStudent.id, formData)
            } else {
                result = await createStudent(formData)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(editingStudent ? 'Data siswa diperbarui' : 'Siswa baru berhasil ditambahkan')
                setOpen(false)
                setEditingStudent(null)
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus data siswa ini?')) return

        const result = await deleteStudent(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Data siswa dihapus')
        }
    }

    const columns = useMemo(() => getColumns({
        onEdit: (student) => {
            setEditingStudent(student)
            setOpen(true)
        },
        onDelete: handleDelete
    }), [])

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Data Siswa</h1>
                    <p className="text-slate-500 mt-1">Kelola data siswa terdaftar</p>
                </div>
                <div className="flex gap-2">
                    <StudentImportWizard classes={classes} />
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingStudent(null) }}>
                        <DialogTrigger asChild>
                            <Button className="gradient-primary border-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Siswa
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
                                <DialogDescription>
                                    {editingStudent ? 'Perbarui informasi profil siswa' : 'Masukkan data siswa baru. Akun akan dibuat otomatis.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Nama Lengkap</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        defaultValue={editingStudent?.full_name}
                                        required
                                        placeholder="Contoh: Ahmad Fauzi"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nisn">NISN</Label>
                                    <Input
                                        id="nisn"
                                        name="nisn"
                                        defaultValue={editingStudent?.nisn || ''}
                                        placeholder="Nomor Induk Siswa Nasional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">No. HP</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={editingStudent?.phone || ''}
                                        placeholder="08..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={editingStudent?.email || ''}
                                        disabled={!!editingStudent}
                                        required
                                        className={editingStudent ? "bg-slate-100" : ""}
                                        placeholder="email@sekolah.sch.id"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Batal
                                    </Button>
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

            <DataTable
                columns={columns}
                data={items}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari nama, NISN, atau email..."
            />
        </div>
    )
}
