"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight, Eye, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Mock Data (Censé provenir de Supabase) ──
const articles = [
  { 
    id: 1, 
    title: "Les nouveautés de la certification Qualiopi en 2026", 
    category: "Actualité", 
    excerpt: "Découvrez les nouveaux critères d'exigence applicables aux organismes de formation cette année et comment nous nous y préparons.", 
    image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    views: 1240, 
    created_at: "12 Avr 2026" 
  },
  { 
    id: 2, 
    title: "Pourquoi se former à Next.js aujourd'hui ?", 
    category: "Développement", 
    excerpt: "Le framework React continue de dominer le marché. Focus sur les Server Components et l'impact sur les performances web.", 
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    views: 856, 
    created_at: "05 Avr 2026" 
  },
  { 
    id: 3, 
    title: "Retour sur notre dernière session de coaching", 
    category: "Vie du centre", 
    excerpt: "Une journée riche en émotions et en apprentissage avec la promotion de développeurs fullstack. Retour en images.", 
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    views: 432, 
    created_at: "28 Mar 2026" 
  },
];

const categories = ["Toutes", "Actualité", "Développement", "Vie du centre", "Conseils Pro"];

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [search, setSearch] = useState("");

  const filteredArticles = articles.filter(a => 
    (activeCategory === "Toutes" || a.category === activeCategory) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* ── HERO SECTION ── */}
      <section className="bg-navy pt-32 pb-24 relative overflow-hidden text-white">
        <div className="dot-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-gold/20 text-gold font-black text-xs uppercase tracking-widest mb-6 border border-gold/30">
            Le Blog
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            La vie du <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light">Centre</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Actualités, conseils professionnels, retours d'expérience et veille technologique. Plongez dans l'écosystème Luxy Formation.
          </p>
        </div>
      </section>

      {/* ── RECHERCHE & FILTRES ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-10 relative z-20 mb-16">
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-hover border border-navy/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input 
              type="text" 
              placeholder="Rechercher un article..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-navy/10 rounded-2xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-3 rounded-full text-sm font-bold border-2 whitespace-nowrap transition-all",
                  activeCategory === cat 
                    ? "bg-navy text-white border-navy" 
                    : "bg-white text-navy/60 border-navy/10 hover:bg-cream hover:text-navy"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GRILLE D'ARTICLES ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article, index) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-[2rem] border-2 border-navy/5 overflow-hidden group hover:border-gold/30 hover:shadow-hover transition-all flex flex-col"
            >
              {/* Image d'en-tête */}
              <Link href={`/vie-du-centre/${article.id}`} className="aspect-[4/3] bg-navy/5 relative overflow-hidden block">
                {article.image_url ? (
                  <img 
                    src={article.image_url} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-navy/10 group-hover:scale-110 transition-transform duration-700">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-black text-navy uppercase tracking-wider">
                  {article.category}
                </div>
              </Link>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 mb-4 text-xs font-bold text-navy/40 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gold" /> {article.created_at}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} className="text-gold" /> {article.views} vues
                  </span>
                </div>
                
                <Link href={`/vie-du-centre/${article.id}`} className="block group-hover:text-gold transition-colors">
                  <h3 className="text-xl font-black text-navy mb-3 leading-tight line-clamp-2">{article.title}</h3>
                </Link>
                <p className="text-sm text-navy/60 mb-8 flex-1 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                
                <div className="pt-6 border-t border-navy/5">
                  <Link 
                    href={`/vie-du-centre/${article.id}`} 
                    className="inline-flex items-center gap-2 text-sm font-bold text-navy group-hover:text-gold transition-colors"
                  >
                    Lire l'article <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <ImageIcon size={48} className="mx-auto text-navy/15 mb-4" />
            <h3 className="text-xl font-bold text-navy mb-2">Aucun article trouvé</h3>
            <p className="text-navy/50">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </section>
    </div>
  );
}