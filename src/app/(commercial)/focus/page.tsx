"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, SkipForward, ArrowLeft, Loader2, Target, Calendar, AlertCircle, Briefcase, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  contact?: { first_name: string; last_name: string; company: string };
  deal?: { title: string };
};

export default function FocusModePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialCount, setInitialCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPendingTasks() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // On récupère les tâches 'pending' triées par date d'échéance (les plus vieilles d'abord)
    const { data, error } = await supabase
      .from("crm_tasks")
      .select(`
        *,
        contact:crm_contacts(first_name, last_name, company),
        deal:deals(title)
      `)
      .eq("status", "pending")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (!error && data) {
      setTasks(data as any[]);
      setInitialCount(data.length);
    }
    setIsLoading(false);
  }

  // Marquer comme terminé
  const handleComplete = async (taskId: string) => {
    setIsActionLoading(true);
    
    // Mise à jour en base de données
    await supabase.from("crm_tasks").update({ status: 'completed' }).eq("id", taskId);
    
    // Retirer la tâche de la liste locale
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setIsActionLoading(false);
  };

  // Passer à la suivante (mettre à la fin de la file)
  const handleSkip = () => {
    setTasks(prev => {
      if (prev.length <= 1) return prev;
      const newTasks = [...prev];
      const firstTask = newTasks.shift(); // Enlève le premier
      if (firstTask) newTasks.push(firstTask); // Le remet à la fin
      return newTasks;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-gold w-12 h-12 mb-4" />
        <p className="text-navy/50 font-bold">Préparation de votre session de focus...</p>
      </div>
    );
  }

  // ÉCRAN DE SUCCÈS (File vide)
  if (tasks.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Target className="text-green-500 w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-navy mb-4">Session terminée !</h1>
        <p className="text-navy/60 mb-8 leading-relaxed">
          Incroyable travail. Vous avez traité toutes vos tâches urgentes. Il est temps de prendre un café ou de retourner sur le dashboard.
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn-primary px-8 py-4 rounded-2xl shadow-gold font-bold flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Retourner au Dashboard
        </button>
      </div>
    );
  }

  const currentTask = tasks[0];
  const isOverdue = currentTask.due_date && new Date(currentTask.due_date) < new Date();
  const progress = Math.round(((initialCount - tasks.length) / initialCount) * 100) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A101D] flex flex-col">
      
      {/* ── HEADER FOCUS MODE ── */}
      <header className="p-6 flex items-center justify-between border-b border-white/10">
        <button 
          onClick={() => router.back()}
          className="text-white/50 hover:text-white flex items-center gap-2 font-bold transition-colors"
        >
          <ArrowLeft size={18} /> Quitter le mode Focus
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Progression de la session</p>
            <p className="text-gold font-black text-lg">{initialCount - tasks.length} / {initialCount} terminées</p>
          </div>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── CONTENU CENTRAL (LA TÂCHE) ── */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          
          {/* Badge d'urgence */}
          <div className="flex justify-center mb-6">
            {isOverdue ? (
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertCircle size={14} /> En retard
              </span>
            ) : currentTask.priority === 'high' ? (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={14} /> Priorité Haute
              </span>
            ) : (
              <span className="bg-white/10 text-white/60 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Target size={14} /> À faire
              </span>
            )}
          </div>

          {/* Carte de la tâche */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold to-yellow-300" />
            
            <h2 className="text-3xl font-black text-navy mb-4 leading-tight">
              {currentTask.title}
            </h2>
            
            {currentTask.description && (
              <p className="text-navy/60 text-lg mb-8 leading-relaxed">
                {currentTask.description}
              </p>
            )}

            {/* Informations contextuelles */}
            <div className="flex flex-wrap gap-4 mb-10 pt-6 border-t border-navy/5">
              {currentTask.due_date && (
                <div className="flex items-center gap-2 text-sm font-bold text-navy/70 bg-[#F8F9FB] px-4 py-2 rounded-xl">
                  <Calendar size={16} className="text-gold" />
                  {new Date(currentTask.due_date).toLocaleString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              {currentTask.contact && (
                <div className="flex items-center gap-2 text-sm font-bold text-navy/70 bg-[#F8F9FB] px-4 py-2 rounded-xl">
                  <User size={16} className="text-gold" />
                  {currentTask.contact.first_name} {currentTask.contact.last_name}
                </div>
              )}
              {currentTask.deal && (
                <div className="flex items-center gap-2 text-sm font-bold text-navy/70 bg-[#F8F9FB] px-4 py-2 rounded-xl">
                  <Briefcase size={16} className="text-gold" />
                  {currentTask.deal.title}
                </div>
              )}
            </div>

            {/* ── BOUTONS D'ACTION (LE COEUR DU MODE FOCUS) ── */}
            <div className="flex gap-4">
              <button 
                onClick={handleSkip}
                disabled={isActionLoading || tasks.length === 1}
                className="flex-1 py-5 rounded-2xl border-2 border-navy/10 text-navy font-black text-lg hover:bg-[#F8F9FB] flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <SkipForward size={24} className="text-navy/40 group-hover:text-navy transition-colors" /> 
                Passer
              </button>
              
              <button 
                onClick={() => handleComplete(currentTask.id)}
                disabled={isActionLoading}
                className="flex-[2] bg-gold hover:bg-gold-dark text-[#0A101D] font-black text-lg py-5 rounded-2xl shadow-[0_10px_40px_rgba(201,168,76,0.3)] hover:shadow-[0_10px_40px_rgba(201,168,76,0.5)] hover:-translate-y-1 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />} 
                Marquer comme terminé
              </button>
            </div>
          </div>
          
          <p className="text-center text-white/30 text-sm font-medium mt-8">
            Tâche 1 sur {tasks.length} dans la file d'attente
          </p>
        </div>
      </main>
    </div>
  );
}