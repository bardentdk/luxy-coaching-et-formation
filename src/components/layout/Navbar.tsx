"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "La vie du centre", href: "/vie-du-centre" },
  { name: "Nos formations", href: "/formations" },
  { name: "Vos avis", href: "/avis" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 py-4 px-6 md:px-12",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-card py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img width="150" src="https://luxyformation.re/wp-content/uploads/2024/03/cropped-horizontal_luxy_logo-300x97.png" alt="" />
          {/* <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center group-hover:bg-gold transition-colors">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className={cn(
            "font-bold text-xl tracking-tight transition-colors",
            isScrolled ? "text-navy" : "text-navy" // Adapté selon ton design original
          )}>
            LUXY<span className="text-gold">FORMATION</span>
          </span> */}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold transition-colors hover:text-gold",
                pathname === link.href ? "text-gold" : "text-navy"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/login" className="btn-primary py-2 px-6 text-sm">
            <LogIn size={16} />
            Espace Pro
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-navy"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-hover p-6 lg:hidden flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-navy hover:text-gold"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/login" className="btn-primary justify-center mt-4">
              Espace Pro
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}