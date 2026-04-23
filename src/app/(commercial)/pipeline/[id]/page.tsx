"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FileText, StickyNote, Phone, Mail, 
  Calendar, CheckSquare, CheckCircle, Clock, History,
  Loader2, MoreHorizontal, User, GraduationCap, Plus,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";

// --- Types basés sur la migration CRM ---
type Activity = {
  id: number;
  type: 'note' | 'call' | 'email' | 'meeting' | 'task';
  title: string;
  body: string;
  user_name?: string;
  created_at: string;
  is_done: boolean;
  type_color: string;
};

type Deal = {
  id: number;
  title: string;
  amount: number | null;
  probability: number;
  expected_close_date: string | null;
  notes: string | null;
  deal_stage_id: number;
  crm_contact_id: number;
  formation_id: number | null;
  stage: { id: number; name: string; color: string };
  contact: { id: number; first_name: string; last_name: string; email: string };
  formation?: { id: number; title: string };
  quotes: { id: number; reference: string; status: string; total: number }[];
};

const ACTIVITY_TYPES = [
  { value: "note", label: "Note", color: "#6366F1", icon: StickyNote },
  { value: "call", label: "Appel", color: "#22C55E", icon: Phone },
  { value: "email", label: "Email", color: "#C9A84C", icon: Mail },
  { value: "meeting", label: "RDV", color: "#3B82F6", icon: Calendar },
  { value: "task", label: "Tâche", color: "#F59E0B", icon: CheckSquare },
] as const;

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  // États
  const [deal, setDeal] = useState<Deal | null>(null);
  const [stages, setStages] = useState<{ id: number; name: string; color: string }[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulaire d'activité
  const [activityForm, setActivityForm] = useState({
    type: "note" as Activity['type'],
    title: "",
    body: "",
    scheduled_at: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Charger le deal avec ses relations
    const { data: dealData } = await supabase
      .from("deals")
      .select(`
        *,
        stage:deal_stages(*),
        contact:crm_contacts(*),
        formation:formations(id, title),
        quotes(*)
      `)
      .eq("id", id)
      .single();

    if (dealData) setDeal(dealData);

    // 2. Charger les étapes pour le sélecteur
    const { data: stagesData } = await supabase
      .from("deal_stages")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (stagesData) setStages(stagesData);

    // 3. Charger l'historique des activités
    const { data: activitiesData } = await supabase
      .from("deal_activities")
      .select("*")
      .eq("deal_id", id)
      .order("created_at", { ascending: false });

    if (activitiesData) {
      setActivities(activitiesData.map(a => ({
        ...a,
        type_color: ACTIVITY_TYPES.find(t => t.value === a.type)?.color || "#6366F1"
      })));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatCurrency = (val: number | null) => 
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val || 0);

  // --- Actions ---
  
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("deal_activities").insert([{
      deal_id: id,
      crm_contact_id: deal?.crm_contact_id,
      ...activityForm,
      is_done: false
    }]);

    if (!error) {
      setActivityForm({ type: "note", title: "", body: "", scheduled_at: "" });
      fetchData();
    }
    setIsSubmitting(false);
  };

  const handleMoveStage = async (stageId: number) => {
    const { error } = await supabase
      .from("deals")
      .update({ deal_stage_id: stageId })
      .eq("id", id);
    
    if (!error) fetchData();
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>;
  if (!deal) return <div className="text-center py-20"><AlertCircle className="mx-auto mb-4 text-red-400" /> Deal introuvable.</div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 flex-wrap">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-xl border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-cream hover:text-navy transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-navy truncate tracking-tight mb-1">{deal.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span 
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full" 
              style={{ backgroundColor: `${deal.stage.color}15`, color: deal.stage.color }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: deal.stage.color }} />
              {deal.stage.name}
            </span>
            {deal.amount && <span className="text-sm font-black text-gold">{formatCurrency(deal.amount)}</span>}
            <span className="text-xs text-navy/40 font-bold">{deal.probability}% de probabilité</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/devis/create?deal_id=${deal.id}`}
            className="btn-primary py-2.5 px-5 text-sm rounded-xl !bg-gold/10 !text-gold-dark border-2 border-gold/20 hover:!bg-gold hover:!text-navy"
          >
            <Plus size={16} /> Créer un devis
          </Link>
        </div>
      </div>

      {/* --- CORPS 2 COLONNES --- */}
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        
        {/* COLONNE GAUCHE : INFOS & ÉTAPES */}
        <div className="flex flex-col gap-5">
          {/* Détails du Deal */}
          <div className="bg-white rounded-3xl p-6 border border-navy/5 shadow-sm">
            <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.15em] mb-6">Détails de l'opportunité</h3>
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-navy/40 uppercase block mb-1">Contact</span>
                <Link href={`/contacts/${deal.contact.id}`} className="text-sm font-black text-navy hover:text-gold transition-colors">
                  {deal.contact.first_name} {deal.contact.last_name}
                </Link>
                <div className="text-xs text-navy/40 mt-0.5">{deal.contact.email}</div>
              </div>
              
              {deal.formation && (
                <div>
                  <span className="text-[10px] font-bold text-navy/40 uppercase block mb-1">Formation liée</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-navy">
                    <GraduationCap size={16} className="text-gold" />
                    {deal.formation.title}
                  </div>
                </div>
              )}

              {deal.expected_close_date && (
                <div>
                  <span className="text-[10px] font-bold text-navy/40 uppercase block mb-1">Clôture prévue</span>
                  <div className="text-sm font-bold text-navy">{new Date(deal.expected_close_date).toLocaleDateString('fr-FR')}</div>
                </div>
              )}

              {deal.notes && (
                <div className="pt-4 border-t border-navy/5">
                  <span className="text-[10px] font-bold text-navy/40 uppercase block mb-2">Notes internes</span>
                  <p className="text-xs text-navy/60 leading-relaxed italic">"{deal.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Sélecteur d'Étape */}
          <div className="bg-white rounded-3xl p-6 border border-navy/5 shadow-sm">
            <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.15em] mb-4">Déplacer le deal</h3>
            <div className="flex flex-col gap-2">
              {stages.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleMoveStage(s.id)}
                  disabled={s.id === deal.deal_stage_id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 text-xs font-bold transition-all text-left",
                    s.id === deal.deal_stage_id 
                      ? "cursor-default" 
                      : "border-navy/10 bg-white text-navy/60 hover:bg-cream hover:border-navy/20"
                  )}
                  style={s.id === deal.deal_stage_id ? { borderColor: s.color, backgroundColor: `${s.color}10`, color: s.color } : {}}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  {s.name}
                  {s.id === deal.deal_stage_id && <CheckCircle size={14} className="ml-auto opacity-60" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : ACTIVITÉS & TIMELINE */}
        <div className="flex flex-col gap-6">
          
          {/* Formulaire Nouvelle Activité */}
          <div className="bg-white rounded-3xl p-8 border border-navy/5 shadow-sm">
            <h3 className="text-sm font-black text-navy mb-6 tracking-tight">Ajouter une activité</h3>
            <div className="flex gap-2 mb-6 flex-wrap">
              {ACTIVITY_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActivityForm(prev => ({ ...prev, type: t.value }))}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all",
                    activityForm.type === t.value ? "" : "bg-white text-navy/50 border-navy/10 hover:bg-cream"
                  )}
                  style={activityForm.type === t.value ? { backgroundColor: `${t.color}15`, color: t.color, borderColor: `${t.color}30` } : {}}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <input 
                required
                placeholder="Titre de l'activité (ex: Appel de suivi)"
                value={activityForm.title}
                onChange={e => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3.5 border-2 border-navy/10 rounded-2xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all"
              />
              <textarea 
                rows={3}
                placeholder="Notes détaillées sur l'échange..."
                value={activityForm.body}
                onChange={e => setActivityForm(prev => ({ ...prev, body: e.target.value }))}
                className="w-full p-3.5 border-2 border-navy/10 rounded-2xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all resize-none"
              />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-navy/40">
                  <Clock size={16} />
                  <input 
                    type="datetime-local" 
                    value={activityForm.scheduled_at}
                    onChange={e => setActivityForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    className="text-xs font-bold bg-transparent outline-none focus:text-gold"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !activityForm.title}
                  className="btn-primary py-3 px-8 text-xs font-black shadow-gold disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>

          {/* Historique via Timeline */}
          <div className="bg-white rounded-3xl p-8 border border-navy/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-navy tracking-tight flex items-center gap-2">
                <History size={18} className="text-gold" /> Historique ({activities.length})
              </h3>
            </div>
            
            {activities.length === 0 ? (
              <div className="text-center py-10 text-navy/20 italic text-sm">
                Aucune activité enregistrée pour ce deal.
              </div>
            ) : (
              <Timeline>
                {/* Reason: Structure chronologique essentielle pour le suivi commercial. */}
                {activities.map(activity => {
                  const typeInfo = ACTIVITY_TYPES.find(t => t.value === activity.type);
                  return (
                    <TimelineEvent 
                      key={activity.id}
                      title={activity.title}
                      time={new Date(activity.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
                            style={{ backgroundColor: activity.type_color }}
                          >
                            {activity.type}
                          </span>
                          {activity.is_done ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                              <CheckCircle size={10} /> Terminé
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                              <Clock size={10} /> À faire
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-navy/60 leading-relaxed">{activity.body}</p>
                      </div>
                    </TimelineEvent>
                  );
                })}
              </Timeline>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}