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
import { Plus, Loader2, MoreHorizontal, Pencil, Trash2, ArrowRight, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { createTeacher, updateTeacher, deleteTeacher, resetUserPassword } from '@/actions/admin'
import type { Profile } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { TeacherImportWizard } from './import-wizard'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import Link from 'next/link'

interface TeachersClientProps {
    items: Profile[]
    pageCount: number
    currentPage: number
    totalItems: number
}

export function TeachersClient({
    items,
    pageCount,
    currentPage,
    totalItems
}: TeachersClientProps) {
    const [open, setOpen] = useState(false)
    const [editingTeacher, setEditingTeacher] = useState<Profile | null>(null)
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
    const [selectedTeacherForReset, setSelectedTeacherForReset] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            let result;
            if (editingTeacher) {
                result = await updateTeacher(editingTeacher.id, formData)
            } else {
                result = await createTeacher(formData)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(editingTeacher ? 'Data guru diperbarui' : 'Guru baru berhasil ditambahkan')
                setOpen(false)
                setEditingTeacher(null)
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedTeacherForReset) return

        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get('password') as string

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password minimal 6 karakter')
            setLoading(false)
            return
        }

        try {
            const result = await resetUserPassword(selectedTeacherForReset.id, newPassword)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Password guru berhasil direset')
                setResetPasswordOpen(false)
                setSelectedTeacherForReset(null)
            }
        } catch (error) {
            toast.error('Gagal mereset password. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus data guru ini?')) return

        const result = await deleteTeacher(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Data guru dihapus')
        }
    }

    const columns: ColumnDef<Profile>[] = [
        {
            accessorKey: "full_name",
            header: "Nama Lengkap",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "No. HP",
            cell: ({ row }) => row.getValue("phone") || "-"
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const teacher = row.original
                return (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Link href={`/admin/teachers/${teacher.id}/assignments`}>
                                <ArrowRight className="h-4 w-4" />
                                <span className="sr-only">Atur Mapel</span>
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            onClick={() => {
                                setEditingTeacher(teacher)
                                setOpen(true)
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => {
                                setSelectedTeacherForReset(teacher)
                                setResetPasswordOpen(true)
                            }}
                        >
                            <KeyRound className="h-4 w-4" />
                            <span className="sr-only">Reset Password</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(teacher.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Hapus</span>
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Data Guru</h1>
                    <p className="text-slate-500 mt-1">Kelola data guru dan penugasan mapel</p>
                </div>
                <div className="flex gap-2">
                    <TeacherImportWizard />
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingTeacher(null) }}>
                        <DialogTrigger asChild>
                            <Button className="gradient-primary border-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Guru
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</DialogTitle>
                                <DialogDescription>
                                    {editingTeacher ? 'Perbarui informasi profil guru' : 'Masukkan data guru baru. Akun akan dibuat otomatis.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Nama Lengkap</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        defaultValue={editingTeacher?.full_name}
                                        required
                                        placeholder="Contoh: Budi Santoso, S.Pd"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">No. HP</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={editingTeacher?.phone || ''}
                                        placeholder="08..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={editingTeacher?.email || ''}
                                        disabled={!!editingTeacher}
                                        required
                                        className={editingTeacher ? "bg-slate-100" : ""}
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

            <Dialog open={resetPasswordOpen} onOpenChange={(v) => { setResetPasswordOpen(v); if (!v) setSelectedTeacherForReset(null) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password Guru</DialogTitle>
                        <DialogDescription>
                            Set password baru untuk <strong>{selectedTeacherForReset?.full_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password Baru</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type="text"
                                    required
                                    minLength={6}
                                    placeholder="Masukkan password baru"
                                    className="pr-10"
                                />
                                <KeyRound className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Minimal 6 karakter.</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setResetPasswordOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="gradient-primary border-0" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Reset Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DataTable
                columns={columns}
                data={items}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari nama atau email..."
            />
        </div>
    )
}
