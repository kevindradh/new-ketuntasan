'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    GraduationCap,
    FileText,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    Award,
    AlertCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject, Profile } from '@/types/database'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: 'Menunggu', color: 'bg-slate-100 text-slate-700', icon: Clock },
    IN_PROGRESS: { label: 'Dalam Proses', color: 'bg-blue-100 text-blue-700', icon: Clock },
    HOMEROOM_REVIEW: { label: 'Review Wali Kelas', color: 'bg-amber-100 text-amber-700', icon: Clock },
    COUNSELOR_REVIEW: { label: 'Review Guru BK', color: 'bg-purple-100 text-purple-700', icon: Clock },
    APPROVED: { label: 'Disetujui', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

interface StudentDashboardClientProps {
    sheets: (CompletionSheet & {
        exam?: { name: string; exam_type: string; start_date: string; end_date: string }
        class?: { name: string }
        homeroom_approver?: Profile
        counselor_approver?: Profile
        completion_items?: (CompletionItem & { subject?: Subject; teacher?: Profile })[]
    })[]
    profile: Profile | null
    currentClass: { name: string; grade_level: number; major: string } | null
}

export function StudentDashboardClient({ sheets, profile, currentClass }: StudentDashboardClientProps) {
    const [selectedSheet, setSelectedSheet] = useState<typeof sheets[0] | null>(null)

    // Get latest sheet for display
    const latestSheet = sheets[0]
    const totalItems = latestSheet?.completion_items?.length || 0
    const completedItems = latestSheet?.completion_items?.filter(i => i.is_completed).length || 0
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

    const handleDownloadPDF = async (sheetId: string) => {
        // Generate PDF in browser using jsPDF
        const { default: jsPDF } = await import('jspdf')
        const sheet = sheets.find(s => s.id === sheetId)
        if (!sheet) return

        const doc = new jsPDF()

        // Header
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('LEMBAR KETUNTASAN SISWA', 105, 20, { align: 'center' })
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Sistem Ketuntasan Mata Pelajaran SMK', 105, 28, { align: 'center' })

        // Line
        doc.setLineWidth(0.5)
        doc.line(20, 35, 190, 35)

        // Student Info
        doc.setFontSize(11)
        let y = 45
        doc.text(`Nama Ujian: ${sheet.exam?.name}`, 20, y)
        y += 8
        doc.text(`Nama Siswa: ${profile?.full_name}`, 20, y)
        y += 8
        doc.text(`NISN: ${profile?.nisn || '-'}`, 20, y)
        y += 8
        doc.text(`Kelas: ${sheet.class?.name}`, 20, y)
        y += 8
        doc.text(`Tanggal Generate: ${formatDate(new Date())}`, 20, y)

        // Table Header
        y += 15
        doc.setFont('helvetica', 'bold')
        doc.text('DAFTAR KETUNTASAN MATA PELAJARAN', 20, y)
        y += 10

        // Table
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        // Table header
        doc.setFillColor(240, 240, 240)
        doc.rect(20, y - 5, 170, 8, 'F')
        doc.text('No', 25, y)
        doc.text('Mata Pelajaran', 40, y)
        doc.text('Guru', 100, y)
        doc.text('Status', 150, y)
        y += 10

        // Table rows
        sheet.completion_items?.forEach((item, index) => {
            doc.text(`${index + 1}`, 25, y)
            doc.text(item.subject?.name || '-', 40, y)
            doc.text(item.teacher?.full_name || '-', 100, y)
            doc.text(item.is_completed ? `✓ ${formatDate(item.completed_at!)}` : 'Belum', 150, y)
            y += 8
        })

        // Approvals
        y += 10
        doc.setFont('helvetica', 'bold')
        doc.text('PERSETUJUAN', 20, y)
        y += 10
        doc.setFont('helvetica', 'normal')

        if (sheet.homeroom_approved) {
            doc.text(`Wali Kelas: ${sheet.homeroom_approver?.full_name}`, 20, y)
            y += 6
            doc.text(`Tanggal: ${formatDate(sheet.homeroom_approved_at!)}`, 20, y)
            if (sheet.homeroom_notes) {
                y += 6
                doc.text(`Catatan: ${sheet.homeroom_notes}`, 20, y)
            }
            y += 12
        }

        if (sheet.counselor_approved) {
            doc.text(`Guru BK: ${sheet.counselor_approver?.full_name}`, 20, y)
            y += 6
            doc.text(`Tanggal: ${formatDate(sheet.counselor_approved_at!)}`, 20, y)
            if (sheet.counselor_notes) {
                y += 6
                doc.text(`Catatan: ${sheet.counselor_notes}`, 20, y)
            }
        }

        // Footer
        doc.setFontSize(9)
        doc.setTextColor(128)
        doc.text('Dokumen ini dihasilkan secara digital oleh Sistem Si-Tuntas', 105, 280, { align: 'center' })

        // Save
        doc.save(`Lembar-Ketuntasan-${profile?.full_name?.replace(/\s+/g, '-')}.pdf`)
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Siswa</h1>
                <p className="text-slate-500 mt-1">Pantau progress ketuntasan mata pelajaran Anda</p>
            </div>

            {/* Profile Card */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile?.full_name}</h2>
                            <p className="text-blue-100">NISN: {profile?.nisn || '-'}</p>
                            <p className="text-blue-100">{currentClass?.name} • {currentClass?.major}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Card */}
            {latestSheet && (
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">{latestSheet.exam?.name}</CardTitle>
                                <CardDescription>{latestSheet.exam?.exam_type}</CardDescription>
                            </div>
                            <Badge className={statusConfig[latestSheet.status].color}>
                                {statusConfig[latestSheet.status].label}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Ketuntasan Mata Pelajaran</span>
                                <span className="font-medium">{completedItems}/{totalItems}</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                            <p className="text-sm text-slate-500">
                                {progress === 100
                                    ? '🎉 Semua mata pelajaran tuntas!'
                                    : `${totalItems - completedItems} mata pelajaran tersisa`}
                            </p>
                        </div>

                        {/* Status Timeline */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-slate-700">Status Approval</h4>
                            <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${latestSheet.all_subjects_completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1 h-1 bg-slate-200 rounded">
                                    <div className={`h-full rounded transition-all ${latestSheet.all_subjects_completed ? 'bg-green-500 w-full' : 'w-0'}`} />
                                </div>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${latestSheet.homeroom_approved ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1 h-1 bg-slate-200 rounded">
                                    <div className={`h-full rounded transition-all ${latestSheet.homeroom_approved ? 'bg-green-500 w-full' : 'w-0'}`} />
                                </div>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${latestSheet.counselor_approved ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Award className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Semua Tuntas</span>
                                <span>Wali Kelas</span>
                                <span>Guru BK</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setSelectedSheet(latestSheet)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                            </Button>
                            {latestSheet.status === 'APPROVED' && (
                                <Button className="gradient-primary border-0" onClick={() => handleDownloadPDF(latestSheet.id)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No sheets message */}
            {sheets.length === 0 && (
                <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700">Belum Ada Lembar Ketuntasan</h3>
                        <p className="text-slate-500 mt-2">Lembar ketuntasan akan muncul saat admin mengaktifkan ujian</p>
                    </CardContent>
                </Card>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!selectedSheet} onOpenChange={(v) => !v && setSelectedSheet(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Lembar Ketuntasan</DialogTitle>
                        <DialogDescription>
                            {selectedSheet?.exam?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">{selectedSheet?.class?.name}</p>
                                    <p className="text-sm text-slate-500">
                                        Periode: {selectedSheet?.exam?.start_date && formatDate(selectedSheet.exam.start_date)} -
                                        {selectedSheet?.exam?.end_date && formatDate(selectedSheet.exam.end_date)}
                                    </p>
                                </div>
                                <Badge className={statusConfig[selectedSheet?.status || 'PENDING'].color}>
                                    {statusConfig[selectedSheet?.status || 'PENDING'].label}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium">Daftar Ketuntasan</h4>
                            {selectedSheet?.completion_items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.subject?.name}</p>
                                        <p className="text-sm text-slate-500">Guru: {item.teacher?.full_name}</p>
                                    </div>
                                    {item.is_completed ? (
                                        <Badge className="bg-green-100 text-green-700">
                                            ✓ {formatDate(item.completed_at!)}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Belum Tuntas</Badge>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Approval Info */}
                        {selectedSheet?.homeroom_approved && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm font-medium text-green-800">✓ Disetujui Wali Kelas</p>
                                <p className="text-sm text-green-700">
                                    {selectedSheet.homeroom_approver?.full_name} • {formatDate(selectedSheet.homeroom_approved_at!)}
                                </p>
                                {selectedSheet.homeroom_notes && (
                                    <p className="text-sm text-green-600 mt-1">Catatan: {selectedSheet.homeroom_notes}</p>
                                )}
                            </div>
                        )}

                        {selectedSheet?.counselor_approved && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm font-medium text-green-800">✓ Disetujui Guru BK (Final)</p>
                                <p className="text-sm text-green-700">
                                    {selectedSheet.counselor_approver?.full_name} • {formatDate(selectedSheet.counselor_approved_at!)}
                                </p>
                                {selectedSheet.counselor_notes && (
                                    <p className="text-sm text-green-600 mt-1">Catatan: {selectedSheet.counselor_notes}</p>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* All Sheets */}
            {sheets.length > 1 && (
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Riwayat Lembar Ketuntasan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sheets.slice(1).map((sheet) => (
                                <div
                                    key={sheet.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                    onClick={() => setSelectedSheet(sheet)}
                                >
                                    <div>
                                        <p className="font-medium">{sheet.exam?.name}</p>
                                        <p className="text-sm text-slate-500">{sheet.class?.name}</p>
                                    </div>
                                    <Badge className={statusConfig[sheet.status].color}>
                                        {statusConfig[sheet.status].label}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
