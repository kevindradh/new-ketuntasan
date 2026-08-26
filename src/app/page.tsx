import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import {
  GraduationCap,
  CheckCircle2,
  Users,
  FileText,
  ArrowRight,
  Shield,
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
                <Button size="lg" className="gradient-primary border-0 font-semibold shadow-md shadow-emerald-700/10 hover:shadow-lg hover:shadow-emerald-700/15 hover:-translate-y-0.5 transition-all">
                  Mulai Gunakan Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild className="font-semibold bg-white/70 backdrop-blur">
                <a href="#alur">Lihat Cara Kerja</a>
              </Button>
            </div>
          </div>

          {/* Product Mockup (glassmorphism) */}
          <div
            className="mt-16 max-w-5xl mx-auto relative animate-fadeIn motion-reduce:animate-none"
            style={{ animationFillMode: "both", animationDelay: "0.32s" }}
          >
            <div aria-hidden className="absolute -inset-4 rounded-4xl bg-emerald-200/20 blur-2xl" />

            <div className="relative rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 overflow-hidden">
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

      {/* Tangible Insights Section */}
      <section id="tentang" className="scroll-mt-20 bg-white py-24 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-emerald-600">
              VALIDASI KETUNTASAN LEBIH BAIK DIMULAI DENGAN
            </p>
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Data ketuntasan yang transparan untuk keputusan yang lebih cepat
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Proses validasi menjadi jauh lebih mudah saat semua data tersaji secara real-time. Tuntasin menghubungkan data akademik siswa dengan guru mata pelajaran, wali kelas, dan guru BK agar setiap pihak dapat bertindak berdasarkan data yang akurat.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Left Column - Content */}
            <div className="bg-white rounded-xl p-8 md:p-10 border border-slate-200">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-600">
                PEMANTAUAN KETUNTASAN
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Pantau progres dengan mudah
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Melacak ketuntasan siswa dengan Tuntasin membantu sekolah memperhitungkan setiap progres, meningkatkan fokus, dan memastikan tidak ada nilai yang tertinggal.
              </p>

              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Metrik ketuntasan real-time</h4>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                      Ubah data ketuntasan menjadi wawasan real-time yang dapat ditindaklanjuti. Pantau persentase kelulusan, cegah keterlambatan rekap, dan optimalkan waktu guru.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Deteksi siswa bermasalah dini</h4>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                      Tuntasin menandai pola ketidaklulusan yang tidak biasa (seperti banyak mapel yang belum tuntas sekaligus), membantu guru BK mengambil tindakan pencegahan dengan cepat.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <Image 
                src="/about-image.png" 
                alt="Tuntasin Dashboard Preview" 
                width={800} 
                height={600} 
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Row 2: Collaboration Stakeholders (Image Left, Content Right) */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto mt-20 lg:mt-28">
            {/* Left Column - Image */}
            <div className="relative order-2 lg:order-1">
              <Image 
                src="/about-image-2.png" 
                alt="Tuntasin Collaboration Preview" 
                width={800} 
                height={600} 
                className="w-full h-auto"
              />
            </div>

            {/* Right Column - Content */}
            <div className="bg-white rounded-xl p-8 md:p-10 border border-slate-200 order-1 lg:order-2">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-600">
                KOLABORASI STAKEHOLDER
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Kolaborasi Guru, Wali Kelas, dan BK
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Tuntasin merancang alur kerja yang menghubungkan setiap peran secara harmonis. Guru menginput nilai, wali kelas memantau progres kelas, dan guru BK memvalidasi kelulusan akhir dalam satu dasbor terpadu.
              </p>

              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Persetujuan Berjenjang yang Praktis</h4>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                      Sistem validasi otomatis memastikan lembar ketuntasan hanya diteruskan ke tahap berikutnya jika syarat pada tahap sebelumnya telah terpenuhi sepenuhnya.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Notifikasi Instan & Transparan</h4>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                      Setiap kali ada perubahan status persetujuan, notifikasi real-time langsung dikirim ke siswa dan guru bersangkutan demi menghindari miskomunikasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="alur" className="scroll-mt-20 border-y border-slate-200 bg-slate-50 py-24">
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

      {/* Testimonials Masonry Section */}
      <section id="testimoni" className="scroll-mt-20 bg-white py-24 relative overflow-hidden">
        {/* Subtle background glow similar to reference */}
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-32 bg-emerald-50/50 blur-[100px]" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 text-center mb-12 max-w-3xl mx-auto leading-tight tracking-tight">
            Dipercaya oleh seluruh elemen di SMKN 1 Bondowoso
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6">
              {/* Card 1 - Dark (now Green) */}
              <div className="bg-emerald-900 rounded-xl p-6 lg:p-8 shadow-md flex flex-col justify-between h-full text-white">
                <p className="text-lg font-medium leading-relaxed text-white mb-6">
                  "Saya sudah menggunakan Tuntasin sejak awal semester dan belum pernah kepikiran untuk kembali ke rekapan manual. Semuanya jadi lebih rapi."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-850 border border-emerald-700 flex items-center justify-center text-emerald-100 font-bold text-sm">
                    BS
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Budi Santoso</p>
                    <p className="text-xs text-emerald-200">Guru Matematika</p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Light */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col justify-between">
                <p className="text-base text-slate-700 leading-relaxed mb-6">
                  "Tuntasin memberikan kemudahan luar biasa dalam memantau progres kelas binaan saya. Tidak ada lagi nilai yang terlewat."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    SA
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Siti Aminah</p>
                    <p className="text-xs text-slate-500">Wali Kelas XI RPL 2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-6">
              {/* Card 3 - Light */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col justify-between">
                <p className="text-base text-slate-700 leading-relaxed mb-6">
                  "Validasi akhir sebelum pembagian rapor yang dulunya memakan waktu berhari-hari kini bisa diselesaikan dengan beberapa klik."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    RA
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Rini Astuti</p>
                    <p className="text-xs text-slate-500">Guru BK</p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Light */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col justify-between">
                <p className="text-base text-slate-700 leading-relaxed mb-6">
                  "Sangat membantu proses evaluasi pembelajaran, rekap nilai jadi lebih tertata dan dapat dipantau langsung dari HP."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    EP
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Eka Prasetya</p>
                    <p className="text-xs text-slate-500">Guru B. Inggris</p>
                  </div>
                </div>
              </div>

              {/* Card 5 - Light */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col justify-between">
                <p className="text-base text-slate-700 leading-relaxed mb-6">
                  "Guru-guru menjadi lebih tertib dalam mengumpulkan nilai tepat waktu karena progres terlihat transparan."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    NK
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Nisa Kamila</p>
                    <p className="text-xs text-slate-500">Koordinator Mapel</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-6">
              {/* Card 6 - Light */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col justify-between">
                <p className="text-base text-slate-700 leading-relaxed mb-6">
                  "Sistem pelaporan yang transparan membuat saya tidak perlu lagi mengejar-ngejar guru satu per satu setiap akhir semester."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    DK
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Dian Kusuma</p>
                    <p className="text-xs text-slate-500">Staf Tata Usaha</p>
                  </div>
                </div>
              </div>

              {/* Card 7 - Dark (now Green) */}
              <div className="bg-emerald-900 rounded-xl p-6 lg:p-8 shadow-md flex flex-col justify-between h-full text-white">
                <p className="text-lg font-medium leading-relaxed text-white mb-6">
                  "Ekosistem Tuntasin sangat membantu kelancaran operasional kurikulum sekolah. Integrasinya sempurna dengan alur akademik yang ada."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-850 border border-emerald-700 flex items-center justify-center text-emerald-100 font-bold text-sm">
                    AF
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Ahmad Fauzi</p>
                    <p className="text-xs text-emerald-200">Waka Kurikulum</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="kontak" className="relative bg-emerald-950 py-20 text-white overflow-hidden">
        {/* Custom top wave mask to make it look like a wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] text-white fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Optimalkan Validasi Akademik Sekolah Anda Sekarang
          </h2>
          <p className="text-sm md:text-base text-emerald-100/80 mb-8 max-w-xl mx-auto leading-relaxed">
            Bergabunglah dengan ekosistem digital Tuntasin untuk mempermudah validasi nilai secara transparan, melacak progres belajar secara real-time, dan menyelesaikan administrasi kelulusan lebih cepat.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent font-semibold px-6 py-5 text-sm transition-all">
                Lihat Panduan Alur
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-900 font-semibold px-6 py-5 text-sm shadow-md transition-all">
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-600 py-10 relative overflow-hidden">
        {/* Decorative subtle glow */}
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-20 bg-emerald-50/40 blur-[70px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-6 mb-8">
            
            {/* Column 1: Brand & About */}
            <div className="md:col-span-12 lg:col-span-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <Image
                    src="/etuntas-logo.png"
                    alt="Logo TUNTASIN"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">TUNTASIN</span>
              </div>
              <p className="text-slate-600 leading-relaxed max-w-md mb-4 text-sm">
                Platform digitalisasi alur validasi ketuntasan belajar siswa. Cepat, transparan, dan terintegrasi untuk mendukung ekosistem akademik SMKN 1 Bondowoso.
              </p>
              <div className="flex items-center gap-3">
                {/* Social Placeholders */}
                <a href="#" className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <span className="sr-only">Twitter/X</span>
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </div>
            </div>
 
            {/* Column 2: Quick Links */}
            <div className="md:col-span-4 lg:col-span-2 lg:col-start-7 text-sm">
              <h3 className="text-slate-900 font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-3">
                <li><a href="#alur" className="text-slate-600 hover:text-emerald-600 transition-colors">Cara Kerja</a></li>
                <li><a href="/login" className="text-slate-600 hover:text-emerald-600 transition-colors">Masuk Sistem</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Pusat Bantuan</a></li>
              </ul>
            </div>
 
            {/* Column 3: Contact */}
            <div className="md:col-span-8 lg:col-span-3 lg:col-start-10 text-sm">
              <h3 className="text-slate-900 font-semibold mb-4">Hubungi Kami</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed text-xs">
                    Jl. HOS Cokroaminoto No.110, <br />
                    Badean, Kec. Bondowoso, <br />
                    Kab. Bondowoso, Jawa Timur 68214
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <a href="mailto:info@smkn1bondowoso.sch.id" className="text-slate-600 hover:text-emerald-600 transition-colors">info@smkn1bondowoso.sch.id</a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <span className="text-slate-600">0332 - 421272</span>
                </li>
              </ul>
            </div>
            
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-slate-500">
              © {new Date().getFullYear()} TUNTASIN. Hak Cipta Dilindungi.
            </p>
            <div className="flex items-center gap-6 text-slate-500">
              <a href="#" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
