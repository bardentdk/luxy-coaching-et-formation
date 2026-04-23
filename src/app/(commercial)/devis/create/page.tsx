"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Loader2, User, FileText, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Contact = { id: number; first_name: string; last_name: string; company: string };
type Deal = { id: number; title: string; crm_contact_id: number };
type Product = { id: number; name: string; description: string; unit_price: number; tax_rate: number };

type QuoteItem = {
  product_id: number | null;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number;
};

export default function QuoteCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const initialDealId = searchParams.get("deal_id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedContactId, setSelectedContactId] = useState<number | "">("");
  const [selectedDealId, setSelectedDealId] = useState<number | "">(initialDealId ? parseInt(initialDealId) : "");

  const [items, setItems] = useState<QuoteItem[]>([
    { product_id: null, name: "", description: "", quantity: 1, unit_price: 0, tax_rate: 20, discount_percent: 0 }
  ]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      const [contactsRes, dealsRes, productsRes] = await Promise.all([
        supabase.from("crm_contacts").select("id, first_name, last_name, company"),
        // Plus de .is("deleted_at", null) ici !
        supabase.from("deals").select("id, title, crm_contact_id"),
        supabase.from("commercial_products").select("id, name, description, unit_price, tax_rate")
      ]);

      if (contactsRes.data) setContacts(contactsRes.data);
      if (dealsRes.data) setDeals(dealsRes.data);
      if (productsRes.data) setProducts(productsRes.data);

      // Pré-sélectionner le contact si un deal_id est passé dans l'URL
      if (initialDealId && dealsRes.data) {
        const deal = dealsRes.data.find(d => d.id.toString() === initialDealId);
        if (deal && deal.crm_contact_id) {
          setSelectedContactId(deal.crm_contact_id);
        }
      }
      
      setIsLoading(false);
    }
    fetchData();
  }, [supabase, initialDealId]);

  // ── CALCULS ──
  const totals = items.reduce((acc, item) => {
    const prixRemise = item.unit_price * (1 - item.discount_percent / 100);
    const ht = prixRemise * item.quantity;
    const tva = ht * (item.tax_rate / 100);
    return {
      ht: acc.ht + ht,
      tva: acc.tva + tva,
      ttc: acc.ttc + ht + tva
    };
  }, { ht: 0, tva: 0, ttc: 0 });

  // ── ACTIONS ──
  const handleAddItem = () => {
    setItems([...items, { product_id: null, name: "", description: "", quantity: 1, unit_price: 0, tax_rate: 20, discount_percent: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    
    // Si on sélectionne un produit du catalogue, on auto-remplit les champs
    if (field === "product_id" && value !== "") {
      const product = products.find(p => p.id.toString() === value.toString());
      if (product) {
        newItems[index] = {
          ...newItems[index],
          product_id: product.id,
          name: product.name,
          description: product.description || "",
          unit_price: product.unit_price,
          tax_rate: product.tax_rate,
        };
        setItems(newItems);
        return;
      }
    }

    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) return alert("Veuillez sélectionner un client.");
    if (items.length === 0) return alert("Veuillez ajouter au moins une ligne au devis.");
    
    setIsSubmitting(true);

    try {
      // 1. Récupérer l'utilisateur connecté pour le champ created_by
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Créer l'en-tête du devis
      // On génère une référence unique (ex: DEV-2026-8492)
      const uniqueRef = `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert([{
          reference: uniqueRef,      // <-- AJOUT ICI
          quote_number: uniqueRef,   // <-- AJOUT ICI (au cas où)
          crm_contact_id: selectedContactId,
          deal_id: selectedDealId || null,
          total_ht: totals.ht,
          total_ttc: totals.ttc,
          status: "draft",
          created_by: user?.id || null
        }])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // 3. Préparer et insérer les lignes de devis
      const quoteItemsToInsert = items.map((item, index) => ({
        quote_id: quote.id,
        product_id: item.product_id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        discount_percent: item.discount_percent,
        sort_order: index // Assure l'ordre d'affichage
      }));

      const { error: itemsError } = await supabase.from("quote_items").insert(quoteItemsToInsert);
      
      if (itemsError) throw itemsError;

      // 4. Succès et redirection
      router.push(`/devis/${quote.id}`);
      
    } catch (error: any) {
      console.error("DEBUG DEVIS ERROR:", error);
      alert("Erreur de création : " + (error.message || "Erreur inconnue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold w-8 h-8" /></div>;

  const filteredDeals = deals.filter(d => selectedContactId ? d.crm_contact_id.toString() === selectedContactId.toString() : true);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-navy/5 shadow-sm flex items-center justify-center text-navy/50 hover:text-navy hover:border-gold transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight mb-1">Nouveau Devis</h1>
          <p className="text-sm text-navy/50 m-0">Créez une proposition commerciale pour votre client.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* ── CLIENT & OPPORTUNITÉ ── */}
        <div className="bg-white rounded-[2rem] p-8 border border-navy/5 shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <User size={14} /> Informations Générales
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-navy mb-2">Client concerné <span className="text-gold">*</span></label>
              <select 
                required
                value={selectedContactId}
                onChange={e => {
                  setSelectedContactId(e.target.value);
                  setSelectedDealId(""); // Reset le deal si on change de client
                }}
                className="w-full p-3.5 border-2 border-navy/5 rounded-xl text-sm font-medium bg-[#F8F9FB] focus:bg-white focus:border-gold outline-none transition-all"
              >
                <option value="">-- Sélectionner un client --</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name} {c.company ? `(${c.company})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-2">Opportunité liée (Optionnel)</label>
              <select 
                value={selectedDealId}
                onChange={e => setSelectedDealId(e.target.value)}
                disabled={!selectedContactId}
                className="w-full p-3.5 border-2 border-navy/5 rounded-xl text-sm font-medium bg-[#F8F9FB] focus:bg-white focus:border-gold outline-none transition-all disabled:opacity-50"
              >
                <option value="">-- Sélectionner un deal --</option>
                {filteredDeals.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── LIGNES DE PRODUITS ── */}
        <div className="bg-white rounded-[2rem] p-8 border border-navy/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.15em] flex items-center gap-2">
              <Briefcase size={14} /> Produits & Services
            </h3>
            <button type="button" onClick={handleAddItem} className="text-xs font-bold text-gold bg-gold/10 hover:bg-gold hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <Plus size={14} /> Ajouter une ligne
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-[#F8F9FB] rounded-2xl border border-navy/5 relative group">
                
                {/* Suppression Ligne */}
                {items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(index)} className="absolute -left-3 -top-3 w-8 h-8 bg-white border border-red-100 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm z-10">
                    <Trash2 size={14} />
                  </button>
                )}

                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <select 
                        value={item.product_id || ""}
                        onChange={e => handleItemChange(index, "product_id", e.target.value)}
                        className="w-full p-3 border-2 border-transparent bg-white rounded-xl text-sm mb-2 focus:border-gold outline-none shadow-sm"
                      >
                        <option value="">-- Produit libre ou Catalogue --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({(p.unit_price).toFixed(2)}€)</option>)}
                      </select>
                      <input 
                        required placeholder="Nom du produit / service"
                        value={item.name} onChange={e => handleItemChange(index, "name", e.target.value)}
                        className="w-full p-3 border-2 border-transparent bg-white rounded-xl text-sm font-bold focus:border-gold outline-none shadow-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-navy/40 mb-1">Qté</label>
                      <input type="number" min="1" required value={item.quantity} onChange={e => handleItemChange(index, "quantity", parseFloat(e.target.value))} className="w-full p-3 border-2 border-transparent bg-white rounded-xl text-sm font-bold focus:border-gold outline-none shadow-sm text-center" />
                    </div>
                    <div className="w-32">
                      <label className="block text-[10px] font-bold text-navy/40 mb-1">Prix Unitaire HT</label>
                      <input type="number" step="0.01" required value={item.unit_price} onChange={e => handleItemChange(index, "unit_price", parseFloat(e.target.value))} className="w-full p-3 border-2 border-transparent bg-white rounded-xl text-sm font-bold focus:border-gold outline-none shadow-sm" />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-navy/40 mb-1">TVA (%)</label>
                      <select value={item.tax_rate} onChange={e => handleItemChange(index, "tax_rate", parseFloat(e.target.value))} className="w-full p-3 border-2 border-transparent bg-white rounded-xl text-sm font-bold focus:border-gold outline-none shadow-sm">
                        <option value="20">20%</option>
                        <option value="10">10%</option>
                        <option value="5.5">5.5%</option>
                        <option value="0">0%</option>
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-navy/40 mb-1">Remise (%)</label>
                      <input type="number" step="0.1" min="0" max="100" value={item.discount_percent} onChange={e => handleItemChange(index, "discount_percent", parseFloat(e.target.value) || 0)} className="w-full p-3 border-2 border-transparent bg-white rounded-xl text-sm font-bold focus:border-gold outline-none shadow-sm text-center text-amber-600" />
                    </div>
                  </div>
                  <textarea 
                    placeholder="Description détaillée du produit/service..."
                    rows={2} value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)}
                    className="w-full p-3 border-2 border-transparent bg-white rounded-xl text-sm focus:border-gold outline-none shadow-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RÉCAPITULATIF TOTAL ── */}
        <div className="flex justify-end">
          <div className="bg-[#0A101D] text-white rounded-[2rem] p-8 w-full md:w-96 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60 font-medium">Total HT</span>
                <span className="font-bold">{totals.ht.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                <span className="text-white/60 font-medium">TVA</span>
                <span className="font-bold">{totals.tva.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-medium text-white/80">Total TTC</span>
                <span className="text-2xl font-black text-gold">{totals.ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full mt-8 bg-gold hover:bg-gold-dark text-[#0A101D] font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Créer le devis
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}