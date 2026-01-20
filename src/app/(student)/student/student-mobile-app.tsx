'use client'

import { useRealtimeNotifications } from '@/hooks/use-notifications'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Home,
    FileText,
    Bell,
    User,
    CheckCircle2,
    Clock,
    Award,
    AlertCircle,
    Download,
    ChevronRight,
    LogOut,
    GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import type { CompletionSheet, CompletionItem, Subject, Profile } from '@/types/database'

// Status configuration
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: 'Menunggu', color: 'text-slate-600', bgColor: 'bg-slate-100' },
    IN_PROGRESS: { label: 'Dalam Proses', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    HOMEROOM_REVIEW: { label: 'Review Wali Kelas', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    COUNSELOR_REVIEW: { label: 'Review Guru BK', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    APPROVED: { label: 'Disetujui', color: 'text-green-600', bgColor: 'bg-green-100' },
    REJECTED: { label: 'Ditolak', color: 'text-red-600', bgColor: 'bg-red-100' },
}

interface StudentMobileAppProps {
    profile: Profile | null
    currentClass: { name: string; grade_level: number; major: string } | null
    sheets: (CompletionSheet & {
        exam?: { name: string; exam_type: string; start_date: string; end_date: string }
        class?: { name: string }
        homeroom_approver?: Profile
        counselor_approver?: Profile
        completion_items?: (CompletionItem & { subject?: Subject; teacher?: Profile })[]
    })[]
}

type TabType = 'home' | 'sheets' | 'notifications' | 'profile'

export function StudentMobileApp({ profile, currentClass, sheets }: StudentMobileAppProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('home')
    const [selectedSheet, setSelectedSheet] = useState<typeof sheets[0] | null>(null)

    // Notifications Hook
    const { notifications, unreadCount, markAsRead } = useRealtimeNotifications(profile?.id || null)

    const latestSheet = sheets[0]
    const totalItems = latestSheet?.completion_items?.length || 0
    const completedItems = latestSheet?.completion_items?.filter(i => i.is_completed).length || 0
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const [downloadState, setDownloadState] = useState<{ url: string; filename: string } | null>(null)

    const handleDownloadPDF = async (sheet: typeof sheets[0]) => {
        try {
            const { default: jsPDF } = await import('jspdf')
            const doc = new jsPDF()

            // Show loading toast
            const toastId = toast.loading('Membuat PDF...')

            // Header
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text('LEMBAR KETUNTASAN SISWA', 105, 20, { align: 'center' })
            doc.setFontSize(12)
            doc.setFont('helvetica', 'normal')
            doc.text('Sistem Ketuntasan Mata Pelajaran SMKN 1 Bondowoso', 105, 28, { align: 'center' })

            doc.setLineWidth(0.5)
            doc.line(20, 35, 190, 35)

            // Student info
            let y = 45
            doc.setFontSize(11)
            doc.text(`Nama Ujian: ${sheet.exam?.name || '-'}`, 20, y); y += 8
            doc.text(`Nama Siswa: ${profile?.full_name || '-'}`, 20, y); y += 8
            doc.text(`NISN: ${profile?.nisn || '-'}`, 20, y); y += 8
            doc.text(`Kelas: ${sheet.class?.name || '-'}`, 20, y); y += 8
            doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, y)

            // Table header
            y += 15
            doc.setFont('helvetica', 'bold')
            doc.text('DAFTAR KETUNTASAN MATA PELAJARAN', 20, y)
            y += 10

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.setFillColor(240, 240, 240)
            doc.rect(20, y - 5, 170, 8, 'F')
            doc.text('No', 25, y)
            doc.text('Mata Pelajaran', 40, y)
            doc.text('Guru', 100, y)
            doc.text('Status', 155, y)
            y += 10

            // Table rows
            sheet.completion_items?.forEach((item, index) => {
                if (y > 270) {
                    doc.addPage()
                    y = 20
                }
                doc.text(`${index + 1}`, 25, y)
                doc.text((item.subject?.name || '-').substring(0, 30), 40, y)
                doc.text((item.teacher?.full_name || '-').substring(0, 25), 100, y)
                doc.text(item.is_completed ? 'TUNTAS' : 'Belum', 155, y)
                y += 8
            })

            // Approval section
            y += 10
            if (sheet.homeroom_approved) {
                doc.text(`Disetujui Wali Kelas: ${sheet.homeroom_approver?.full_name || '-'}`, 20, y)
                y += 8
            }
            if (sheet.counselor_approved) {
                doc.text(`Disetujui Guru BK: ${sheet.counselor_approver?.full_name || '-'}`, 20, y)
                y += 8
            }

            // Footer
            doc.setFontSize(9)
            doc.setTextColor(128)
            doc.text('Dokumen ini dihasilkan secara digital oleh Sistem e-Tuntas', 105, 285, { align: 'center' })

            // Save
            const safeName = (profile?.full_name || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
            const filename = `Lembar_Ketuntasan_${safeName}.pdf`

            console.log('Generating PDF Blob for:', filename)
            const pdfBlob = doc.output('blob')

            // Try native "Save As" first (Chrome/Edge only)
            try {
                // @ts-ignore
                if (window.showSaveFilePicker) {
                    // @ts-ignore
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'PDF File',
                            accept: { 'application/pdf': ['.pdf'] },
                        }],
                    })
                    const writable = await handle.createWritable()
                    await writable.write(pdfBlob)
                    await writable.close()
                    toast.success('File berhasil disimpan!')
                    toast.dismiss(toastId)
                    return
                }
            } catch (err: any) {
                // If user cancelled, stop
                if (err.name === 'AbortError') {
                    toast.dismiss(toastId)
                    return
                }
                // Determine if we should continue to fallback
                console.warn('Native save failed, falling back to modal', err)
            }

            // Fallback: Show Modal with Link
            const pdfUrl = URL.createObjectURL(pdfBlob)
            setDownloadState({ url: pdfUrl, filename })
            toast.dismiss(toastId)

        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Gagal mengunduh PDF. Silakan coba lagi.')
        }
    }

    // Tab contents
    const renderHome = () => (
        <div className="flex-1 overflow-auto pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-5 pt-6 pb-8">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-blue-100 text-sm">Selamat Datang 👋</p>
                        <h1 className="text-xl font-bold">{profile?.full_name}</h1>
                        <p className="text-blue-200 text-sm">{currentClass?.name}</p>
                    </div>
                </div>

                {/* Progress Card */}
                {latestSheet && (
                    <div className="bg-white/15 backdrop-blur rounded-2xl p-4">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="10" />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="10"
                                        strokeLinecap="round" strokeDasharray={`${progress * 2.51} 251`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold">{progress}%</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-blue-100 text-sm">Ketuntasan</p>
                                <p className="text-2xl font-bold">{completedItems}/{totalItems}</p>
                                <p className="text-blue-200 text-xs">
                                    {progress === 100 ? '🎉 Semua tuntas!' : `${totalItems - completedItems} tersisa`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4 mt-3">
                {/* Active Exam Card */}
                {latestSheet && (
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs text-slate-500">Ujian Aktif</p>
                                <p className="font-semibold text-slate-900">{latestSheet.exam?.name}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[latestSheet.status].bgColor} ${statusConfig[latestSheet.status].color}`}>
                                {statusConfig[latestSheet.status].label}
                            </span>
                        </div>

                        {/* Status Steps */}
                        <div className="flex items-center gap-1 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${latestSheet.all_subjects_completed ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className={`flex-1 h-1 rounded ${latestSheet.all_subjects_completed ? 'bg-green-500' : 'bg-slate-200'}`} />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${latestSheet.homeroom_approved ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className={`flex-1 h-1 rounded ${latestSheet.homeroom_approved ? 'bg-green-500' : 'bg-slate-200'}`} />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${latestSheet.counselor_approved ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 px-1">
                            <span>Mapel</span>
                            <span>Wali Kelas</span>
                            <span>Guru BK</span>
                        </div>
                    </div>
                )}

                {/* Subject List */}
                {latestSheet && (
                    <div>
                        <h2 className="font-semibold text-slate-800 mb-3">Daftar Mata Pelajaran</h2>
                        <div className="space-y-2">
                            {latestSheet.completion_items?.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.is_completed ? 'bg-green-100' : 'bg-slate-100'}`}>
                                        {item.is_completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{item.subject?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{item.teacher?.full_name}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.is_completed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {item.is_completed ? 'Tuntas' : 'Belum'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Data */}
                {sheets.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-700">Belum Ada Data</h3>
                        <p className="text-sm text-slate-500 mt-1">Lembar ketuntasan akan muncul saat ujian dimulai</p>
                    </div>
                )}
            </div>
        </div>
    )

    const renderSheets = () => (
        <div className="flex-1 overflow-auto px-5 py-4 pb-20">
            <h1 className="text-xl font-bold text-slate-900 mb-4">Riwayat Lembar</h1>
            {sheets.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">Belum ada riwayat</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sheets.map((sheet) => {
                        const items = sheet.completion_items || []
                        const completed = items.filter(i => i.is_completed).length
                        const percent = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

                        return (
                            <div
                                key={sheet.id}
                                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer active:bg-slate-50"
                                onClick={() => setSelectedSheet(sheet)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-slate-900">{sheet.exam?.name}</p>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{sheet.class?.name}</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{percent}%</span>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[sheet.status].bgColor} ${statusConfig[sheet.status].color}`}>
                                        {statusConfig[sheet.status].label}
                                    </span>
                                    {sheet.status === 'APPROVED' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadPDF(sheet) }}
                                            className="flex items-center gap-1 text-xs text-blue-600 font-medium"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )

    const renderNotifications = () => (
        <div className="flex-1 overflow-auto px-5 py-4 pb-20">
            <h1 className="text-xl font-bold text-slate-900 mb-4">Notifikasi</h1>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">Belum ada notifikasi</p>
                </div>
            ) : (
                <div className="space-y-3 pb-20">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-4 rounded-2xl shadow-sm border transition-colors ${notif.is_read ? 'bg-white border-slate-200' : 'bg-white border-blue-200 ring-1 ring-blue-50'
                                }`}
                            onClick={() => markAsRead(notif.id)}
                        >
                            <div className="flex gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type.includes('REJECTED') ? 'bg-red-100 text-red-600' :
                                    notif.type.includes('APPROVED') ? 'bg-green-100 text-green-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {notif.type.includes('REJECTED') ? <AlertCircle className="w-5 h-5" /> :
                                        notif.type.includes('APPROVED') ? <CheckCircle2 className="w-5 h-5" /> :
                                            <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-semibold text-sm ${notif.is_read ? 'text-slate-900' : 'text-blue-900'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                            {formatDate(notif.created_at)}
                                        </span>
                                    </div>
                                    <p className={`text-xs ${notif.is_read ? 'text-slate-500' : 'text-blue-700'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    const renderProfile = () => (
        <div className="flex-1 overflow-auto px-5 py-4 pb-20">
            <h1 className="text-xl font-bold text-slate-900 mb-4">Profil</h1>

            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {profile?.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{profile?.full_name}</h2>
                        <p className="text-slate-500">{profile?.email}</p>
                    </div>
                </div>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">NISN</span>
                        <span className="font-medium text-slate-900">{profile?.nisn || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Kelas</span>
                        <span className="font-medium text-slate-900">{currentClass?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-500">Jurusan</span>
                        <span className="font-medium text-slate-900">{currentClass?.major || '-'}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSignOut}
                className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center gap-2 active:bg-red-100"
            >
                <LogOut className="w-5 h-5" />
                Keluar
            </button>
        </div>
    )

    // Detail Modal
    const renderDetailModal = () => {
        if (!selectedSheet) return null

        const items = selectedSheet.completion_items || []
        const completed = items.filter(i => i.is_completed).length

        return (
            <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedSheet(null)}>
                <div
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Handle */}
                    <div className="flex justify-center py-3">
                        <div className="w-10 h-1 bg-slate-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-5 pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-lg text-slate-900">{selectedSheet.exam?.name}</h2>
                                <p className="text-sm text-slate-500">{selectedSheet.class?.name}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedSheet.status].bgColor} ${statusConfig[selectedSheet.status].color}`}>
                                {statusConfig[selectedSheet.status].label}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{completed}/{items.length} mata pelajaran tuntas</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto px-5 py-4">
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.is_completed ? 'bg-green-100' : 'bg-slate-200'}`}>
                                        {item.is_completed ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-slate-900">{item.subject?.name}</p>
                                        <p className="text-xs text-slate-500">{item.teacher?.full_name}</p>
                                        {item.notes && (
                                            <div className="mt-1 flex items-start gap-1">
                                                <FileText className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-slate-600 italic">"{item.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                    {item.is_completed && (
                                        <span className="text-xs text-green-600">{formatDate(item.completed_at!)}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Approvals */}
                        {selectedSheet.homeroom_approved && (
                            <div className="mt-4 p-4 bg-green-50 rounded-xl">
                                <p className="text-sm font-medium text-green-800">✓ Disetujui Wali Kelas</p>
                                <p className="text-xs text-green-700">{selectedSheet.homeroom_approver?.full_name}</p>
                                {selectedSheet.homeroom_notes && (
                                    <div className="mt-2 text-xs text-green-800/80 bg-green-100/50 p-2 rounded italic">
                                        "Catatan: {selectedSheet.homeroom_notes}"
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedSheet.counselor_approved && (
                            <div className="mt-2 p-4 bg-green-50 rounded-xl">
                                <p className="text-sm font-medium text-green-800">✓ Disetujui Guru BK</p>
                                <p className="text-xs text-green-700">{selectedSheet.counselor_approver?.full_name}</p>
                                {selectedSheet.counselor_notes && (
                                    <div className="mt-2 text-xs text-green-800/80 bg-green-100/50 p-2 rounded italic">
                                        "Catatan: {selectedSheet.counselor_notes}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-slate-100 safe-area-bottom">
                        {selectedSheet.status === 'APPROVED' ? (
                            <button
                                onClick={() => handleDownloadPDF(selectedSheet)}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download PDF
                            </button>
                        ) : (
                            <button
                                onClick={() => setSelectedSheet(null)}
                                className="w-full bg-slate-100 text-slate-700 font-medium py-3 rounded-xl"
                            >
                                Tutup
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const renderDownloadModal = () => {
        if (!downloadState) return null

        return (
            <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setDownloadState(null)}>
                <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-center text-slate-900 mb-2">PDF Siap Diunduh</h2>
                    <p className="text-center text-slate-500 mb-6 text-sm break-all">
                        {downloadState.filename}
                    </p>

                    <a
                        href={downloadState.url}
                        download={downloadState.filename}
                        onClick={() => {
                            setTimeout(() => {
                                setDownloadState(null)
                                URL.revokeObjectURL(downloadState.url)
                            }, 1000)
                        }}
                        className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 mb-3 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Download File
                    </a>

                    <button
                        onClick={() => setDownloadState(null)}
                        className="w-full py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'home' as TabType, label: 'Beranda', icon: Home },
        { id: 'sheets' as TabType, label: 'Lembar', icon: FileText },
        { id: 'notifications' as TabType, label: 'Notifikasi', icon: Bell },
        { id: 'profile' as TabType, label: 'Profil', icon: User },
    ]

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Content */}
            {activeTab === 'home' && renderHome()}
            {activeTab === 'sheets' && renderSheets()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'profile' && renderProfile()}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-2 safe-area-bottom">
                <div className="flex justify-around">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors relative ${activeTab === tab.id
                                ? 'text-blue-600'
                                : 'text-slate-400'
                                }`}
                        >
                            <div className="relative">
                                <tab.icon className="w-6 h-6" />
                                {tab.id === 'notifications' && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <span className="text-xs mt-1 font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Detail Modal */}
            {renderDetailModal()}

            {/* Download Modal */}
            {renderDownloadModal()}
        </div>
    )
}
