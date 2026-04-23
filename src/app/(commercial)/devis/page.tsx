"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, FileText, Search, Filter, MoreHorizontal, 
  Download, Eye, Trash2, Loader2, Calendar
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Quote = {
  id: number;
  quote_number: string;
  total_ht: number;
  total_ttc: number;
  status: string;
  created_at: string;
  client: {
    first_name: string;
    last_name: string;
    company: string;
  };
};

export default function DevisIndexPage() {
  const supabase = createClient();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchQuotes() {
      setIsLoading(true);
      // On récupère les devis avec les infos du contact lié
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          id, quote_number, total_ht, total_ttc, status, created_at,
          client:crm_contacts (first_name, last_name, company)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur fetch quotes:", error);
      } else {
        setQuotes(data as any || []);
      }
      setIsLoading(false);
    }

    fetchQuotes();
  }, [supabase]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-600 border-gray-200";
      case "sent": return "bg-blue-50 text-blue-600 border-blue-100";
      case "accepted": return "bg-green-50 text-green-600 border-green-100";
      case "rejected": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.client?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.client?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight mb-1">Gestion des Devis</h1>
          <p className="text-sm text-navy/50 m-0">Consultez, envoyez et suivez vos propositions commerciales.</p>
        </div>
        <Link href="/devis/create" className="btn-primary py-3 px-6 rounded-2xl shadow-gold flex items-center gap-2">
          <Plus size={18} strokeWidth={2.5} /> Nouveau Devis
        </Link>
      </div>

      {/* ── FILTRES & RECHERCHE ── */}
      <div className="bg-white p-2 rounded-[1.5rem] border border-navy/5 flex items-center gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
          <input 
            type="text" 
            placeholder="Rechercher par n° de devis ou client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#F8F9FB] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-gold outline-none transition-all"
          />
        </div>
        <button className="p-3 text-navy/50 hover:bg-[#F8F9FB] rounded-xl transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* ── TABLEAU ── */}
      <div className="bg-white rounded-[2rem] border border-navy/5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FB] border-b border-navy/5">
              <th className="px-6 py-5 text-[10px] font-black text-navy/30 uppercase tracking-widest">N° Devis</th>
              <th className="px-6 py-5 text-[10px] font-black text-navy/30 uppercase tracking-widest">Client</th>
              <th className="px-6 py-5 text-[10px] font-black text-navy/30 uppercase tracking-widest">Date</th>
              <th className="px-6 py-5 text-[10px] font-black text-navy/30 uppercase tracking-widest">Montant TTC</th>
              <th className="px-6 py-5 text-[10px] font-black text-navy/30 uppercase tracking-widest">Statut</th>
              <th className="px-6 py-5 text-[10px] font-black text-navy/30 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <Loader2 className="animate-spin text-gold mx-auto" size={32} />
                </td>
              </tr>
            ) : filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-[#F8F9FB]/50 transition-colors group">
                  <td className="px-6 py-5 font-black text-navy text-sm">
                    {quote.quote_number || `DV-${quote.id}`}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-navy">{quote.client?.first_name} {quote.client?.last_name}</span>
                      <span className="text-xs text-navy/40">{quote.client?.company || "Indépendant"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-navy/50">
                      <Calendar size={14} className="text-gold" />
                      {new Date(quote.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-navy text-sm">
                    {quote.total_ttc?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn("px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border", getStatusStyle(quote.status))}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Link href={`/devis/${quote.id}`} className="p-2 text-navy/30 hover:text-gold hover:bg-gold/10 rounded-lg transition-all">
                        <Eye size={18} />
                      </Link>
                      <button className="p-2 text-navy/30 hover:text-navy hover:bg-navy/5 rounded-lg transition-all">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-navy/30">
                    <FileText size={48} strokeWidth={1} />
                    <p className="font-bold">Aucun devis trouvé.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}