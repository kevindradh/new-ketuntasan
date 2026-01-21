"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Archive, CheckCircle2, AlertCircle, Loader2, RefreshCcw, CalendarDays } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { archiveAcademicYear, activateAcademicYear } from "@/actions/admin"

interface YearStats {
    year: string
    isActive: boolean
    classCount: number
}

export function AcademicYearManager({ years }: { years: YearStats[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleArchive = async (year: string) => {
        if (!confirm(`Apakah Anda yakin ingin mengarsipkan Tahun Ajaran ${year}? Semua kelas dan tugas guru akan dinonaktifkan.`)) return

        setLoading(year)
        try {
            const res = await archiveAcademicYear(year)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Tahun Ajaran ${year} berhasil diarsipkan.`)
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(null)
        }
    }

    const handleActivate = async (year: string) => {
        if (!confirm(`Apakah Anda yakin ingin mengaktifkan kembali Tahun Ajaran ${year}?`)) return

        setLoading(year)
        try {
            const res = await activateAcademicYear(year)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Tahun Ajaran ${year} berhasil diaktifkan kembali.`)
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {years.map((y) => (
                    <Card key={y.year} className={`relative overflow-hidden transition-all hover:shadow-md ${y.isActive ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                        {y.isActive && (
                            <div className="absolute top-0 right-0 p-3">
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Aktif</Badge>
                            </div>
                        )}
                        {!y.isActive && (
                            <div className="absolute top-0 right-0 p-3">
                                <Badge variant="secondary" className="bg-slate-200 text-slate-600">Arsip</Badge>
                            </div>
                        )}

                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <CalendarDays className={`h-5 w-5 ${y.isActive ? 'text-green-600' : 'text-slate-400'}`} />
                                {y.year}
                            </CardTitle>
                            <CardDescription>
                                {y.classCount} Kelas Terdaftar
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mt-2">
                                {y.isActive ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                        onClick={() => handleArchive(y.year)}
                                        disabled={loading === y.year}
                                    >
                                        {loading === y.year ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4 mr-2" />}
                                        Arsipkan
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleActivate(y.year)}
                                        disabled={loading === y.year}
                                    >
                                        {loading === y.year ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                                        Aktifkan Kembali
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {years.length === 0 && (
                <Alert className="bg-slate-50 border-slate-200">
                    <AlertCircle className="h-4 w-4 text-slate-600" />
                    <AlertTitle>Belum ada data</AlertTitle>
                    <AlertDescription>
                        Tidak ada tahun ajaran yang ditemukan. Buat kelas baru untuk memulai tahun ajaran.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
