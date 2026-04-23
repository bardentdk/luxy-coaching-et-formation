"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ── Type basé sur ta base de données ──
type Formation = {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  excerpt?: string;
  description?: string;
};

const categories = ["Toutes", "Développement Web", "Marketing Digital", "Design & UX", "Management"];

export default function PublicFormationsPage() {
  // États pour les données et le chargement
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les filtres
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [search, setSearch] = useState("");

  const supabase = createClient();

  // ── Récupération des données Supabase ──
  useEffect(() => {
    const fetchFormations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .eq("is_active", true) // On ne récupère que les formations publiées
        .order("created_at", { ascending: false });

      if (data && !error) {
        setFormations(data);
      }
      setIsLoading(false);
    };

    fetchFormations();
  }, [supabase]);

  // ── Filtrage côté client ──
  const filteredFormations = formations.filter(f => 
    (activeCategory === "Toutes" || f.category === activeCategory) &&
    (f.title.toLowerCase().includes(search.toLowerCase()) || (f.excerpt || f.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── HEADER PUBLIC ── */}
      <section className="bg-cream pt-32 pb-20 relative overflow-hidden">
        <div className="dot-grid opacity-30" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-gold/20 text-gold-dark text-xs font-black uppercase tracking-widest mb-6">
            Catalogue 2026
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-navy tracking-tight mb-6">
            Nos programmes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-dark">Formation</span>
          </h1>
          <p className="text-lg text-navy/60 max-w-2xl mx-auto">
            Des cursus intensifs et professionnalisants animés par des experts du secteur. Montez en compétences dès aujourd'hui.
          </p>
        </div>
      </section>

      {/* ── RECHERCHE & FILTRES ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20 mb-16">
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-hover border border-navy/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input 
              type="text" 
              placeholder="Rechercher une compétence..." 
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

      {/* ── GRILLE DES FORMATIONS ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-navy/40">
            <Loader2 size={40} className="animate-spin mb-4 text-gold" />
            <p className="font-bold">Chargement du catalogue...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.map(formation => (
                <div key={formation.id} className="bg-white rounded-3xl border-2 border-navy/5 overflow-hidden group hover:border-gold/30 hover:shadow-hover transition-all flex flex-col">
                  {/* Image Placeholder */}
                  <div className="aspect-video bg-navy/5 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-navy/10 group-hover:scale-110 transition-transform duration-700">
                      <BookOpen size={48} />
                    </div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-black text-navy uppercase tracking-wider">
                      {formation.category || "Formation"}
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-md">{formation.level || "Tous niveaux"}</span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-navy/50">
                        <Clock size={14} /> {formation.duration}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-navy mb-3 leading-tight">{formation.title}</h3>
                    <p className="text-sm text-navy/60 mb-8 flex-1 line-clamp-3">{formation.excerpt || formation.description}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-navy/5">
                      <div className="text-lg font-black text-navy">{formation.price} €</div>
                      <Link 
                        href={`/formations/${formation.id}`} 
                        className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-navy group-hover:bg-gold transition-colors"
                      >
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFormations.length === 0 && (
              <div className="text-center py-20">
                <BookOpen size={48} className="mx-auto text-navy/20 mb-4" />
                <h3 className="text-xl font-bold text-navy mb-2">Aucune formation trouvée</h3>
                <p className="text-navy/50">Essayez de modifier vos critères de recherche.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}