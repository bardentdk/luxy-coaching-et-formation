"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Loader2, Check, X, CircleSlash } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// --- Types basés sur votre migration ---
type Contact = {
  id: number;
  first_name: string;
  last_name: string;
};

type Deal = {
  id: number;
  title: string;
  amount: number | null;
  probability: number;
  deal_stage_id: number;
  crm_contact_id: number;
  formation_id?: number;
  crm_contacts: Contact;
};

type Stage = {
  id: number;
  name: string;
  color: string;
  deals: Deal[];
};

export default function PipelinePage() {
  const supabase = createClient();
  
  // États de données
  const [stages, setStages] = useState<Stage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  
  // États UI
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Chargement des données ---
  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Récupérer les étapes et les deals associés
    const { data: stagesData } = await supabase
      .from("deal_stages")
      .select("id, name, color, sort_order")
      .order("sort_order", { ascending: true });

    const { data: dealsData } = await supabase
      .from("deals")
      .select(`
        id, title, amount, probability, deal_stage_id, crm_contact_id,
        crm_contacts (id, first_name, last_name)
      `);

    // 2. Mapper les deals dans leurs colonnes respectives
    if (stagesData) {
      const formattedStages = stagesData.map((stage: any) => ({
        ...stage,
        deals: dealsData?.filter((d: any) => d.deal_stage_id === stage.id) || []
      }));
      setStages(formattedStages);
    }

    // 3. Charger les listes pour le formulaire
    const { data: contactsData } = await supabase.from("crm_contacts").select("id, first_name, last_name");
    const { data: formsData } = await supabase.from("formations").select("id, title");
    
    if (contactsData) setContacts(contactsData);
    if (formsData) setFormations(formsData);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Calculs de stats ---
  const totalDeals = useMemo(() => stages.reduce((acc, s) => acc + s.deals.length, 0), [stages]);
  const totalAmount = useMemo(() => 
    stages.reduce((acc, s) => acc + s.deals.reduce((sum, d) => sum + (d.amount || 0), 0), 0)
  , [stages]);

  const formatCurrency = (val: number | null) => {
    if (val === null) return "—";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
  };

  const getInitials = (contact: Contact) => 
    `${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`.toUpperCase();

  // --- Logique de Drag & Drop ---
  const onDragStart = (e: React.DragEvent, dealId: number, sourceStageId: number) => {
    e.dataTransfer.setData("dealId", dealId.toString());
    e.dataTransfer.setData("sourceStageId", sourceStageId.toString());
  };
  const onDrop = async (e: React.DragEvent, targetStageId: number) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    const sourceStageId = parseInt(e.dataTransfer.getData("sourceStageId"));

    if (sourceStageId === targetStageId) return;

    // Mise à jour optimiste de l'UI (100% Pure pour React Strict Mode)
    setStages(prevStages => {
      // 1. On clone profondément les colonnes ET leurs tableaux de deals pour éviter toute mutation
      const newStages = prevStages.map(stage => ({
        ...stage,
        deals: [...stage.deals]
      }));
      
      const sourceIdx = newStages.findIndex(s => s.id === sourceStageId);
      const targetIdx = newStages.findIndex(s => s.id === targetStageId);
      
      if (sourceIdx === -1 || targetIdx === -1) return prevStages;

      // 2. On utilise .toString() pour éviter les conflits de types (String/Number) avec les ID Supabase
      const dealIdx = newStages[sourceIdx].deals.findIndex(d => d.id.toString() === dealId.toString());
      
      // 3. Sécurité anti-crash au cas où le deal n'est pas trouvé
      if (dealIdx === -1) return prevStages; 
      
      // 4. On déplace le deal
      const [movedDeal] = newStages[sourceIdx].deals.splice(dealIdx, 1);
      movedDeal.deal_stage_id = targetStageId;
      newStages[targetIdx].deals.push(movedDeal);
      
      return newStages;
    });

    // Persistance Supabase
    await supabase.from("deals").update({ deal_stage_id: targetStageId }).eq("id", dealId);
  };
  // const onDrop = async (e: React.DragEvent, targetStageId: number) => {
  //   e.preventDefault();
  //   const dealId = parseInt(e.dataTransfer.getData("dealId"));
  //   const sourceStageId = parseInt(e.dataTransfer.getData("sourceStageId"));

  //   if (sourceStageId === targetStageId) return;

  //   // Mise à jour optimiste de l'UI
  //   setStages(prevStages => {
  //     const newStages = [...prevStages];
  //     const sourceIdx = newStages.findIndex(s => s.id === sourceStageId);
  //     const targetIdx = newStages.findIndex(s => s.id === targetStageId);
  //     const dealIdx = newStages[sourceIdx].deals.findIndex(d => d.id === dealId);
      
  //     const [movedDeal] = newStages[sourceIdx].deals.splice(dealIdx, 1);
  //     movedDeal.deal_stage_id = targetStageId;
  //     newStages[targetIdx].deals.push(movedDeal);
      
  //     return newStages;
  //   });

  //   // Persistance Supabase
  //   await supabase.from("deals").update({ deal_stage_id: targetStageId }).eq("id", dealId);
  // };

  // --- Création de Deal ---
  const handleCreateDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const newDeal = {
      title: formData.get("title"),
      crm_contact_id: formData.get("contact_id"),
      deal_stage_id: stages[0]?.id,
      amount: formData.get("amount") ? parseFloat(formData.get("amount") as string) : null,
      probability: parseInt(formData.get("probability") as string) || 50,
      formation_id: formData.get("formation_id") || null,
    };

    const { error } = await supabase.from("deals").insert([newDeal]);
    
    if (!error) {
      await fetchData();
      setShowNewDeal(false);
    }
    setSubmitting(false);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-140px)]">
      
      {/* Header + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-black text-navy tracking-tight mb-0.5">Pipeline commercial</h1>
          <p className="text-xs font-bold text-navy/40">
            {totalDeals} opportunité{totalDeals > 1 ? 's' : ''} · {formatCurrency(totalAmount)} au total
          </p>
        </div>

        <button onClick={() => setShowNewDeal(true)} className="btn-primary py-2.5 px-5 text-sm rounded-xl">
          <Plus size={16} /> Nouveau deal
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4 scrollbar-hide">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className="min-w-[290px] max-w-[290px] flex flex-col bg-[#F4F6FA] rounded-2xl overflow-hidden border border-navy/5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, stage.id)}
          >
            {/* Header colonne */}
            <div className="p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-black text-navy">{stage.name}</span>
              </div>
              <span className="text-[10px] font-black text-navy/30 bg-navy/5 px-2 py-0.5 rounded-full">
                {stage.deals.length}
              </span>
            </div>

            {/* Montant colonne */}
            <div className="px-4 pb-3 text-xs font-black text-navy shrink-0">
              {formatCurrency(stage.deals.reduce((sum, d) => sum + (d.amount || 0), 0))}
            </div>

            {/* Cards deals */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-2">
              {stage.deals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, deal.id, stage.id)}
                  className="bg-white rounded-xl p-3.5 border border-navy/5 shadow-sm cursor-grab active:cursor-grabbing hover:border-gold/30 hover:shadow-md transition-all group"
                >
                  <div className="text-sm font-black text-navy mb-2 leading-tight line-clamp-2">
                    {deal.title}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-[10px] font-black text-navy shrink-0">
                      {getInitials(deal.crm_contacts)}
                    </div>
                    <span className="text-[11px] font-bold text-navy/50 truncate">
                      {deal.crm_contacts.first_name} {deal.crm_contacts.last_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-black", deal.amount ? "text-navy" : "text-navy/20")}>
                      {formatCurrency(deal.amount)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-navy/30">{deal.probability}%</span>
                      <Link 
                        href={`/pipeline/${deal.id}`}
                        className="w-7 h-7 rounded-lg border border-navy/10 flex items-center justify-center text-navy/30 hover:bg-cream hover:text-gold transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {stage.deals.length === 0 && (
                <div className="flex-1 border-2 border-dashed border-navy/5 rounded-xl flex flex-col items-center justify-center p-6 text-navy/20">
                  <CircleSlash size={24} className="mb-2 opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Aucun deal</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal nouveau deal */}
      {showNewDeal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowNewDeal(false)} className="absolute top-6 right-6 text-navy/30 hover:text-navy transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-xl font-black text-navy mb-6">Nouveau deal</h2>

            <form onSubmit={handleCreateDeal} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Titre du deal</label>
                <input name="title" required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all" placeholder="Ex: Formation Excel - Entreprise X" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Contact</label>
                  <select name="contact_id" required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all">
                    <option value="">Sélectionner...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Montant (€)</label>
                  <input name="amount" type="number" step="0.01" className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Probabilité (%)</label>
                  <input name="probability" type="number" defaultValue="50" className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Formation liée</label>
                  <select name="formation_id" className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-all">
                    <option value="">Aucune</option>
                    {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNewDeal(false)} className="flex-1 py-3.5 rounded-xl border-2 border-navy/10 text-navy font-black text-sm hover:bg-cream transition-all">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-[2] btn-primary py-3.5 rounded-xl shadow-gold disabled:opacity-50">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                  Créer le deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}