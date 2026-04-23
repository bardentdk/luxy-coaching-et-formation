"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PlayCircle, BookOpen, Award, Clock, 
  CheckCircle, ArrowRight, Loader2, Play
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ── Mock Data (Censé provenir de la table des inscriptions/sessions) ──
const mockEnrollments = [
  {
    id: 1,
    formation_title: "Développement React JS Avancé",
    progress: 65,
    completed_modules: 13,
    total_modules: 20,
    last_accessed: "Il y a 2 heures",
    is_completed: false,
    image_url: null,
  },
  {
    id: 2,
    formation_title: "Figma : De l'UX au prototypage",
    progress: 100,
    completed_modules: 15,
    total_modules: 15,
    last_accessed: "Le 12 Mars 2026",
    is_completed: true,
    image_url: null,
  },
  {
    id: 3,
    formation_title: "Maîtriser le SEO Technique",
    progress: 10,
    completed_modules: 2,
    total_modules: 20,
    last_accessed: "Il y a 3 jours",
    is_completed: false,
    image_url: null,
  }
];

const mockStats = {
  active_courses: 2,
  completed_courses: 1,
  hours_learned: 34,
  certificates: 1
};

export default function LearnerDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState(mockEnrollments);

  useEffect(() => {
    // Simulation d'un appel Supabase pour récupérer les formations de l'apprenant
    const fetchMyLearning = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };
    fetchMyLearning();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gold w-8 h-8" /></div>;
  }

  // On isole la formation en cours (celle avec la progression la plus élevée mais non terminée)
  const activeCourse = enrollments.find(e => !e.is_completed) || enrollments[0];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-10">
      
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight mb-2">Prêt à reprendre l'apprentissage ?</h1>
        <p className="text-navy/50">Voici un résumé de votre progression et de vos acquis.</p>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "En cours", value: mockStats.active_courses, icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Terminées", value: mockStats.completed_courses, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Heures de cours", value: mockStats.hours_learned, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Certificats", value: mockStats.certificates, icon: Award, color: "text-gold-dark", bg: "bg-gold/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-navy tracking-tight leading-none mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        
        {/* ── REPRENDRE LA FORMATION (MAIN CARD) ── */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black text-navy">Reprendre la lecture</h2>
          
          <div className="bg-navy rounded-[2rem] p-8 text-white relative overflow-hidden shadow-hover group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110" />
            
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/10">
                <PlayCircle size={14} className="text-gold" /> En cours
              </span>
            </div>

            <h3 className="text-2xl font-black mb-2 leading-tight pr-12">{activeCourse.formation_title}</h3>
            <p className="text-white/60 text-sm mb-8">Dernier accès : {activeCourse.last_accessed}</p>

            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-white/80">Progression globale</span>
                <span className="text-gold">{activeCourse.progress}%</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${activeCourse.progress}%` }}
                />
              </div>
              <div className="text-[10px] text-white/40 mt-2">
                {activeCourse.completed_modules} / {activeCourse.total_modules} modules complétés
              </div>
            </div>

            <button className="btn-primary w-full sm:w-auto py-3.5 px-8 text-sm inline-flex justify-center shadow-gold group-hover:bg-gold-light">
              <Play size={16} fill="currentColor" /> Continuer le cours
            </button>
          </div>
        </div>

        {/* ── LISTE DES FORMATIONS ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-navy">Mes autres parcours</h2>
            <Link href="/espace-apprenant/formations" className="text-xs font-bold text-gold hover:underline">
              Tout voir
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {enrollments.filter(e => e.id !== activeCourse.id).map(course => (
              <Link 
                href={`/espace-apprenant/cours/${course.id}`} 
                key={course.id} 
                className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm hover:border-gold/30 hover:shadow-md transition-all flex flex-col gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center shrink-0 text-navy/30">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-navy leading-tight mb-1 truncate">{course.formation_title}</h3>
                    {course.is_completed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded">
                        <CheckCircle size={10} /> Terminée
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-navy/50">Dernier accès : {course.last_accessed}</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-navy/40 mb-1.5">
                    <span>{course.progress}% complété</span>
                    <span>{course.completed_modules}/{course.total_modules}</span>
                  </div>
                  <div className="h-1.5 bg-navy/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${course.is_completed ? 'bg-green-500' : 'bg-gold'}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}