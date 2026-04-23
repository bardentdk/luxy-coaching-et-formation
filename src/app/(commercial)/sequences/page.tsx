"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Mail, Zap, ArrowRight, Loader2, Play, Pause, Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Sequence = {
  id: number;
  name: string;
  trigger: string;
  is_active: boolean;
  steps_count?: number;
};

const TRIGGERS = [
  { value: "deal_created", label: "Création d'un Deal" },
  { value: "quote_sent", label: "Envoi d'un Devis" },
  { value: "meeting_scheduled", label: "RDV Programmé" },
];

export default function SequencesIndexPage() {
  const supabase = createClient();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSequences = async () => {
    setIsLoading(true);
    // On récupère les séquences ET on compte le nombre d'étapes associées
    const { data } = await supabase
      .from("email_sequences")
      .select("*, email_sequence_steps(count)")
      .order("created_at", { ascending: false });

    if (data) {
      setSequences(data.map((seq: any) => ({
        ...seq,
        steps_count: seq.email_sequence_steps[0].count
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSequences();
  }, [supabase]);

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    // Mise à jour optimiste de l'UI
    setSequences(seqs => seqs.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    await supabase.from("email_sequences").update({ is_active: !currentStatus }).eq("id", id);
  };

  const handleCreateSequence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("email_sequences").insert([{
      name: formData.get("name"),
      trigger: formData.get("trigger"),
      is_active: false // Toujours en pause à la création
    }]);

    if (!error) {
      await fetchSequences();
      setShowModal(false);
    }
    setIsSubmitting(false);
  };

  const getTriggerLabel = (val: string) => TRIGGERS.find(t => t.value === val)?.label || val;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold w-8 h-8" /></div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight mb-1">Séquences d'Emails</h1>
          <p className="text-sm text-navy/50 m-0">Automatisez vos relances commerciales selon les actions de vos clients.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary py-2.5 px-5 text-sm rounded-xl">
          <Plus size={16} /> Nouvelle séquence
        </button>
      </div>

      {/* ── GRILLE DES SÉQUENCES ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sequences.map(seq => (
          <div key={seq.id} className={cn("bg-white rounded-3xl p-6 border-2 transition-all flex flex-col group", seq.is_active ? "border-navy/5 shadow-hover hover:border-gold/30" : "border-navy/5 opacity-80")}>
            
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: seq.is_active ? '#C9A84C15' : '#0D1B2A05', color: seq.is_active ? '#C9A84C' : '#0D1B2A40' }}>
                <Mail size={24} />
              </div>
              <button 
                onClick={() => toggleStatus(seq.id, seq.is_active)}
                className={cn("px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-colors", seq.is_active ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "bg-navy/5 text-navy/40 border-navy/10 hover:bg-green-50 hover:text-green-600 hover:border-green-200")}
              >
                {seq.is_active ? <><Play size={10} fill="currentColor" /> Active</> : <><Pause size={10} fill="currentColor" /> En pause</>}
              </button>
            </div>

            <h3 className="text-lg font-black text-navy mb-2 line-clamp-1">{seq.name}</h3>
            
            <div className="flex items-center gap-2 mb-6 text-xs font-bold text-navy/50">
              <Zap size={14} className="text-amber-500" />
              Déclencheur : <span className="text-navy/80">{getTriggerLabel(seq.trigger)}</span>
            </div>

            <div className="mt-auto pt-6 border-t border-navy/5 flex items-center justify-between">
              <div className="text-xs font-bold text-navy/40">
                {seq.steps_count} étape(s)
              </div>
              <Link href={`/sequences/${seq.id}`} className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-navy hover:bg-gold transition-colors">
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}

        {sequences.length === 0 && (
          <div className="lg:col-span-3 border-2 border-dashed border-navy/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <Settings2 size={48} className="text-navy/20 mb-4" />
            <h3 className="text-lg font-black text-navy mb-2">Aucune séquence</h3>
            <p className="text-sm text-navy/50 mb-6 max-w-sm">Vous n'avez pas encore configuré d'automatisation d'emails. Créez-en une pour gagner du temps.</p>
            <button onClick={() => setShowModal(true)} className="btn-secondary py-2.5 px-6">Commencer</button>
          </div>
        )}
      </div>

      {/* ── MODAL CRÉATION ── */}
      {showModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-black text-navy mb-6">Nouvelle Séquence</h2>
            <form onSubmit={handleCreateSequence} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Nom de la campagne</label>
                <input name="name" required placeholder="Ex: Relance devis sans réponse" className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Déclencheur automatique</label>
                <select name="trigger" required className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all">
                  {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-navy/5">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border-2 border-navy/10 text-navy font-bold text-sm hover:bg-cream">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] btn-primary py-3 rounded-xl shadow-gold disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Créer et configurer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}