"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Clock, Award, Target, BookOpen, 
  CheckCircle2, FileText, Users, HelpCircle, Send
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock Data (Simule le résultat d'un fetch Supabase par ID) ──
const formation = {
  id: 1,
  title: "Développement React JS Avancé",
  category: "Développement Web",
  level: "Expert",
  duration: "3 jours (21h)",
  price: 1500,
  excerpt: "Maîtrisez les hooks avancés, le state management et l'architecture des applications React modernes.",
  objectifs: [
    "Maîtriser les Hooks personnalisés et les patterns avancés",
    "Optimiser les performances de rendu d'une application complexe",
    "Mettre en place une gestion d'état robuste avec Zustand ou Redux",
    "Sécuriser et tester ses composants en profondeur"
  ],
  programme: [
    { title: "Jour 1 : Rappels et Patterns Avancés", detail: "Compréhension profonde du cycle de vie, Render Props vs HOC, et patterns de composition." },
    { title: "Jour 2 : Gestion d'état et Performance", detail: "Optimisation avec useMemo/useCallback et mise en place d'un store global performant." },
    { title: "Jour 3 : Écosystème et Tests", detail: "Tests unitaires avec Vitest, intégration continue et déploiement optimisé." }
  ],
  prerequis: "Bonne maîtrise de JavaScript (ES6+) et des bases de React (useState, useEffect).",
  public_vise: "Développeurs Front-end, Fullstack ou Architectes Web souhaitant monter en expertise.",
  modalites_evaluation: "QCM de validation des acquis en fin de cursus et mise en situation réelle via un mini-projet guidé."
};

export default function FormationShowPage() {
  const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── HERO SECTION ── */}
      <section className="bg-navy pt-32 pb-20 relative overflow-hidden text-white">
        <div className="dot-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <Link 
            href="/formations" 
            className="inline-flex items-center gap-2 text-gold font-bold text-sm mb-8 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={16} /> Retour au catalogue
          </Link>
          
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-end">
            <div>
              <span className="inline-block py-1 px-4 rounded-full bg-gold/20 text-gold-light text-xs font-black uppercase tracking-widest mb-6 border border-gold/30">
                {formation.category}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                {formation.title}
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mb-0">
                {formation.excerpt}
              </p>
            </div>
            
            <div className="hidden lg:flex gap-6 pb-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Durée</span>
                <div className="flex items-center gap-2 font-bold text-gold">
                  <Clock size={18} /> {formation.duration}
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Niveau</span>
                <div className="flex items-center gap-2 font-bold text-gold">
                  <Award size={18} /> {formation.level}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT SECTION ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          
          {/* ── COLONNE PRINCIPALE : PÉDAGOGIE ── */}
          <div className="space-y-12">
            
            {/* Objectifs */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  <Target size={22} />
                </div>
                <h2 className="text-2xl font-black text-navy tracking-tight">Objectifs de la formation</h2>
              </div>
              <ul className="grid md:grid-cols-2 gap-4">
                {formation.objectifs.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-navy/5 bg-cream/30">
                    <CheckCircle2 size={18} className="text-gold shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-navy/80">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Programme */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  <BookOpen size={22} />
                </div>
                <h2 className="text-2xl font-black text-navy tracking-tight">Détail du programme</h2>
              </div>
              <div className="relative space-y-6">
                <div className="absolute left-6 top-4 bottom-4 w-px bg-navy/5" />
                {formation.programme.map((step, i) => (
                  <div key={i} className="relative pl-16 group">
                    <div className="absolute left-3 top-0 w-6 h-6 rounded-full bg-white border-2 border-gold flex items-center justify-center z-10 group-hover:bg-gold transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold group-hover:bg-white" />
                    </div>
                    <h3 className="text-lg font-black text-navy mb-2">{step.title}</h3>
                    <p className="text-sm text-navy/60 leading-relaxed max-w-2xl">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prérequis et Public */}
            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-navy/5">
              <div>
                <h4 className="text-xs font-black text-navy/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Users size={14} /> Public visé
                </h4>
                <p className="text-sm font-medium text-navy/70 leading-relaxed">{formation.public_vise}</p>
              </div>
              <div>
                <h4 className="text-xs font-black text-navy/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <HelpCircle size={14} /> Prérequis
                </h4>
                <p className="text-sm font-medium text-navy/70 leading-relaxed">{formation.prerequis}</p>
              </div>
            </div>

          </div>

          {/* ── SIDEBAR : ACTIONS & PRIX ── */}
          <aside className="sticky top-28 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-hover border border-navy/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-full -z-10" />
              
              <div className="mb-8">
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-1">Tarif de référence</span>
                <div className="text-4xl font-black text-navy">{formatCurrency(formation.price)}</div>
                <p className="text-[11px] text-navy/40 mt-1 font-medium">Exonéré de TVA (Organisme de formation)</p>
              </div>

              <div className="space-y-4">
                <Link 
                  href={`/contact?subject=Devis : ${formation.title}`}
                  className="btn-primary w-full py-4 text-sm font-black shadow-gold group"
                >
                  Demander un devis
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact"
                  className="btn-secondary w-full py-4 text-sm font-bold"
                >
                  Contacter un conseiller
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-navy/5 space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-navy/60">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Éligible au financement OPCO
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-navy/60">
                  <FileText size={16} className="text-blue-500" />
                  Convention de formation incluse
                </div>
              </div>
            </div>

            {/* Bloc de réassurance Qualiopi */}
            <div className="bg-cream rounded-2xl p-6 border border-gold/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm font-black text-gold text-xs">
                Q
              </div>
              <div>
                <p className="text-[11px] font-black text-navy/40 uppercase tracking-wider leading-tight">Certification</p>
                <p className="text-sm font-bold text-navy tracking-tight">Processus certifié Qualiopi</p>
              </div>
            </div>
          </aside>

        </div>
      </section>
    </div>
  );
}