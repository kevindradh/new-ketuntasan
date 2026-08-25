"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileDown, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { createStudent, createStudentsBulk } from '@/actions/admin'
import { useRouter } from 'next/navigation'

interface StudentImportWizardProps {
    classes: { id: string, name: string, academic_year: string }[]
}

export function StudentImportWizard({ classes }: StudentImportWizardProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Upload, 2: Preview, 3: Process
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<any[]>([])
    const [processing, setProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [processedCount, setProcessedCount] = useState(0)
    const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] })
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Get unique academic years, sort descending (newest first)
    const academicYears = Array.from(new Set(classes.map(c => c.academic_year))).sort().reverse()

    // Set default academic year to the latest one if available
    useEffect(() => {
        if (academicYears.length > 0 && !selectedAcademicYear) {
            setSelectedAcademicYear(academicYears[0])
        }
    }, [academicYears, selectedAcademicYear])

    // Protect against accidental tab closure
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (processing) {
                e.preventDefault()
                e.returnValue = '' // Chrome requires returnValue to be set
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [processing])

    const downloadTemplate = (type: 'simple' | 'complete') => {
        let csvContent = "";
        let filename = "";

        if (type === 'simple') {
            csvContent = "data:text/csv;charset=utf-8," + "No,Induk,Nama Siswa,Kelas\n1,1001,Budi Santoso,X RPL 1\n2,1002,Siti Aminah,X RPL 1";
            filename = "template_siswa_simple.csv";
        } else {
            csvContent = "data:text/csv;charset=utf-8," + "full_name,email,nisn,nis,phone,kelas\nJohn Doe,john@example.com,0012345678,1001,08123456789,X RPL 1\nJane Smith,jane@example.com,0987654321,1002,08987654321,XI TKJ 2";
            filename = "template_siswa_lengkap.csv";
        }

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            parseFile(e.target.files[0])
        }
    }

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setParsedData(results.data)
                setStep(2)
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`)
            }
        })
    }

    const validateRow = (row: any) => {
        const normalized = normalizeRow(row)
        // Require Name AND (NIS OR NISN)
        return normalized.full_name && (normalized.nis || normalized.nisn)
    }

    const normalizeRow = (row: any) => {
        return {
            full_name: row.full_name || row['Nama Siswa'] || row['Nama'] || row['Name'],
            email: row.email || row['Email'],
            // Strict mapping: Induk -> nis, NISN -> nisn
            nisn: row.nisn || row['NISN'],
            nis: row.nis || row['Induk'] || row['NIS'] || row['No Induk'],
            phone: row.phone || row['HP'] || row['No HP'] || row['Phone'],
            kelas: row.kelas || row['Kelas'] || row['Class'],
            urut: row.urut || row['Urut'] || row['Urt'] || row['No'] || row['Nomor']
        }
    }

    const processImport = async () => {
        if (!selectedAcademicYear) {
            toast.error("Pilih tahun ajaran terlebih dahulu")
            return
        }

        setStep(3)
        setProcessing(true)
        setProgress(0)
        setProcessedCount(0)

        // Filter valid rows first
        const validRows = parsedData.filter(validateRow)
        const total = validRows.length

        let successCount = 0
        let failedCount = 0
        const errors: string[] = []

        // Prepare data for bulk processing
        const studentsToCreate = validRows.map(row => {
            const normalized = normalizeRow(row)

            // Auto-generate email if missing
            let email = normalized.email
            if (!email) {
                const cleanName = normalized.full_name.toLowerCase().replace(/[^a-z0-9\s]/g, '')
                const nameParts = cleanName.split(/\s+/).filter(Boolean)
                const firstName = nameParts[0]
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
                const urut = normalized.urut || ''
                const namePart = lastName ? `${firstName}.${lastName}` : firstName
                email = `${namePart}${urut}@etuntas.test`
            }

            // Find Class ID - considering ACADEMIC YEAR
            let classId = undefined
            if (normalized.kelas) {
                const matchedClass = classes.find(c =>
                    c.name.toLowerCase() === normalized.kelas.trim().toLowerCase() &&
                    c.academic_year === selectedAcademicYear
                )
                if (matchedClass) {
                    classId = matchedClass.id
                }
            }

            return {
                full_name: normalized.full_name,
                email: email,
                nis: normalized.nis,
                nisn: normalized.nisn,
                phone: normalized.phone,
                class_id: classId,
                status: 'ACTIVE',
                // Password default
                password: 'etuntas123'
            }
        })

        // Batch processing using server-side bulk action
        // or client-side batching calling createStudentsBulk
        // We'll call createStudentsBulk in chunks from client to update progress bar
        const BATCH_SIZE = 20

        for (let i = 0; i < studentsToCreate.length; i += BATCH_SIZE) {
            const batch = studentsToCreate.slice(i, i + BATCH_SIZE)

            try {
                const result = await createStudentsBulk(batch)

                successCount += result.results.success
                failedCount += result.results.failed
                if (result.results.errors) {
                    errors.push(...result.results.errors)
                }
            } catch (err: any) {
                failedCount += batch.length
                errors.push(`Batch error (${i}-${i + batch.length}): ${err.message}`)
            }

            const newProcessedCount = Math.min(i + BATCH_SIZE, total)
            setProcessedCount(newProcessedCount)
            setProgress(Math.round((newProcessedCount / total) * 100))
        }

        // Add count of invalid rows that were skipped entirely
        const invalidCount = parsedData.length - validRows.length
        if (invalidCount > 0) {
            failedCount += invalidCount
            errors.push(`${invalidCount} rows were skipped due to missing required fields (Name or NIS/NISN)`)
        }

        setResults({ success: successCount, failed: failedCount, errors })
        setProcessing(false)
        router.refresh()
    }

    const reset = () => {
        setStep(1)
        setFile(null)
        setParsedData([])
        setProcessing(false)
        setProgress(0)
        setResults({ success: 0, failed: 0, errors: [] })
        // Keep selected academic year
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const validCount = parsedData.filter(validateRow).length
    const invalidCount = parsedData.length - validCount

    // Add necessary imports for Select component manually (Next Step)

    return (
        <Dialog open={open} onOpenChange={(v) => {
            if (processing && !v) {
                toast.warning("Mohon tunggu hingga proses import selesai.")
                return
            }
            setOpen(v)
            if (!v) reset()
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-dashed">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Siswa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import Data Siswa</DialogTitle>
                    <DialogDescription>
                        Import data siswa secara massal. Pilih tahun ajaran target untuk pencocokan kelas.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Tahun Ajaran Target</label>
                            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Tahun Ajaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                Import akan mencocokkan nama kelas dari CSV dengan kelas yang ada di tahun ajaran ini.
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Upload CSV File</h3>
                                <p className="text-sm text-slate-500 mt-1">Drag file here or click to browse</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white rounded-md border flex items-center justify-center">
                                    <FileDown className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Template Import</p>
                                    <p className="text-xs text-slate-500">Pilih format template yang diinginkan</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => downloadTemplate('simple')}>
                                    Simple
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => downloadTemplate('complete')}>
                                    Lengkap
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Preview Data</h3>
                                <p className="text-sm text-slate-500">{parsedData.length} records found</p>
                            </div>
                            <div className="flex gap-2 text-sm">
                                <span className="text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> {validCount} Valid</span>
                                {invalidCount > 0 && <span className="text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> {invalidCount} Invalid</span>}
                            </div>
                        </div>

                        <ScrollArea className="h-[300px] border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>NISN</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.slice(0, 100).map((row, i) => {
                                        const normalized = normalizeRow(row)
                                        const isValid = validateRow(row)
                                        return (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{normalized.full_name || '-'}</TableCell>
                                                <TableCell>
                                                    {normalized.email || <span className="text-emerald-600 italic text-xs">Auto-generate</span>}
                                                </TableCell>
                                                <TableCell>{normalized.nis || normalized.nisn || '-'}</TableCell>
                                                <TableCell>
                                                    {normalized.kelas ? (
                                                        classes.some(c =>
                                                            c.name.toLowerCase() === normalized.kelas.trim().toLowerCase() &&
                                                            c.academic_year === selectedAcademicYear
                                                        )
                                                            ? <span className="text-green-600 font-medium">{normalized.kelas}</span>
                                                            : <span className="text-red-500 font-medium flex items-center gap-1"><AlertCircle className="h-3 w-3" />Undefined: {normalized.kelas}</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">No Class</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isValid && (!normalized.kelas || classes.some(c =>
                                                        c.name.toLowerCase() === normalized.kelas.trim().toLowerCase() &&
                                                        c.academic_year === selectedAcademicYear
                                                    ))
                                                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                                                        : <AlertCircle className="h-4 w-4 text-red-500" />
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {parsedData.length > 100 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-slate-500">
                                                ... and {parsedData.length - 100} more
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-8 space-y-6">
                        {!processing && results.success + results.failed === parsedData.length ? (
                            <div className="text-center space-y-4">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                    <CheckCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Import Selesai</h3>
                                    <p className="text-slate-500">
                                        Berhasil memproses {results.success} data. {results.failed} gagal.
                                    </p>
                                </div>
                                {results.errors.length > 0 && (
                                    <ScrollArea className="h-[150px] w-full border rounded-md p-4 text-left">
                                        <p className="text-sm font-bold text-red-600 mb-2">Error Details:</p>
                                        {results.errors.map((err, i) => (
                                            <div key={i} className="text-xs text-red-500 mb-1">• {err}</div>
                                        ))}
                                    </ScrollArea>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700">Memproses data...</span>
                                    <span className="text-slate-500">{processedCount} / {parsedData.length}</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                                <p className="text-xs text-center text-slate-400">Mohon jangan tutup jendela ini</p>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 1 && (
                        <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    )}
                    {step === 2 && (
                        <>
                            <Button variant="outline" onClick={() => { setStep(1); setParsedData([]); }}>Kembali</Button>
                            <Button onClick={processImport} disabled={validCount === 0} className="gradient-primary border-0">
                                Proses Import
                            </Button>
                        </>
                    )}
                    {step === 3 && !processing && (
                        <Button onClick={() => setOpen(false)} className="gradient-primary border-0">Selesai</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
