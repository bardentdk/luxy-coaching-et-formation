"use client";

import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Users, Award, Star } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-cream">
        <div className="dot-grid opacity-40" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div {...fadeInUp}>
            <span className="inline-block py-1 px-4 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider mb-6">
              Certifié Qualiopi
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-navy leading-tight mb-6">
              Dominez votre <br />
              <span className="text-gradient-gold">Avenir Pro</span>
            </h1>
            <p className="text-lg text-navy-muted mb-10 max-w-lg">
              Luxy Formation vous accompagne avec des programmes sur-mesure conçus par des experts du terrain pour une employabilité immédiate.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/formations" className="btn-primary text-base px-8">
                Découvrir le catalogue
                <ArrowRight size={20} />
              </Link>
              <Link href="/contact" className="btn-secondary text-base px-8">
                Parler à un conseiller
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square rounded-3xl bg-surface relative overflow-hidden shadow-gold">
              {/* Remplacer par ton image réelle plus tard */}
              <div className="absolute inset-0 bg-gradient-to-tr from-navy/10 to-transparent" />
            </div>
            {/* Badge flottant */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-hover flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Star fill="currentColor" size={24} />
              </div>
              <div>
                <p className="text-navy font-bold text-xl">4.9/5</p>
                <p className="text-xs text-navy/60">Note moyenne avis clients</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-12 bg-navy">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Apprenants", val: "2,500+", icon: Users },
            { label: "Formations", val: "45+", icon: GraduationCap },
            { label: "Réussite", val: "98%", icon: Award },
            { label: "Experts", val: "30+", icon: Star },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <stat.icon className="text-gold mx-auto mb-2" size={28} />
              <p className="text-3xl font-extrabold text-white">{stat.val}</p>
              <p className="text-white/50 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="section-padding section-light relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-extrabold text-navy mb-6">Pourquoi choisir Luxy Formation ?</h2>
            <p className="text-navy-muted">Un accompagnement d'excellence axé sur vos résultats concrets.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Expertise Terrain", d: "Nos formateurs sont des professionnels en activité pour une vision 100% pratique." },
              { t: "Suivi Personnalisé", d: "Un mentorat dédié tout au long de votre parcours de montée en compétences." },
              { t: "Réseau Puissant", d: "Accédez à notre écosystème de partenaires pour faciliter votre insertion." },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                {...fadeInUp}
                className="p-10 rounded-3xl border border-navy/5 bg-cream/30 hover:bg-white hover:shadow-hover transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-8 group-hover:bg-gold group-hover:text-navy transition-colors">
                  <Award size={32} />
                </div>
                <h3 className="text-xl font-bold text-navy mb-4">{f.t}</h3>
                <p className="text-navy-muted text-sm leading-relaxed">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}