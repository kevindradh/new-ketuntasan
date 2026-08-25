"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#fitur", label: "Fitur" },
  { href: "#alur", label: "Alur" },
  { href: "#kontak", label: "Kontak" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="e-Tuntas - beranda"
            className="flex items-center gap-2.5 justify-self-start"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/20">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-emerald-700">e-Tuntas</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-700"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 justify-self-end">
            <Link href="/login">
              <Button size="sm" className="gradient-primary border-0 font-semibold">
                Masuk
              </Button>
            </Link>
            <button
              type="button"
              aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="space-y-1 border-t border-emerald-100/60 pb-4 pt-3 md:hidden">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-emerald-700"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-slate-100"
            >
              Masuk
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
