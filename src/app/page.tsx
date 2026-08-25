import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { TestimonialCarousel } from "@/components/landing/testimonial-carousel";
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
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='2' cy='2' r='1.3' fill='%2364748B' fill-opacity='0.12'/%3E%3C/svg%3E")`,
          }}
        />
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
              Validasi <span className="text-emerald-700">Ketuntasan</span> Siswa,
              <span className="block mt-2">
                Cepat dan{" "}
                <span className="relative inline-block">
                  Transparan
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
              Digitalisasi alur validasi kelayakan ujian — guru mengisi ketuntasan, wali kelas dan guru BK menyetujui, semua terpantau real-time tanpa kertas.
            </p>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideIn motion-reduce:animate-none"
              style={{ animationFillMode: "both", animationDelay: "0.24s" }}
            >
              <Link href="/login">
                <Button size="lg" className="gradient-primary border-0 font-semibold shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-0.5 transition-all">
                  Mulai Gunakan Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild className="font-semibold bg-white/70 backdrop-blur">
                <a href="#fitur">Lihat Cara Kerja</a>
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

      {/* How It Works Section */}
      <section id="alur" className="scroll-mt-20 border-y border-slate-200 bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Cara Kerja
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Dari input sampai disetujui, semua lebih terarah
            </h2>
            <p className="text-lg text-slate-600">
              Satu alur sederhana untuk menjaga proses validasi ketuntasan tetap cepat, jelas, dan mudah dipantau.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: CheckCircle2,
                title: "Guru mengisi",
                description: "Guru mata pelajaran mencatat ketuntasan siswa secara digital dalam satu dashboard.",
              },
              {
                step: "02",
                icon: Users,
                title: "Wali kelas meninjau",
                description: "Wali kelas memeriksa progres kelas dan memberikan persetujuan dengan jejak yang jelas.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Guru BK menyetujui",
                description: "Guru BK melakukan final approval sebelum siswa mendapatkan dokumen ketuntasan.",
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-7 transition-colors hover:border-emerald-300">
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold tracking-widest text-slate-300">{item.step}</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="border-b border-slate-200 bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12">
              <p className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Cerita Pengguna
              </p>
              <h2 className="mb-4 text-center text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Lebih mudah ketika semua bekerja dalam satu alur
              </h2>
              <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-slate-600">
                Dengarkan perspektif warga sekolah yang terlibat dalam proses ketuntasan siswa.
              </p>
            </div>

            <TestimonialCarousel />
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

      {/* CTA Section */}
      <section id="kontak" className="scroll-mt-20 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-emerald-700 rounded-3xl p-12 shadow-2xl shadow-emerald-700/25">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Digitalisasi Proses Ketuntasan?
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Mulai gunakan TUNTASIN untuk sekolah Anda sekarang juga
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
      <footer className="bg-white text-slate-600 py-16 relative overflow-hidden border-t border-slate-200">
        {/* Decorative subtle glow */}
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 bg-emerald-50/50 blur-[80px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-12">
            
            {/* Column 1: Brand & About */}
            <div className="md:col-span-12 lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <Image
                    src="/etuntas-logo.png"
                    alt="Logo TUNTASIN"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">TUNTASIN</span>
              </div>
              <p className="text-slate-600 leading-relaxed max-w-md mb-8">
                Platform digitalisasi alur validasi ketuntasan belajar siswa. Cepat, transparan, dan terintegrasi untuk mendukung ekosistem akademik SMKN 1 Bondowoso.
              </p>
              <div className="flex items-center gap-4">
                {/* Social Placeholders */}
                <a href="#" className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <span className="sr-only">Twitter/X</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-4 lg:col-span-2 lg:col-start-7">
              <h3 className="text-slate-900 font-semibold mb-6">Tautan Cepat</h3>
              <ul className="space-y-4">
                <li><a href="#fitur" className="text-slate-600 hover:text-emerald-600 transition-colors">Fitur Unggulan</a></li>
                <li><a href="#alur" className="text-slate-600 hover:text-emerald-600 transition-colors">Cara Kerja</a></li>
                <li><a href="/login" className="text-slate-600 hover:text-emerald-600 transition-colors">Masuk Sistem</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Pusat Bantuan</a></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="md:col-span-8 lg:col-span-3 lg:col-start-10">
              <h3 className="text-slate-900 font-semibold mb-6">Hubungi Kami</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span className="text-slate-600 text-sm leading-relaxed">
                    Jl. HOS Cokroaminoto No.110, <br />
                    Badean, Kec. Bondowoso, <br />
                    Kab. Bondowoso, Jawa Timur 68214
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <a href="mailto:info@smkn1bondowoso.sch.id" className="text-slate-600 text-sm hover:text-emerald-600 transition-colors">info@smkn1bondowoso.sch.id</a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <span className="text-slate-600 text-sm">0332 - 421272</span>
                </li>
              </ul>
            </div>
            
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} TUNTASIN. Hak Cipta Dilindungi.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
