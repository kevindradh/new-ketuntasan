import { getAcademicYears } from "@/actions/admin"
import { AcademicYearManager } from "./academic-year-manager"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Manajemen Tahun Ajaran",
    description: "Arsipkan data tahun ajaran lama.",
}

export default async function AcademicYearsPage() {
    const years = await getAcademicYears()

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Tahun Ajaran</h1>
                <p className="text-slate-500 mt-1">Kelola arsip tahun ajaran. Mengarsipkan tahun ajaran akan menyembunyikan kelas dan tugas guru terkait dari tampilan aktif.</p>
            </div>

            <AcademicYearManager years={years} />
        </div>
    )
}
