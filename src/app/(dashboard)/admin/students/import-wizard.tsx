"use client"

import { useState, useRef } from 'react'
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
import { createStudent } from '@/actions/admin'
import { useRouter } from 'next/navigation'

interface StudentImportWizardProps {
    classes: { id: string, name: string }[]
}

export function StudentImportWizard({ classes }: StudentImportWizardProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Upload, 2: Preview, 3: Process
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<any[]>([])
    const [processing, setProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] })
    const fileInputRef = useRef<HTMLInputElement>(null)

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," + "full_name,email,nisn,phone,kelas\nJohn Doe,john@example.com,1234567890,08123456789,X RPL 1\nJane Smith,jane@example.com,0987654321,08987654321,XI TKJ 2"
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "template_siswa.csv")
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
        return row.full_name && row.email && row.nisn
    }

    const processImport = async () => {
        setStep(3)
        setProcessing(true)
        setProgress(0)

        let successCount = 0
        let failedCount = 0
        const errors: string[] = []

        const total = parsedData.length

        // Process sequentially to allow UI updates and prevent server overload
        for (let i = 0; i < total; i++) {
            const row = parsedData[i]

            // Basic validation
            if (!validateRow(row)) {
                failedCount++
                errors.push(`Row ${i + 2}: Missing required fields (Name, Email, or NISN)`)
            } else {
                try {
                    const formData = new FormData()
                    formData.append('full_name', row.full_name)
                    formData.append('email', row.email)
                    formData.append('nisn', row.nisn)
                    if (row.phone) formData.append('phone', row.phone)

                    // Class Assignment Logic
                    if (row.kelas) {
                        const matchedClass = classes.find(c => c.name.toLowerCase() === row.kelas.trim().toLowerCase())
                        if (matchedClass) {
                            formData.append('class_id', matchedClass.id)
                        } else {
                            // Warn but proceed? Or error?
                            // User asked to "match with existing class name".
                            // It implies if it doesn't match, we can't assign.
                            // Let's treat it as a warning in the results but still create the student (unassigned)
                            // OR we could fail the row. Let's fail the row for clearer data integrity if they intended to assign.
                            // However, strictly adhering "create student" might be safer.
                            // Let's try to match logic: "If class provided but not found -> ERROR" is safer than silent fail.

                            // Actually, let's allow creation but log warning in errors?
                            // "Row X created but class 'Foo' not found"

                            // For this iteration, let's treat it as an error to ensure they fix the CSV.
                            throw new Error(`Kelas '${row.kelas}' tidak ditemukan di sistem.`)
                        }
                    }

                    // Default password logic handled on server if needed or generate one
                    // Assuming createStudent handles basic creation with default password

                    const result = await createStudent(formData)

                    if (result.error) {
                        failedCount++
                        errors.push(`Row ${i + 2} (${row.full_name}): ${result.error}`)
                    } else {
                        successCount++
                    }
                } catch (err) {
                    failedCount++
                    errors.push(`Row ${i + 2} (${row.full_name}): Unknown error`)
                }
            }

            setProgress(Math.round(((i + 1) / total) * 100))
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
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const validCount = parsedData.filter(validateRow).length
    const invalidCount = parsedData.length - validCount

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
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
                        Import data siswa secara massal menggunakan file CSV.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
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
                                    <p className="text-xs text-slate-500">Gunakan template ini untuk format yang benar</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                                Download
                            </Button>
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
                                        const isValid = validateRow(row)
                                        return (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{row.full_name || '-'}</TableCell>
                                                <TableCell>{row.email || '-'}</TableCell>
                                                <TableCell>{row.nisn || '-'}</TableCell>
                                                <TableCell>
                                                    {row.kelas ? (
                                                        classes.some(c => c.name.toLowerCase() === row.kelas.trim().toLowerCase())
                                                            ? <span className="text-green-600 font-medium">{row.kelas}</span>
                                                            : <span className="text-red-500 font-medium flex items-center gap-1"><AlertCircle className="h-3 w-3" />Undefined: {row.kelas}</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">No Class</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isValid && (!row.kelas || classes.some(c => c.name.toLowerCase() === row.kelas.trim().toLowerCase()))
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
                                    <span className="text-slate-500">{results.success + results.failed} / {parsedData.length}</span>
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
