"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash2, ArrowLeft, Check, ChevronsUpDown, Loader2, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { addStudentToClass, removeStudentFromClass, bulkAddStudentsToClass } from '@/actions/admin'
import type { Class, Profile } from '@/types/database'

interface ClassDetailsClientProps {
    classData: Class & { homeroom_teacher?: { full_name: string } }
    enrolledStudents: ({ id: string; student: Profile })[] // id is class_student id
    allStudents: Profile[]
    metadata: {
        currentPage: number
        pageCount: number
        totalItems: number
        limit: number
    }
}

export function ClassDetailsClient({ classData, enrolledStudents, allStudents, metadata }: ClassDetailsClientProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false) // For Add Student Dialog
    const [loading, setLoading] = useState(false)

    // Combobox state
    const [comboboxOpen, setComboboxOpen] = useState(false)
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

    // Filter available students (not already enrolled)
    const enrolledStudentIds = new Set(enrolledStudents.map(e => e.student.id))
    const availableStudents = allStudents.filter(s => !enrolledStudentIds.has(s.id))

    const handleAddStudent = async () => {
        if (selectedStudentIds.length === 0) return
        setLoading(true)

        try {
            const result = await bulkAddStudentsToClass(classData.id, selectedStudentIds)

            if (result.error) {
                toast.error(result.error)
            } else {
                if (result.message) {
                    toast.success(result.message)
                } else {
                    toast.success('Siswa berhasil ditambahkan ke kelas')
                }
                setOpen(false)
                setSelectedStudentIds([])
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveStudent = async (enrollmentId: string) => {
        if (!confirm('Yakin ingin mengeluarkan siswa dari kelas ini?')) return

        const result = await removeStudentFromClass(enrollmentId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Siswa dikeluarkan dari kelas')
            router.refresh()
        }
    }

    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', String(newPage))
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{classData.name}</h1>
                    <p className="text-slate-500">
                        {classData.grade_level ? `Kelas ${classData.grade_level}` : ''} {classData.major} • {classData.academic_year}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Siswa</CardTitle>
                            <CardDescription>
                                {enrolledStudents.length} siswa terdaftar
                            </CardDescription>
                        </div>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="gradient-primary border-0">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Siswa
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Siswa ke Kelas</DialogTitle>
                                    <DialogDescription>
                                        Pilih siswa untuk ditambahkan ke kelas {classData.name}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <div className="space-y-4 py-4">
                                        {/* Selected Students Area */}
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-muted-foreground">
                                                Siswa dipilih ({selectedStudentIds.length})
                                            </div>
                                            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-slate-50">
                                                {selectedStudentIds.length === 0 && (
                                                    <span className="text-sm text-muted-foreground italic">Belum ada siswa dipilih</span>
                                                )}
                                                {selectedStudentIds.map(id => {
                                                    const student = allStudents.find(s => s.id === id)
                                                    if (!student) return null
                                                    return (
                                                        <Badge key={id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-white border shadow-sm hover:bg-slate-100">
                                                            {student.full_name}
                                                            <button
                                                                onClick={() => setSelectedStudentIds(prev => prev.filter(mid => mid !== id))}
                                                                className="ml-1 rounded-full p-0.5 hover:bg-slate-200 text-slate-500 hover:text-red-500 transition-colors"
                                                            >
                                                                <del className="sr-only">Hapus</del>
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Search & Select Area */}
                                        <div className="border rounded-md overflow-hidden">
                                            <Command className="h-[250px]">
                                                <CommandInput placeholder="Cari nama siswa atau NISN..." />
                                                <CommandList>
                                                    <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup heading="Daftar Siswa">
                                                        {availableStudents
                                                            .filter(s => !selectedStudentIds.includes(s.id))
                                                            .map((student) => (
                                                                <CommandItem
                                                                    key={student.id}
                                                                    value={student.full_name + " " + student.nisn}
                                                                    onSelect={() => {
                                                                        setSelectedStudentIds(prev => [...prev, student.id])
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                                                    <div className="flex flex-col">
                                                                        <span>{student.full_name}</span>
                                                                        {student.nisn && <span className="text-xs text-muted-foreground">NISN: {student.nisn}</span>}
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </div>
                                    </div>

                                    {selectedStudentIds.length > 0 && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            {selectedStudentIds.length} siswa akan ditambahkan.
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                                    <Button onClick={handleAddStudent} disabled={selectedStudentIds.length === 0 || loading} className="gradient-primary border-0">
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Tambahkan ({selectedStudentIds.length})
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>NISN</TableHead>
                                    <TableHead>Nama Lengkap</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrolledStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                            Belum ada siswa di kelas ini
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    enrolledStudents.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-mono">{item.student.nisn || '-'}</TableCell>
                                            <TableCell className="font-medium">{item.student.full_name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleRemoveStudent(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>


                        {/* Pagination Controls */}
                        <div className="flex items-center justify-end space-x-2 mt-4">
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(1)}
                                disabled={metadata.currentPage === 1 || loading}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(metadata.currentPage - 1)}
                                disabled={metadata.currentPage <= 1 || loading}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {metadata.currentPage} of {metadata.pageCount}
                            </div>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(metadata.currentPage + 1)}
                                disabled={metadata.currentPage >= metadata.pageCount || loading}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(metadata.pageCount)}
                                disabled={metadata.currentPage >= metadata.pageCount || loading}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle>Info Kelas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-slate-500">Wali Kelas</div>
                                <div className="text-slate-900 font-medium">{classData.homeroom_teacher?.full_name || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-500">Tahun Ajaran</div>
                                <div className="text-slate-900">{classData.academic_year}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-500">Status</div>
                                <Badge variant={classData.is_active ? 'default' : 'secondary'} className="mt-1">
                                    {classData.is_active ? 'Aktif' : 'Tidak Aktif'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
