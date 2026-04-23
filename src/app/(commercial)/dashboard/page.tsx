"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Euro, 
  Filter, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  Calendar, 
  FileText, 
  Plus,
  Loader2,
  Clock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// --- Types ---
type KPIState = {
  revenue_won: number;
  revenue_pipeline: number;
  deals_in_progress: number;
  new_leads_month: number;
  total_contacts: number;
  deals_won: number;
  conversion_rate: number;
};

type PipelineStage = {
  id: number;
  name: string;
  color: string;
  deals_count: number;
  deals_amount: number;
};

type Activity = {
  id: number;
  title: string;
  contact_name: string;
  scheduled_at: string;
};

type RecentContact = {
  id: number;
  full_name: string;
  initials: string;
  email: string;
  status_label: string;
  status_color: string;
};

type RecentQuote = {
  id: number;
  reference: string;
  contact_name: string;
  total: number;
  issued_at: string;
  status_label: string;
  status_color: string;
};

export default function CommercialDashboardPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  
  // États des données
  const [kpis, setKpis] = useState<KPIState | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [todoActivities, setTodoActivities] = useState<Activity[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      
      // Note: Dans une application réelle, ces données seraient calculées via des 
      // fonctions RPC Supabase ou des requêtes agrégées pour plus de performance.
      
      // Simulation des appels (Logique basée sur CommercialDashboardController.php)
      // fetchKpis()... fetchPipeline()...
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulation réseau

      // Données de test (à remplacer par vos appels Supabase réels)
      setKpis({
        revenue_won: 45200,
        revenue_pipeline: 128500,
        deals_in_progress: 14,
        new_leads_month: 24,
        total_contacts: 342,
        deals_won: 18,
        conversion_rate: 32
      });

      setPipeline([
        { id: 1, name: "Nouveau", color: "#3B82F6", deals_count: 5, deals_amount: 15000 },
        { id: 2, name: "Contacté", color: "#F59E0B", deals_count: 4, deals_amount: 22500 },
        { id: 3, name: "Devis envoyé", color: "#C9A84C", deals_count: 5, deals_amount: 91000 },
      ]);

      setIsLoading(false);
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);

  const totalPipelineAmount = pipeline.reduce((acc, stage) => acc + stage.deals_amount, 0);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      
      {/* --- LIGNE 1 : KPIs --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA Gagné */}
        <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
              <Euro size={20} />
            </div>
            <span className="text-[11px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">Gagné</span>
          </div>
          <div className="text-3xl font-black text-navy tracking-tight mb-1">{formatCurrency(kpis?.revenue_won || 0)}</div>
          <div className="text-xs text-navy/40 font-medium">Chiffre d'affaires</div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold to-gold-light" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold-dark">
              <Filter size={20} />
            </div>
            <span className="text-[11px] font-bold text-gold-dark bg-gold/10 px-2.5 py-1 rounded-full">Pipeline</span>
          </div>
          <div className="text-3xl font-black text-navy tracking-tight mb-1">{formatCurrency(kpis?.revenue_pipeline || 0)}</div>
          <div className="text-xs text-navy/40 font-medium">{kpis?.deals_in_progress} deals en cours</div>
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Users size={20} />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-full">+{kpis?.new_leads_month} ce mois</span>
          </div>
          <div className="text-3xl font-black text-navy tracking-tight mb-1">{kpis?.total_contacts}</div>
          <div className="text-xs text-navy/40 font-medium">Contacts CRM</div>
        </div>

        {/* Conversion */}
        <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp size={20} />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full">{kpis?.deals_won} gagnés</span>
          </div>
          <div className="text-3xl font-black text-navy tracking-tight mb-1">{kpis?.conversion_rate}%</div>
          <div className="text-xs text-navy/40 font-medium">Taux de conversion</div>
        </div>
      </div>

      {/* --- LIGNE 2 : Pipeline Résumé & Activités --- */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        
        {/* Pipeline Résumé */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-navy">Résumé pipeline</h2>
            <Link href="/pipeline" className="text-xs font-bold text-gold flex items-center gap-1.5 hover:underline">
              Voir le Kanban <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {pipeline.map(stage => (
              <div key={stage.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-bold text-navy">{stage.name}</span>
                    <span className="text-xs font-medium text-navy/40">{stage.deals_count} deals</span>
                  </div>
                  <span className="text-sm font-black text-navy">{formatCurrency(stage.deals_amount)}</span>
                </div>
                <div className="h-2 bg-navy/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(stage.deals_amount / totalPipelineAmount) * 100}%`, backgroundColor: stage.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activités */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-navy">Activités à faire</h2>
            {todoActivities.length > 0 && (
              <span className="text-[11px] font-bold bg-red-500/10 text-red-600 px-2.5 py-1 rounded-full">{todoActivities.length}</span>
            )}
          </div>
          {todoActivities.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500/40" />
              <div className="text-sm font-medium text-navy/30">Aucune activité en attente</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {todoActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-cream border border-navy/5">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 text-gold-dark">
                    <Calendar size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-navy truncate">{act.title}</div>
                    <div className="text-[11px] font-medium text-navy/50">{act.contact_name} · {act.scheduled_at}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- LIGNE 3 : Contacts & Devis Récents --- */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Derniers contacts */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-navy">Derniers contacts</h2>
            <Link href="/contacts" className="text-xs font-bold text-gold hover:underline">Voir tout →</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentContacts.length === 0 ? (
              <p className="text-center py-6 text-sm text-navy/30 italic">Aucun contact récent</p>
            ) : (
              recentContacts.map(contact => (
                <div key={contact.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF7F2] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-sm font-black text-gold shrink-0">
                    {contact.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/contacts/${contact.id}`} className="text-sm font-bold text-navy hover:text-gold truncate block">{contact.full_name}</Link>
                    <div className="text-xs text-navy/40">{contact.email}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: `${contact.status_color}18`, color: contact.status_color }}>
                    {contact.status_label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Derniers devis */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-navy">Devis récents</h2>
            <Link href="/devis" className="text-xs font-bold text-gold hover:underline">Voir tout →</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentQuotes.length === 0 ? (
              <p className="text-center py-6 text-sm text-navy/30 italic">Aucun devis récent</p>
            ) : (
              recentQuotes.map(quote => (
                <div key={quote.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF7F2] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold-dark shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/devis/${quote.id}`} className="text-sm font-bold text-navy hover:text-gold truncate block">{quote.reference}</Link>
                    <div className="text-xs text-navy/40">{quote.contact_name} · {quote.issued_at}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-navy">{formatCurrency(quote.total)}</div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5" style={{ backgroundColor: `${quote.status_color}18`, color: quote.status_color }}>
                      {quote.status_label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/devis/create" className="mt-4 flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gold/30 bg-gold/5 text-gold-dark text-sm font-bold hover:bg-gold/10 transition-colors">
            <Plus size={16} /> Nouveau devis
          </Link>
        </div>
      </div>
    </div>
  );
}