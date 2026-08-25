import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import {
  GraduationCap,
  CheckCircle2,
  Users,
  FileText,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Award,
  Check,
  Clock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Decorative background layer - satu kanvas untuk navbar + hero */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="container relative mx-auto px-4 pt-16 pb-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.08] tracking-tight animate-slideIn motion-reduce:animate-none"
              style={{ animationFillMode: "both", animationDelay: "0.08s" }}
            >
              Kelola <span className="text-emerald-700">Ketuntasan</span>
              <span className="block mt-2">
                Mata Pelajaran{" "}
                <span className="relative inline-block">
                  Siswa
                  <svg aria-hidden className="absolute left-0 -bottom-1.5 w-full" viewBox="0 0 120 14" preserveAspectRatio="none" height="5">
                    <path d="M4 10C30 4 62 3 116 7" stroke="#006A4E" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.3" />
                  </svg>
                </span>
              </span>
            </h1>

            <p
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-fadeIn motion-reduce:animate-none"
              style={{ animationFillMode: "both", animationDelay: "0.16s" }}
            >
              Sistem digital untuk memvalidasi ketuntasan mata pelajaran siswa SMKN 1 Bondowoso dengan alur approval bertingkat dari Guru → Wali Kelas → Guru BK
            </p>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideIn motion-reduce:animate-none"
              style={{ animationFillMode: "both", animationDelay: "0.24s" }}
            >
              <Link href="/login">
                <Button size="lg" className="gradient-primary border-0 text-lg px-8 py-6 font-semibold shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-0.5 transition-all">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 font-semibold bg-white/70 backdrop-blur">
                <a href="#fitur">Pelajari Lebih Lanjut</a>
              </Button>
            </div>
          </div>

          {/* Product Mockup (glassmorphism) */}
          <div
            className="mt-16 max-w-5xl mx-auto relative animate-fadeIn motion-reduce:animate-none"
            style={{ animationFillMode: "both", animationDelay: "0.32s" }}
          >
            <div aria-hidden className="absolute -inset-4 rounded-4xl bg-emerald-200/20 blur-2xl" />

            <div className="relative rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-900/10 overflow-hidden">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-white/70">
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <div className="ml-4 hidden sm:flex flex-1 max-w-xs items-center gap-2 rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  app.etuntas.sch.id/dashboard
                </div>
              </div>

              <div className="grid md:grid-cols-5 gap-6 p-6 md:p-8">
                {/* Left: active exam + checklist */}
                <div className="md:col-span-3 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">Ujian Tengah Semester</p>
                      <p className="text-xs text-slate-500">XII RPL 1 • Genap 2025/2026</p>
                    </div>
                    <span className="ml-auto shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">Dalam Proses</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Matematika", done: true },
                      { name: "Bahasa Indonesia", done: true },
                      { name: "Basis Data", done: true },
                      { name: "Pemrograman Web", done: false },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5">
                        <span className={`h-6 w-6 shrink-0 rounded-md flex items-center justify-center ${s.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                          {s.done ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        </span>
                        <span className="flex-1 text-sm font-medium text-slate-700">{s.name}</span>
                        <span className={`text-xs font-medium ${s.done ? "text-emerald-700" : "text-slate-400"}`}>
                          {s.done ? "Tuntas" : "Belum"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: progress ring + approval steps */}
                <div className="md:col-span-2 space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Ketuntasan</p>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0">
                        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#006A4E" strokeWidth="10" strokeLinecap="round" strokeDasharray="264 264" strokeDashoffset="66" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">75%</div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">24/32</p>
                        <p className="text-xs text-slate-500">mata pelajaran tuntas</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                    <p className="text-sm font-semibold text-slate-900 mb-4">Alur Approval</p>
                    <div className="relative">
                      <div aria-hidden className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200" />
                      <div className="space-y-3">
                        {[
                          { icon: Check, label: "Guru Mapel", done: true },
                          { icon: Check, label: "Wali Kelas", done: true },
                          { icon: Award, label: "Guru BK", done: false },
                        ].map((st, i) => (
                          <div key={i} className="relative flex items-center gap-3">
                            <span className={`relative z-10 h-7 w-7 shrink-0 rounded-full flex items-center justify-center ${st.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                              <st.icon className="h-4 w-4" />
                            </span>
                            <span className={`text-sm font-medium ${st.done ? "text-slate-900" : "text-slate-400"}`}>{st.label}</span>
                            {st.done && <span className="ml-auto text-[11px] font-medium text-slate-500">Disetujui</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="scroll-mt-20 bg-white py-24">
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
                color: "text-emerald-600",
                bg: "bg-emerald-100",
              },
              {
                icon: FileText,
                title: "Generate PDF",
                description: "Lembar ketuntasan dapat diunduh dalam format PDF setelah disetujui",
                color: "text-emerald-700",
                bg: "bg-emerald-100",
              },
              {
                icon: Zap,
                title: "Real-time Updates",
                description: "Notifikasi real-time untuk setiap perubahan status approval",
                color: "text-emerald-700",
                bg: "bg-emerald-100",
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
                color: "text-emerald-700",
                bg: "bg-emerald-100",
              },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
      <section id="alur" className="scroll-mt-20 py-24 bg-emerald-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Alur Approval Bertingkat
            </h2>
            <p className="text-lg text-emerald-200 max-w-2xl mx-auto">
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
                  <p className="text-sm text-emerald-200">{item.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="h-6 w-6 text-emerald-400 mx-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="kontak" className="scroll-mt-20 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-emerald-700 rounded-3xl p-12 shadow-2xl shadow-emerald-700/25">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Digitalisasi Proses Ketuntasan?
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Mulai gunakan e-Tuntas untuk sekolah Anda sekarang juga
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6 font-medium shadow-lg">
                Masuk Sekarang
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
              <div className="p-2 rounded-xl bg-emerald-700">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">e-Tuntas</span>
            </div>
            <p className="text-sm">
              © 2026 e-Tuntas. Sistem Ketuntasan Mata Pelajaran SMKN 1 Bondowoso.
            </p>
          </div>
        </div>
      </footer>
    </div >
  );
}
