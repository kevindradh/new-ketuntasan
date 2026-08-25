"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Loader2, ArrowRight, CheckCircle2, Users, AlertCircle, ChevronsUpDown, Check, GraduationCap } from "lucide-react"
import { getStudentsByClass, promoteStudents } from "@/actions/admin"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

interface Class {
    id: string
    name: string
    grade_level: number
    academic_year: string
    major: string | null
}

interface Student {
    id: string
    full_name: string
    nis?: string
    nisn?: string
}

function ClassCombobox({
    value,
    onChange,
    classes,
    placeholder = "Pilih kelas...",
    searchPlaceholder = "Cari kelas...",
    disabled = false
}: {
    value: string
    onChange: (value: string) => void
    classes: Class[]
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
}) {
    const [open, setOpen] = useState(false)

    const selectedClass = classes.find((c) => c.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                    disabled={disabled}
                >
                    {selectedClass ? (
                        <span>
                            {selectedClass.name} <span className="text-slate-400 text-xs ml-1">({selectedClass.academic_year})</span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>Tidak ada kelas ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {classes.map((c) => (
                                <CommandItem
                                    key={c.id}
                                    value={`${c.name} ${c.academic_year}`} // Allow searching by name and year
                                    onSelect={() => {
                                        onChange(c.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === c.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {c.name} <span className="text-slate-400 text-xs ml-2">({c.academic_year})</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export function PromotionWizard({ classes }: { classes: Class[] }) {
    const router = useRouter()
    const [sourceClassId, setSourceClassId] = useState<string>("")
    const [targetClassId, setTargetClassId] = useState<string>("")
    const [students, setStudents] = useState<Student[]>([])
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleSourceClassChange = async (classId: string) => {
        setSourceClassId(classId)
        setLoading(true)
        try {
            const data = await getStudentsByClass(classId)
            setStudents(data)
            setSelectedStudentIds([]) // Reset selections
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(students.map(s => s.id))
        } else {
            setSelectedStudentIds([])
        }
    }

    const handleSelectStudent = (studentId: string, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(prev => [...prev, studentId])
        } else {
            setSelectedStudentIds(prev => prev.filter(id => id !== studentId))
        }
    }

    const handlePromote = async () => {
        if (!targetClassId) return toast.error("Pilih kelas tujuan")
        if (selectedStudentIds.length === 0) return toast.error("Pilih minimal 1 siswa")

        // Prevent same class promotion if mistakenly selected
        if (sourceClassId === targetClassId) return toast.error("Kelas tujuan tidak boleh sama dengan kelas asal")

        setLoading(true)
        try {
            const res = await promoteStudents(selectedStudentIds, targetClassId, sourceClassId)
            if (res.error) {
                toast.error(res.error)
            } else if (res.message) {
                toast.info(res.message)
                router.refresh()
                setSourceClassId("")
                setTargetClassId("")
                setStudents([])
                setSelectedStudentIds([])
            } else {
                toast.success(`Berhasil mempromosikan ${res.count || 0} siswa!`)
                router.refresh()
                setSourceClassId("")
                setTargetClassId("")
                setStudents([])
                setSelectedStudentIds([])
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // NEW LOGIC: DETECT GRADUATION MODE
    const sourceClass = classes.find(c => c.id === sourceClassId)
    // Assumption: Grade 12 or higher is final year.
    // Or simpler: check if there are any valid target classes. If not, and it's high grade, suggest graduation.
    // User requested "misal kelas 12". Let's stick to Grade >= 12.
    const isFinalYear = sourceClass ? sourceClass.grade_level >= 12 : false

    // Helper to parse academic year start (e.g., "2023/2024" -> 2023)
    const getYearStart = (ay: string) => parseInt(ay.split('/')[0])

    // Filter target classes based on validation rules
    const targetClasses = classes.filter(c => {
        if (!sourceClass) return false
        if (c.id === sourceClassId) return false

        // Rule 1: Same Major (if exists)
        if (sourceClass.major && c.major !== sourceClass.major) return false

        // Rule 2: Higher Grade Level (Strictly higher)
        if (c.grade_level <= sourceClass.grade_level) return false

        // Rule 3: Newer Academic Year
        const sourceYear = getYearStart(sourceClass.academic_year)
        const targetYear = getYearStart(c.academic_year)
        if (targetYear <= sourceYear) return false

        return true
    })

    const canPromote = targetClassId && selectedStudentIds.length > 0 && sourceClass && targetClasses.some(tc => tc.id === targetClassId)
    const canGraduate = isFinalYear && selectedStudentIds.length > 0 && sourceClass



    // We need separate handlers because data shape differs slightly, or unify them.
    // Let's create a unified handleProcess.

    const handleProcess = async () => {
        if (!sourceClass) return

        if (isFinalYear) {
            // GRADUATION FLOW
            if (selectedStudentIds.length === 0) return toast.error("Pilih minimal 1 siswa")
            if (!confirm(`Konfirmasi Kelulusan: Apakah Anda yakin ingin meluluskan ${selectedStudentIds.length} siswa dari ${sourceClass.name}? Status mereka akan berubah menjadi GRADUATED.`)) return

            setLoading(true)
            try {
                // Import this from actions! We need to make sure we import graduateStudents
                const { graduateStudents } = await import("@/actions/admin")
                const res = await graduateStudents(selectedStudentIds)

                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success(`Berhasil meluluskan ${res.count} siswa!`)
                    router.refresh()
                    setSourceClassId("")
                    setTargetClassId("")
                    setStudents([])
                    setSelectedStudentIds([])
                }
            } catch (err: any) {
                toast.error(err.message)
            } finally {
                setLoading(false)
            }

        } else {
            // PROMOTION FLOW
            handlePromote()
        }
    }


    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Kenaikan Kelas</h1>
                    <p className="text-slate-500 mt-1">Proses kenaikan kelas siswa untuk tahun ajaran baru.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* SOURCE COLUMN */}
                <Card className="border-slate-200 shadow-sm h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">1</span>
                            Kelas Asal
                        </CardTitle>
                        <CardDescription>Pilih kelas dan siswa yang akan dinaikkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Pilih Kelas</label>
                            <ClassCombobox
                                value={sourceClassId}
                                onChange={handleSourceClassChange}
                                classes={classes}
                                placeholder="Cari kelas asal..."
                            />
                        </div>

                        {sourceClassId && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 border rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-slate-50 border-b">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={students.length > 0 && selectedStudentIds.length === students.length}
                                            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                        />
                                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer text-slate-700">
                                            Pilih Semua
                                        </label>
                                    </div>
                                    <span className="text-xs bg-white border px-2 py-1 rounded-full font-medium text-slate-600">
                                        {selectedStudentIds.length} / {students.length}
                                    </span>
                                </div>

                                <ScrollArea className="h-[400px]">
                                    {loading ? (
                                        <div className="flex flex-col justify-center items-center h-40 space-y-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                            <p className="text-xs text-slate-400">Memuat data siswa...</p>
                                        </div>
                                    ) : students.length === 0 ? (
                                        <div className="text-center py-10 px-4">
                                            <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">Tidak ada siswa di kelas ini.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {students.map(student => (
                                                <div
                                                    key={student.id}
                                                    className={`
                                                        flex items-center space-x-3 p-3 transition-colors cursor-pointer hover:bg-slate-50
                                                        ${selectedStudentIds.includes(student.id) ? 'bg-emerald-50/50' : ''}
                                                    `}
                                                    onClick={(e) => {
                                                        if ((e.target as HTMLElement).getAttribute('role') !== 'checkbox') {
                                                            handleSelectStudent(student.id, !selectedStudentIds.includes(student.id))
                                                        }
                                                    }}
                                                >
                                                    <Checkbox
                                                        id={student.id}
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <label className="text-sm font-medium text-slate-900 cursor-pointer block truncate">
                                                            {student.full_name}
                                                        </label>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {student.nis ? `NIS: ${student.nis}` : `NISN: ${student.nisn || '-'}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* TARGET COLUMN */}
                <div className="space-y-6">
                    {isFinalYear ? (
                        /* GRADUATION CARD */
                        <Card className="border-emerald-200 shadow-sm bg-emerald-50/50 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
                                    Konfirmasi Kelulusan
                                </CardTitle>
                                <CardDescription className="text-emerald-700/80">
                                    Kelas ini adalah tingkat akhir. Siswa akan diluluskan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-white rounded-lg border border-emerald-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-100 rounded-full">
                                            <GraduationCap className="h-5 w-5 text-emerald-700" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Status akan berubah: GRADUATED</p>
                                            <p className="text-xs text-slate-500">Siswa tidak akan aktif lagi di kelas manapun.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Box */}
                                {selectedStudentIds.length > 0 && (
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                            Konfirmasi
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-slate-500">Jumlah Siswa:</div>
                                            <div className="font-medium text-slate-900 text-right">{selectedStudentIds.length}</div>
                                            <div className="text-slate-500">Asal:</div>
                                            <div className="font-medium text-slate-900 text-right">{sourceClass?.name}</div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full gradient-primary shadow-lg hover:shadow-emerald-200 transition-all"
                                    disabled={loading || selectedStudentIds.length === 0}
                                    onClick={handleProcess}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Luluskan {selectedStudentIds.length > 0 ? selectedStudentIds.length : ''} Siswa
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        /* PROMOTION CARD */
                        <Card className={`border-slate-200 shadow-sm transition-all duration-300 ${!sourceClassId ? 'opacity-75' : ''}`}>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">2</span>
                                    Kelas Tujuan
                                </CardTitle>
                                <CardDescription>Pilih kelas tujuan untuk siswa terpilih.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Pilih Kelas</label>
                                    <ClassCombobox
                                        value={targetClassId}
                                        onChange={setTargetClassId}
                                        classes={targetClasses}
                                        placeholder="Cari kelas tujuan..."
                                        disabled={!sourceClassId}
                                    />
                                    {sourceClassId && targetClasses.length === 0 && (
                                        <p className="text-xs text-red-500 mt-2">
                                            Tidak ada kelas tujuan yang memenuhi syarat (Jurusan sama, Tingkat lebih tinggi, Tahun Ajaran lebih baru).
                                        </p>
                                    )}
                                </div>

                                {/* Info Alert */}
                                <Alert className="bg-emerald-50 border-emerald-200">
                                    <AlertCircle className="h-4 w-4 text-emerald-700" />
                                    <AlertTitle className="text-emerald-800 ml-2">Informasi</AlertTitle>
                                    <AlertDescription className="text-emerald-700 ml-2 text-xs leading-relaxed mt-1">
                                        Data siswa di kelas lama <b>tidak akan dihapus</b> untuk keperluan arsip riwayat kelas. Siswa akan tercatat aktif di kelas baru.
                                    </AlertDescription>
                                </Alert>

                                {/* Summary Box */}
                                {canPromote && (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                            Konfirmasi
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-slate-500">Jumlah Siswa:</div>
                                            <div className="font-medium text-slate-900 text-right">{selectedStudentIds.length}</div>
                                            <div className="text-slate-500">Dari:</div>
                                            <div className="font-medium text-slate-900 text-right">{classes.find(c => c.id === sourceClassId)?.name}</div>
                                            <div className="text-slate-500">Ke:</div>
                                            <div className="font-medium text-emerald-700 text-right">
                                                {classes.find(c => c.id === targetClassId)?.name}
                                                <span className="text-xs font-normal text-slate-500 ml-1">({classes.find(c => c.id === targetClassId)?.academic_year})</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full gradient-primary"
                                    disabled={loading || !canPromote}
                                    onClick={handleProcess}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Proses Kenaikan Kelas
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
