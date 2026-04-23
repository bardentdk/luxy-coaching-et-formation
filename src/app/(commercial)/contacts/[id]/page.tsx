"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, Phone, Building2, User, KanbanSquare, History, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    async function loadContact() {
      const { data: contactData } = await supabase.from("crm_contacts").select("*").eq("id", id).single();
      const { data: dealsData } = await supabase.from("deals").select("*, stage:deal_stages(*)").eq("crm_contact_id", id);
      
      setContact(contactData);
      setDeals(dealsData || []);
      setLoading(false);
    }
    loadContact();
  }, [id, supabase]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>;
  if (!contact) return <div className="text-center py-20 text-navy/50 font-bold">Contact introuvable. Vérifiez l'URL.</div>;
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-cream">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-navy">{contact.first_name} {contact.last_name}</h1>
          <p className="text-sm text-navy/50">{contact.job_title} @ {contact.company || "Indépendant"}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Infos fixes */}
        <div className="bg-white rounded-3xl p-8 border border-navy/5 shadow-sm space-y-6">
          <h3 className="text-xs font-black text-navy/30 uppercase tracking-widest">Coordonnées</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold text-navy">
              <Mail size={16} className="text-gold" /> {contact.email}
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-navy">
              <Phone size={16} className="text-gold" /> {contact.phone || "—"}
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-navy">
              <Building2 size={16} className="text-gold" /> {contact.company || "—"}
            </div>
          </div>
        </div>

        {/* Historique Deals */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-navy/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-navy tracking-tight">Opportunités liées</h3>
            <Link href={`/pipeline?contact_id=${id}`} className="text-xs font-bold text-gold hover:underline">Nouveau Deal +</Link>
          </div>
          <div className="space-y-3">
            {deals.length === 0 ? (
              <p className="text-center py-6 text-sm text-navy/30 italic">Aucun deal en cours.</p>
            ) : (
              deals.map(deal => (
                <div key={deal.id} className="flex items-center justify-between p-4 rounded-2xl bg-cream/50 border border-navy/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-navy/10 flex items-center justify-center text-gold">
                      <KanbanSquare size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-navy">{deal.title}</div>
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{ backgroundColor: `${deal.stage.color}15`, color: deal.stage.color }}>
                        {deal.stage.name}
                      </div>
                    </div>
                  </div>
                  <Link href={`/pipeline/${deal.id}`} className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center text-navy/40 hover:bg-navy hover:text-white transition-all">
                    <ArrowLeft size={14} className="rotate-180" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}