"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Mail, Clock, Trash2, 
  Edit3, Save, X, Loader2, AlertCircle, ChevronDown, ChevronUp 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── TYPES ──
type Step = {
  id: number;
  email_sequence_id: number;
  delay_days: number;
  subject: string;
  body_html: string;
  sort_order: number;
};

type Sequence = {
  id: number;
  name: string;
  trigger: string;
  is_active: boolean;
};

export default function SequenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [sequence, setSequence] = useState<Sequence | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États Modales / Formulaires
  const [editingStep, setEditingStep] = useState<Partial<Step> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Charger la séquence
    const { data: seqData } = await supabase
      .from("email_sequences")
      .select("*")
      .eq("id", id)
      .single();
    
    if (seqData) setSequence(seqData);

    // 2. Charger les étapes ordonnées
    const { data: stepsData } = await supabase
      .from("email_sequence_steps")
      .select("*")
      .eq("email_sequence_id", id)
      .order("sort_order", { ascending: true });

    if (stepsData) setSteps(stepsData);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // ── ACTIONS CRUD ──

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;
    setIsSubmitting(true);

    const isNew = !editingStep.id;
    const payload = {
      ...editingStep,
      email_sequence_id: id,
      sort_order: isNew ? steps.length : editingStep.sort_order
    };

    const { error } = isNew 
      ? await supabase.from("email_sequence_steps").insert([payload])
      : await supabase.from("email_sequence_steps").update(payload).eq("id", editingStep.id);

    if (!error) {
      await fetchData();
      setEditingStep(null);
    }
    setIsSubmitting(false);
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!confirm("Supprimer cette étape ?")) return;
    const { error } = await supabase.from("email_sequence_steps").delete().eq("id", stepId);
    if (!error) fetchData();
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold w-8 h-8" /></div>;
  if (!sequence) return <div className="text-center py-20">Séquence introuvable.</div>;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex items-center gap-4">
        <Link href="/sequences" className="w-10 h-10 rounded-xl border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-cream transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight">{sequence.name}</h1>
          <p className="text-sm text-navy/40 font-bold uppercase tracking-widest">Configuration des étapes</p>
        </div>
        <button 
          onClick={() => setEditingStep({ delay_days: 1, subject: "", body_html: "" })}
          className="ml-auto btn-primary py-2.5 px-5 text-sm rounded-xl shadow-gold"
        >
          <Plus size={16} /> Ajouter un email
        </button>
      </div>

      {/* ── LISTE CHRONOLOGIQUE ── */}
      <div className="relative flex flex-col gap-8 mt-4">
        {/* Ligne verticale de liaison */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-navy/5 rounded-full" />

        {steps.map((step, index) => (
          <div key={step.id} className="relative pl-16 group">
            {/* Indicateur de Jour */}
            <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white border-2 border-navy/10 flex flex-col items-center justify-center z-10 shadow-sm group-hover:border-gold transition-colors">
              <span className="text-[10px] font-black text-navy/40 leading-none">J+</span>
              <span className="text-lg font-black text-navy leading-none">{step.delay_days}</span>
            </div>

            {/* Carte de l'Email */}
            <div className="bg-white rounded-3xl p-6 border border-navy/5 shadow-sm group-hover:shadow-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                    <Mail size={16} />
                  </div>
                  <h3 className="font-black text-navy truncate max-w-md">{step.subject}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingStep(step)}
                    className="w-8 h-8 rounded-lg border border-navy/10 flex items-center justify-center text-navy/30 hover:text-navy hover:bg-cream transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteStep(step.id)}
                    className="w-8 h-8 rounded-lg border border-red-100 flex items-center justify-center text-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-navy/50 line-clamp-2 bg-[#FAF7F2] p-4 rounded-xl italic">
                {step.body_html.replace(/<[^>]*>/g, '')}
              </div>
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="pl-16 py-12 text-center border-2 border-dashed border-navy/5 rounded-[2rem]">
            <p className="text-navy/30 font-medium italic">Aucun email configuré. Cliquez sur "Ajouter" pour commencer la séquence.</p>
          </div>
        )}
      </div>

      {/* ── MODALE / DRAWER D'ÉDITION ── */}
      {editingStep && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-navy/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-navy">{editingStep.id ? "Modifier l'étape" : "Nouvel email"}</h2>
                <p className="text-xs text-navy/40 font-bold uppercase tracking-widest mt-1">Édition du contenu</p>
              </div>
              <button onClick={() => setEditingStep(null)} className="w-10 h-10 rounded-xl hover:bg-cream flex items-center justify-center text-navy/30">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex gap-6">
                <div className="w-32">
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Délai (jours)</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20" />
                    <input 
                      type="number" min="0" required
                      value={editingStep.delay_days}
                      onChange={e => setEditingStep({...editingStep, delay_days: parseInt(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-navy/10 rounded-xl text-sm font-bold bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Sujet de l'email</label>
                  <input 
                    required placeholder="Relance : Votre projet de formation"
                    value={editingStep.subject}
                    onChange={e => setEditingStep({...editingStep, subject: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-navy/10 rounded-xl text-sm font-bold bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest">Corps de l'email (HTML supporté)</label>
                  <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">Variables: {"{{contact_name}}"}, {"{{deal_title}}"}</span>
                </div>
                <textarea 
                  required rows={15}
                  value={editingStep.body_html}
                  onChange={e => setEditingStep({...editingStep, body_html: e.target.value})}
                  className="w-full p-6 border-2 border-navy/10 rounded-2xl text-sm leading-relaxed bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-all font-mono"
                  placeholder="Bonjour {{contact_name}},<br><br>Je me permets de revenir vers vous concernant..."
                />
              </div>
            </form>

            <div className="p-8 border-t border-navy/5 bg-[#FAF7F2]/50 flex gap-4">
              <button type="button" onClick={() => setEditingStep(null)} className="flex-1 py-4 rounded-xl border-2 border-navy/10 text-navy font-bold text-sm hover:bg-white transition-all">
                Annuler
              </button>
              <button 
                onClick={handleSaveStep}
                disabled={isSubmitting}
                className="flex-[2] btn-primary py-4 rounded-xl shadow-gold disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {editingStep.id ? "Mettre à jour l'étape" : "Enregistrer l'étape"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}