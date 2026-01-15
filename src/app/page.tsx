import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  CheckCircle2,
  Users,
  FileText,
  ArrowRight,
  Shield,
  Zap,
  BarChart3
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Si-Tuntas
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button className="gradient-primary border-0 font-medium">
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Sistem Modern untuk SMK</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Kelola Ketuntasan
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mata Pelajaran Siswa
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Sistem digital untuk memvalidasi ketuntasan mata pelajaran siswa SMK dengan alur approval bertingkat dari Guru → Wali Kelas → Guru BK
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gradient-primary border-0 text-lg px-8 py-6 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-medium">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
          {[
            { value: "100%", label: "Digital" },
            { value: "< 3 Hari", label: "Waktu Approval" },
            { value: "Real-time", label: "Notifikasi" },
            { value: "5 Role", label: "Pengguna" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dilengkapi dengan berbagai fitur yang memudahkan proses validasi ketuntasan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: CheckCircle2,
                title: "Checklist Digital",
                description: "Guru dapat mencentang ketuntasan mata pelajaran secara digital dengan mudah dan cepat",
                color: "text-emerald-600",
                bg: "bg-emerald-100",
              },
              {
                icon: Users,
                title: "Multi-Role System",
                description: "Mendukung 5 role berbeda: Admin, Guru Mapel, Wali Kelas, Guru BK, dan Siswa",
                color: "text-blue-600",
                bg: "bg-blue-100",
              },
              {
                icon: FileText,
                title: "Generate PDF",
                description: "Lembar ketuntasan dapat diunduh dalam format PDF setelah disetujui",
                color: "text-purple-600",
                bg: "bg-purple-100",
              },
              {
                icon: Zap,
                title: "Real-time Updates",
                description: "Notifikasi real-time untuk setiap perubahan status approval",
                color: "text-amber-600",
                bg: "bg-amber-100",
              },
              {
                icon: Shield,
                title: "Keamanan Terjamin",
                description: "Row Level Security memastikan data hanya bisa diakses pengguna yang berhak",
                color: "text-red-600",
                bg: "bg-red-100",
              },
              {
                icon: BarChart3,
                title: "Dashboard Analytics",
                description: "Pantau progress ketuntasan siswa dengan dashboard yang informatif",
                color: "text-indigo-600",
                bg: "bg-indigo-100",
              },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-6`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Alur Approval Bertingkat
            </h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Proses validasi yang transparan dan terstruktur
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Guru Mapel", desc: "Mencentang ketuntasan" },
              { step: "2", title: "Wali Kelas", desc: "Review & approval" },
              { step: "3", title: "Guru BK", desc: "Final approval" },
              { step: "4", title: "Siswa", desc: "Download PDF" },
            ].map((item, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-bold mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-lg">{item.title}</h4>
                  <p className="text-sm text-blue-200">{item.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="h-6 w-6 text-blue-400 mx-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl shadow-blue-500/25">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Digitalisasi Proses Ketuntasan?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Mulai gunakan Si-Tuntas untuk sekolah Anda sekarang juga
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 font-medium shadow-lg">
                Daftar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Si-Tuntas</span>
            </div>
            <p className="text-sm">
              © 2026 Si-Tuntas. Sistem Ketuntasan Mata Pelajaran SMK.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
