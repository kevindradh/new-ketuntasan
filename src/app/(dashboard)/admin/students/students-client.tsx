"use client"

import { useMemo, useState, useTransition } from 'react'
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
import { Plus, Loader2, KeyRound, Filter, ChevronDown, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateStudent, deleteStudent, createStudent, resetUserPassword, bulkUpdateStudentStatus } from '@/actions/admin'
import type { Profile } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { getColumns } from './columns'
import { StudentImportWizard } from './import-wizard'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from 'next/navigation'

interface StudentsClientProps {
    items: Profile[]
    classes: { id: string, name: string, academic_year: string }[]
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
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Profile | null>(null)
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
    const [selectedStudentForReset, setSelectedStudentForReset] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(false)
    const [rowSelection, setRowSelection] = useState({})
    const [isPending, startTransition] = useTransition()

    const currentStatus = searchParams.get('status') || 'ACTIVE'

    const selectedIds = useMemo(() => Object.keys(rowSelection), [rowSelection])

    const handleStatusFilter = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set('status', value)
        } else {
            params.delete('status')
        }
        params.set('page', '1') // Reset to page 1
        startTransition(() => {
            router.push(`?${params.toString()}`)
        })
    }

    const handleBulkUpdate = async (status: string) => {
        if (!selectedIds.length) return
        if (!confirm(`Yakin ingin mengubah status ${selectedIds.length} siswa menjadi ${status}?`)) return

        setLoading(true)
        try {
            const result = await bulkUpdateStudentStatus(selectedIds, status)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`${selectedIds.length} siswa berhasil diperbarui`)
                setRowSelection({})
            }
        } catch {
            toast.error('Gagal melakukan bulk update')
        } finally {
            setLoading(false)
        }
    }

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

    const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedStudentForReset) return

        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get('password') as string

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password minimal 6 karakter')
            setLoading(false)
            return
        }

        try {
            const result = await resetUserPassword(selectedStudentForReset.id, newPassword)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Password siswa berhasil direset')
                setResetPasswordOpen(false)
                setSelectedStudentForReset(null)
            }
        } catch (error) {
            toast.error('Gagal mereset password. Silakan coba lagi.')
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
        onDelete: handleDelete,
        onResetPassword: (student) => {
            setSelectedStudentForReset(student)
            setResetPasswordOpen(true)
        }
    }), [])

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Data Siswa</h1>
                    <p className="text-slate-500 mt-1">Kelola data siswa terdaftar</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Status Filter */}
                    <Select value={currentStatus} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-[180px] h-9 bg-white">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Siswa Aktif</SelectItem>
                            <SelectItem value="GRADUATED">Lulus (Alumni)</SelectItem>
                            <SelectItem value="MOVED">Pindah</SelectItem>
                            <SelectItem value="DROPPED_OUT">Keluar (DO)</SelectItem>
                            <SelectItem value="ALL">Semua Data</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 border-dashed border-slate-300 text-slate-600">
                                    {selectedIds.length} Terpilih
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi Massal</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleBulkUpdate('GRADUATED')}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-slate-500" />
                                    Set Lulus
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkUpdate('ACTIVE')}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Set Aktif
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleBulkUpdate('MOVED')}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Set Pindah
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <StudentImportWizard classes={classes} />
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingStudent(null) }}>
                        <DialogTrigger asChild>
                            <Button className="gradient-primary border-0 h-9">
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
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select name="status" defaultValue={editingStudent?.status || "ACTIVE"}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Aktif</SelectItem>
                                            <SelectItem value="GRADUATED">Lulus</SelectItem>
                                            <SelectItem value="MOVED">Pindah</SelectItem>
                                            <SelectItem value="DROPPED_OUT">Keluar</SelectItem>
                                        </SelectContent>
                                    </Select>
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

                    <Dialog open={resetPasswordOpen} onOpenChange={(v) => { setResetPasswordOpen(v); if (!v) setSelectedStudentForReset(null) }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reset Password Siswa</DialogTitle>
                                <DialogDescription>
                                    Set password baru untuk <strong>{selectedStudentForReset?.full_name}</strong>.
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
                </div>
            </div>

            <DataTable
                columns={columns}
                data={items}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari nama, NISN, atau email..."
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                enableRowSelection={true}
            />
        </div>
    )
}
