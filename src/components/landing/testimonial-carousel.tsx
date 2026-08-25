"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Sekarang saya bisa mengisi ketuntasan siswa dengan lebih rapi dan langsung melihat mana yang masih perlu ditindaklanjuti.",
    name: "Bapak/Ibu Guru",
    role: "Guru Mata Pelajaran",
  },
  {
    quote: "Proses review menjadi lebih jelas karena status ketuntasan setiap siswa bisa dipantau dari satu tempat.",
    name: "Bapak/Ibu Wali Kelas",
    role: "Wali Kelas",
  },
  {
    quote: "Dengan alur yang tercatat, saya lebih mudah memastikan setiap pengajuan sudah melewati tahapan yang tepat.",
    name: "Bapak/Ibu Guru BK",
    role: "Guru BK",
  },
  {
    quote: "Data yang tersusun dalam satu sistem membantu saya memantau proses tanpa harus mengumpulkan berkas satu per satu.",
    name: "Bapak/Ibu Admin",
    role: "Administrator",
  },
  {
    quote: "Saya bisa mengetahui status ketuntasan dan dokumen yang sudah tersedia tanpa harus bertanya ke banyak orang.",
    name: "Siswa",
    role: "Peserta Didik",
  },
  {
    quote: "Satu alur digital membuat koordinasi antarperan lebih mudah dipahami dan ditindaklanjuti.",
    name: "Bapak/Ibu Pimpinan",
    role: "Pimpinan Sekolah",
  },
];

export function TestimonialCarousel() {
  const rows = [testimonials.slice(0, 3), testimonials.slice(3)];
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPaused(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  const renderCard = (testimonial: (typeof testimonials)[number], duplicate = false) => (
    <article
      key={`${duplicate ? "duplicate-" : ""}${testimonial.role}`}
      className="w-[min(82vw,360px)] shrink-0 border border-slate-200 bg-transparent p-6"
      aria-hidden={duplicate}
    >
      <Quote aria-hidden className="mb-6 h-7 w-7 text-emerald-700" />
      <blockquote className="min-h-28 text-base leading-relaxed text-slate-700">
        “{testimonial.quote}”
      </blockquote>
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
          <p className="text-xs text-slate-500">{testimonial.role}</p>
        </div>
      </div>
    </article>
  );

  return (
    <div
      className="testimonial-marquee mx-auto max-w-6xl overflow-hidden"
      role="region"
      aria-roledescription="marquee"
      aria-label="Testimoni warga sekolah"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <style>{`
        @keyframes testimonial-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes testimonial-marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div className="group space-y-3">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="overflow-hidden focus-within:outline-none">
            <div
              className="testimonial-marquee-track flex w-max gap-3"
              style={{
                animationName: rowIndex === 0 ? "testimonial-marquee-left" : "testimonial-marquee-right",
                animationDuration: "42s",
                animationIterationCount: "infinite",
                animationTimingFunction: "linear",
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              <div className="flex gap-3">{row.map((testimonial) => renderCard(testimonial))}</div>
              <div className="flex gap-3" aria-hidden="true">{row.map((testimonial) => renderCard(testimonial, true))}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        Draft kutipan untuk diganti dengan testimoni asli. Arahkan kursor ke kartu untuk menjeda.
      </p>
    </div>
  );
}
