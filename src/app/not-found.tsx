import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Illustration/Icon */}
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                    <FileQuestion className="w-12 h-12 text-blue-600" />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        404
                    </h1>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau alamatnya salah ketik.
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button asChild className="gradient-primary border-0 w-full sm:w-auto min-w-[140px]">
                        <Link href="/">
                            Kembali ke Beranda
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto min-w-[140px]">
                        <Link href="/login">
                            Halaman Login
                        </Link>
                    </Button>
                </div>

                {/* Footer/Copyright */}
                <div className="pt-8 text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Si-Tuntas System
                </div>
            </div>
        </div>
    )
}
