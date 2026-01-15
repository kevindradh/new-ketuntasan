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
import { Plus, Trash2, ArrowLeft, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { addStudentToClass, removeStudentFromClass } from '@/actions/admin'
import type { Class, Profile } from '@/types/database'

interface ClassDetailsClientProps {
    classData: Class & { homeroom_teacher?: { full_name: string } }
    enrolledStudents: ({ id: string; student: Profile })[] // id is class_student id
    allStudents: Profile[]
}

export function ClassDetailsClient({ classData, enrolledStudents, allStudents }: ClassDetailsClientProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false) // For Add Student Dialog
    const [loading, setLoading] = useState(false)

    // Combobox state
    const [comboboxOpen, setComboboxOpen] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState("")

    // Filter available students (not already enrolled)
    const enrolledStudentIds = new Set(enrolledStudents.map(e => e.student.id))
    const availableStudents = allStudents.filter(s => !enrolledStudentIds.has(s.id))

    const handleAddStudent = async () => {
        if (!selectedStudentId) return
        setLoading(true)

        const formData = new FormData()
        formData.append('class_id', classData.id)
        formData.append('student_id', selectedStudentId)

        try {
            const result = await addStudentToClass(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Siswa berhasil ditambahkan ke kelas')
                setOpen(false)
                setSelectedStudentId("")
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
                                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={comboboxOpen}
                                                className="w-full justify-between"
                                            >
                                                {selectedStudentId
                                                    ? availableStudents.find((student) => student.id === selectedStudentId)?.full_name
                                                    : "Pilih siswa..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Cari siswa..." />
                                                <CommandList>
                                                    <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {availableStudents.slice(0, 50).map((student) => (
                                                            <CommandItem
                                                                key={student.id}
                                                                value={student.full_name}
                                                                onSelect={() => {
                                                                    setSelectedStudentId(student.id)
                                                                    setComboboxOpen(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{student.full_name}</span>
                                                                    <span className="text-xs text-muted-foreground">{student.nisn}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                                    <Button onClick={handleAddStudent} disabled={!selectedStudentId || loading} className="gradient-primary border-0">
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Tambahkan
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
