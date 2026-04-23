"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, Send, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function QuoteShowPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // État pour le bouton d'envoi

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, supabase]);

  async function fetchQuote() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select(`
        *,
        client:crm_contacts(*),
        items:quote_items(*)
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      data.items = data.items.sort((a: any, b: any) => a.sort_order - b.sort_order);
      setQuote(data);
    }
    setIsLoading(false);
  }

  // Fonction pour envoyer l'email
  const handleSendEmail = async () => {
    if (!quote?.client?.email) {
      alert("Ce client n'a pas d'adresse email renseignée sur sa fiche.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/email/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.id })
      });

      const result = await response.json();

      if (response.ok) {
        alert("Le devis a été envoyé avec succès !");
        // On recharge les données pour mettre à jour le statut ("sent")
        await fetchQuote(); 
      } else {
        alert("Erreur lors de l'envoi : " + result.error);
      }
    } catch (error) {
      alert("Une erreur inattendue est survenue.");
    } finally {
      setIsSending(false);
    }
  };

  // Fonction pour marquer comme accepté
  const handleMarkAsAccepted = async () => {
    setIsLoading(true);
    await supabase.from("quotes").update({ status: 'accepted' }).eq('id', quote.id);
    await fetchQuote();
  };

  if (isLoading && !quote) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold w-8 h-8" /></div>;
  if (!quote) return <div className="text-center py-20 text-navy/50 font-bold">Devis introuvable.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-12 items-start">
      
      {/* ── APERÇU WEB DU DEVIS ── */}
      <div className="flex-[2] bg-white rounded-[2rem] p-8 border border-navy/5 shadow-sm space-y-8 w-full">
        
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-[#F8F9FB] flex items-center justify-center text-navy/50 hover:text-navy hover:bg-gold/10 transition-all">
            <ArrowLeft size={18} />
          </button>
          
          <div className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border ${
            quote.status === 'draft' ? 'bg-gray-100 text-gray-500 border-gray-200' :
            quote.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-200' :
            quote.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-200' :
            'bg-gold/10 text-gold-dark border-gold/20'
          }`}>
            {quote.status === 'draft' ? 'Brouillon' : 
             quote.status === 'sent' ? 'Envoyé' : 
             quote.status === 'accepted' ? 'Accepté' : quote.status}
          </div>
        </div>

        <div className="flex justify-between items-end border-b border-navy/5 pb-8">
          <div>
            <h1 className="text-3xl font-black text-navy mb-2">Devis N° {quote.reference || quote.quote_number || `DEV-${quote.id}`}</h1>
            <p className="text-sm text-navy/50 font-medium">Créé le {new Date(quote.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-navy mb-1">Pour :</p>
            <p className="text-lg font-black text-navy">{quote.client?.first_name} {quote.client?.last_name}</p>
            <p className="text-sm text-navy/50">{quote.client?.company}</p>
          </div>
        </div>

        <div className="space-y-4">
          {quote.items.map((item: any, i: number) => {
             const pu = item.unit_price || 0;
             const qty = item.quantity || 1;
             const discount = item.discount_percent || 0;
             const lineTotal = (pu * qty) * (1 - discount / 100);

             return (
              <div key={i} className="flex justify-between items-center p-4 bg-[#F8F9FB] rounded-2xl border border-navy/5">
                <div>
                  <h4 className="font-bold text-navy">{item.name}</h4>
                  <p className="text-xs text-navy/50 mt-1">{qty} x {pu.toFixed(2)}€ {discount > 0 ? `(-${discount}%)` : ""}</p>
                </div>
                <div className="font-black text-navy">{lineTotal.toFixed(2)} €</div>
              </div>
             )
          })}
        </div>

        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-navy/60 font-medium">
              <span>Total HT</span>
              <span>{(quote.total_ht || 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-navy/60 font-medium border-b border-navy/5 pb-2">
              <span>TVA</span>
              <span>{((quote.total_ttc || 0) - (quote.total_ht || 0)).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-black text-navy pt-2">
              <span>Total TTC</span>
              <span className="text-gold">{(quote.total_ttc || 0).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANNEAU D'ACTIONS ── */}
      <div className="flex-1 w-full flex flex-col gap-4 sticky top-6">
        
        <div className="bg-[#0A101D] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-sm font-black text-white/50 uppercase tracking-widest mb-6 relative z-10">Actions</h3>
          
          <div className="space-y-3 relative z-10">
            {/* BOUTON ENVOYER PAR EMAIL */}
            <button 
              onClick={handleSendEmail}
              disabled={isSending}
              className="w-full bg-gold hover:bg-gold-dark text-[#0A101D] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
              {isSending ? "Envoi en cours..." : "Envoyer par email"}
            </button>
            
            {/* BOUTON TÉLÉCHARGEMENT PDF */}
            <a
              href={`/api/pdf?id=${quote.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
            >
              <Download size={18} /> Télécharger le PDF (HD)
            </a>

            <button 
              onClick={() => window.open(`/print/devis/${quote.id}`, '_blank')}
              className="w-full bg-transparent hover:bg-white/5 text-white/60 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Printer size={18} /> Aperçu / Imprimer
            </button>
          </div>
        </div>

        {/* STATUT DU DEVIS */}
        {quote.status !== 'accepted' && (
          <div className="bg-white rounded-[2rem] p-6 border border-navy/5 shadow-sm">
            <h3 className="text-xs font-black text-navy/30 uppercase tracking-[0.15em] mb-4">Statut du devis</h3>
            <button 
              onClick={handleMarkAsAccepted}
              className="w-full flex items-center justify-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
            >
              <CheckCircle size={20} className="text-green-500" />
              <span className="font-bold text-sm text-green-700">Marquer comme accepté</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}