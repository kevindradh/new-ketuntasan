'use client'

import { useState } from 'react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2, Users, Check, ChevronsUpDown } from 'lucide-react'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import { createClass, updateClass, deleteClass } from '@/actions/admin'
import type { Class } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from "@tanstack/react-table"
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface ClassesClientProps {
    items: (Class & { homeroom_teacher?: { id: string; full_name: string }; counselor?: { id: string; full_name: string }; class_students?: { count: number }[] })[]
    teachers: { id: string; full_name: string }[]
    counselors: { id: string; full_name: string }[]
    pageCount: number
    currentPage: number
    totalItems: number
}

export function ClassesClient({ items, teachers, counselors, pageCount, currentPage, totalItems }: ClassesClientProps) {
    const [open, setOpen] = useState(false)
    const [editingClass, setEditingClass] = useState<Class | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentGrade = searchParams.get('grade') || 'all'

    // Combobox states
    const [selectedHomeroomId, setSelectedHomeroomId] = useState("")
    const [selectedCounselorId, setSelectedCounselorId] = useState("")
    const [openHomeroom, setOpenHomeroom] = useState(false)
    const [openCounselor, setOpenCounselor] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setEditingClass(null)
            setSelectedHomeroomId("")
            setSelectedCounselorId("")
        }
    }

    const handleEdit = (cls: Class | null) => {
        setEditingClass(cls)
        if (cls) {
            setSelectedHomeroomId(cls.homeroom_teacher_id || "")
            setSelectedCounselorId(cls.counselor_id || "")
        } else {
            setSelectedHomeroomId("")
            setSelectedCounselorId("")
        }
        setOpen(true)
    }

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
                handleOpenChange(false)
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

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Nama Kelas",
            cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>
        },
        {
            accessorKey: "grade_level",
            header: "Tingkat",
            cell: ({ row }) => <Badge variant="outline">Kelas {row.getValue("grade_level")}</Badge>
        },
        {
            accessorKey: "major",
            header: "Jurusan",
            cell: ({ row }) => row.getValue("major") || "-"
        },
        {
            accessorKey: "academic_year",
            header: "Tahun Ajaran",
        },
        {
            id: "homeroom",
            header: "Wali Kelas",
            cell: ({ row }) => row.original.homeroom_teacher?.full_name || "-"
        },
        {
            id: "counselor",
            header: "Guru BK",
            cell: ({ row }) => row.original.counselor?.full_name || "-" // New column
        },
        {
            id: "students",
            header: "Siswa",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" />
                    {row.original.class_students?.[0]?.count || 0}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const cls = row.original
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Kelola Siswa"
                        >
                            <Link href={`/admin/classes/${cls.id}`}>
                                <Users className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cls)}
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
                )
            }
        }
    ]

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
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="gradient-primary border-0" onClick={() => handleEdit(null)}>
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
                            <div className="space-y-2 flex flex-col">
                                <Label>Wali Kelas</Label>
                                <Popover open={openHomeroom} onOpenChange={setOpenHomeroom}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openHomeroom}
                                            className="justify-between font-normal"
                                        >
                                            {selectedHomeroomId
                                                ? teachers.find((t) => t.id === selectedHomeroomId)?.full_name
                                                : "Pilih wali kelas..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Cari guru..." />
                                            <CommandList>
                                                <CommandEmpty>Guru tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {teachers.map((teacher) => (
                                                        <CommandItem
                                                            key={teacher.id}
                                                            value={teacher.full_name}
                                                            onSelect={() => {
                                                                setSelectedHomeroomId(teacher.id)
                                                                setOpenHomeroom(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedHomeroomId === teacher.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {teacher.full_name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <input type="hidden" name="homeroom_teacher_id" value={selectedHomeroomId} />
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label>Guru BK</Label>
                                <Popover open={openCounselor} onOpenChange={setOpenCounselor}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCounselor}
                                            className="justify-between font-normal"
                                        >
                                            {selectedCounselorId
                                                ? counselors.find((c) => c.id === selectedCounselorId)?.full_name
                                                : "Pilih Guru BK..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Cari guru BK..." />
                                            <CommandList>
                                                <CommandEmpty>Guru BK tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {counselors.map((c) => (
                                                        <CommandItem
                                                            key={c.id}
                                                            value={c.full_name}
                                                            onSelect={() => {
                                                                setSelectedCounselorId(c.id)
                                                                setOpenCounselor(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCounselorId === c.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {c.full_name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <input type="hidden" name="counselor_id" value={selectedCounselorId} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
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

            <DataTable
                columns={columns}
                data={items}
                pageCount={pageCount}
                currentPage={currentPage}
                totalItems={totalItems}
                searchPlaceholder="Cari kelas atau jurusan..."
            >
                <Select
                    value={currentGrade}
                    onValueChange={(value) => {
                        const params = new URLSearchParams(searchParams.toString())
                        if (value === 'all') {
                            params.delete('grade')
                        } else {
                            params.set('grade', value)
                        }
                        params.set('page', '1') // Reset pagination
                        router.push(`?${params.toString()}`)
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Tingkat</SelectItem>
                        <SelectItem value="10">Kelas 10</SelectItem>
                        <SelectItem value="11">Kelas 11</SelectItem>
                        <SelectItem value="12">Kelas 12</SelectItem>
                    </SelectContent>
                </Select>
            </DataTable>
        </div>
    )
}
