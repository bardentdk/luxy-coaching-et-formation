export const dynamic = "force-dynamic"; // <-- FORCER LE RECALCUL À CHAQUE FOIS

import { createClient } from "@/lib/supabase/server";

const PATTERNS = {
  none: "",
  cubes: "https://www.transparenttextures.com/patterns/cubes.png",
  diagonal: "https://www.transparenttextures.com/patterns/diagonal-stripes.png",
  graphy: "https://www.transparenttextures.com/patterns/graphy.png",
  dots: "https://www.transparenttextures.com/patterns/carbon-fibre.png"
};

export default async function PrintQuotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();
  
  // On récupère l'utilisateur actuellement connecté (pour les vieux devis)
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Récupérer le devis complet
  const { data: quote } = await supabase
    .from("quotes")
    .select(`*, client:crm_contacts(*), items:quote_items(*)`)
    .eq("id", id)
    .single();

  if (!quote) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-xl font-bold text-red-500 bg-white p-10 rounded-3xl shadow-sm border border-red-100">
        Erreur : Devis introuvable ou accès refusé.
      </h1>
    </div>
  );

  if (quote.items) {
    quote.items.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  // 2. Récupérer les paramètres du créateur (ou de l'utilisateur actuel en secours)
  const targetUserId = quote.created_by || user?.id;
  
  const { data: settings } = await supabase
    .from("billing_settings")
    .select("*")
    .eq("user_id", targetUserId)
    .single();

  const theme = {
    color: settings?.brand_color || "#C9A84C",
    patternUrl: settings?.pattern_id && settings.pattern_id !== 'none' 
      ? `url('${PATTERNS[settings.pattern_id as keyof typeof PATTERNS]}')` 
      : "none",
    companyName: settings?.company_name || "LUXY FORMATION",
    companyAddress: settings?.company_address || "123 Avenue de la Réussite\n75008 Paris\nFrance"
  };

  const totalHT = quote.total_ht || 0;
  const totalTTC = quote.total_ttc || 0;
  const totalTVA = totalTTC - totalHT;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
      <style>{`
        @page { size: A4; margin: 0; }
        body { 
          font-family: 'Poppins', sans-serif !important; 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
          background-color: white;
          color: #0f172a;
        }
        .print-bg { background-image: ${theme.patternUrl}; }
      `}</style>
      
      <div className="w-[210mm] min-h-[297mm] mx-auto relative bg-white overflow-hidden flex flex-col">
        
        {/* --- HEADER DÉCO --- */}
        <div 
          className="absolute top-0 left-0 right-0 h-48 opacity-95 print-bg"
          style={{ backgroundColor: theme.color }}
        />

        <div className="relative z-10 px-14 pt-16 flex-1 flex flex-col">
          
          {/* --- CARTE ENTITÉ ÉMETTRICE --- */}
          <div className="flex justify-between items-start bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-50">
            <div>
              <img width={200} src="https://luxyformation.re/wp-content/uploads/2024/03/cropped-horizontal_luxy_logo-300x97.png" alt="" />
              {/* <h1 className="text-3xl font-black text-navy leading-none">{theme.companyName}</h1> */}
              {/* <h1 className="text-3xl font-black text-navy leading-none">{theme.companyName}</h1> */}
              <div className="w-12 h-1 mt-4 rounded-full" style={{ backgroundColor: theme.color }} />
              <p className="text-[10px] text-gray-500 mt-6 whitespace-pre-line leading-relaxed uppercase font-bold tracking-wider">
                {theme.companyAddress}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-1.5 rounded-full text-white font-black text-[10px] uppercase tracking-[0.2em] mb-4" style={{ backgroundColor: theme.color }}>
                Proposition commerciale
              </span>
              <p className="text-xl font-black text-navy">{quote.reference || quote.quote_number || `DV-${quote.id}`}</p>
              <div className="mt-4 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Émis le {new Date(quote.created_at).toLocaleDateString("fr-FR")}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valable 30 jours</p>
              </div>
            </div>
          </div>

          {/* --- INFO CLIENT --- */}
          <div className="mt-14 flex justify-end">
            <div className="w-[45%] border-l-4 p-8 bg-gray-50/50 rounded-r-3xl" style={{ borderColor: theme.color }}>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Adressé à l'attention de</p>
              <p className="text-xl font-black text-navy leading-tight">{quote.client?.first_name} {quote.client?.last_name}</p>
              {quote.client?.company && <p className="text-sm font-bold text-gray-600 mt-2">{quote.client.company}</p>}
              {quote.client?.email && <p className="text-xs text-gray-500 mt-1">{quote.client.email}</p>}
            </div>
          </div>

          {/* --- TABLEAU DES PRESTATIONS --- */}
          <div className="mt-14 flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-navy">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Désignation</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qté</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">P.U HT</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(quote.items || []).map((item: any, i: number) => {
                  const pu = item.unit_price || 0;
                  const qty = item.quantity || 1;
                  const discount = item.discount_percent || 0;
                  const lineTotal = (pu * qty) * (1 - discount / 100);

                  return (
                    <tr key={i}>
                      <td className="py-7 pr-6">
                        <p className="font-bold text-navy text-sm leading-snug">{item.name || "Prestation"}</p>
                        {item.description && <p className="text-[10px] text-gray-500 mt-2 leading-relaxed max-w-sm">{item.description}</p>}
                        {discount > 0 && <span className="inline-block mt-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded uppercase tracking-wider">Réduction de {discount}% incluse</span>}
                      </td>
                      <td className="py-7 text-center text-sm font-medium text-gray-600">{qty}</td>
                      <td className="py-7 text-right text-sm font-medium text-gray-600">{pu.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                      <td className="py-7 text-right font-black text-navy text-sm">{lineTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* --- BLOC RÉCAPITULATIF --- */}
          <div className="mt-10 flex justify-end">
            <div className="w-[45%] bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-4">
              <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Total HT</span>
                <span className="text-navy">{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">
                <span>TVA (20%)</span>
                <span className="text-navy">{totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black text-navy uppercase tracking-widest">Net à Payer</span>
                <span className="text-2xl font-black" style={{ color: theme.color }}>{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>

          {/* --- FOOTER LÉGAL --- */}
          <div className="mt-16 pt-10 border-t border-gray-100 text-center pb-10">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-loose">
              {theme.companyName} • SIRET 123 456 789 00012 • TVA FR 12 345678901<br />
              Dispensé d'immatriculation au RCS et au RM (Art. L123-1-1 du Code de Commerce)<br />
              Paiement à réception par virement bancaire.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}