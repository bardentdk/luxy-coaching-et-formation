"use client";

import { useState } from "react";
import { 
  Plus, RefreshCw, GraduationCap, Package, 
  Pencil, Trash2, Check, X, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Mock Data ──
type Product = {
  id: number;
  name: string;
  reference: string | null;
  unit_price: number;
  unit: string;
  tax_rate: number;
  description?: string;
  is_active: boolean;
  formation: boolean;
};

const initialProducts: Product[] = [
  { id: 1, name: "Formation Next.js Avancé", reference: "FORM-NEXT", unit_price: 1500, unit: "formation", tax_rate: 20, is_active: true, formation: true },
  { id: 2, name: "Coaching SEO 1h", reference: "COACH-SEO", unit_price: 150, unit: "heure", tax_rate: 20, is_active: true, formation: false },
];

export default function ProductsIndexPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // États des modales
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // États de chargement
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);

  // ── Actions CRUD ──
  const handleOpenForm = (product: Product | null = null) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formData.get("name") as string,
      reference: formData.get("reference") as string || null,
      unit_price: parseFloat(formData.get("unit_price") as string),
      unit: formData.get("unit") as string,
      tax_rate: parseFloat(formData.get("tax_rate") as string) || 0,
      description: formData.get("description") as string,
      is_active: true,
      formation: editingProduct ? editingProduct.formation : false,
    };

    // Simulation réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts([newProduct, ...products]);
    }

    setIsSaving(false);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    // Simulation réseau
    await new Promise(resolve => setTimeout(resolve, 600));
    setProducts(products.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  // ── Synchronisation ──
  const handleSyncFormations = async () => {
    setIsSyncing(true);
    
    // Simulation du temps de traitement réseau Supabase
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newSyncedProduct: Product = {
      id: Date.now(),
      name: "Formation React Bootcamp (Importée)",
      reference: "FORM-REACT-SYNC",
      unit_price: 1990,
      unit: "formation",
      tax_rate: 20,
      is_active: true,
      formation: true
    };

    setProducts(prev => [newSyncedProduct, ...prev]);
    setIsSyncing(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-navy tracking-tight mb-1">Catalogue produits</h1>
          <p className="text-sm text-navy/50 m-0">Produits et formations utilisés dans vos devis</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSyncFormations}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gold/30 bg-gold/10 text-gold-dark font-bold text-sm hover:bg-gold/20 transition-colors disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {isSyncing ? "Synchronisation..." : "Sync formations"}
          </button>
          
          <button onClick={() => handleOpenForm(null)} className="btn-primary py-2.5 px-5 text-sm rounded-xl !bg-navy !text-white hover:!bg-navy-light">
            <Plus size={16} />
            Nouveau produit
          </button>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(product => (
          <div key={product.id} className={cn("bg-white rounded-2xl p-6 border border-navy/5 shadow-sm relative group hover:border-gold/30 transition-all", !product.is_active && "opacity-60")}>
            {product.formation && (
              <div className="absolute top-4 right-4 bg-gold/10 border border-gold/20 text-gold-dark text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.08em]">
                Formation
              </div>
            )}
            
            <div className="w-12 h-12 rounded-[14px] bg-navy/5 flex items-center justify-center mb-4">
              {product.formation ? <GraduationCap size={24} className="text-gold" /> : <Package size={24} className="text-navy/40" />}
            </div>
            
            <div className="text-base font-extrabold text-navy mb-1 leading-tight">{product.name}</div>
            <div className="text-xs text-navy/40 mb-4 font-mono">{product.reference || "—"}</div>
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-xl font-black text-navy tracking-tight">{formatCurrency(product.unit_price)}</span>
                <span className="text-xs text-navy/40 ml-1">/ {product.unit}</span>
              </div>
              {product.tax_rate > 0 && (
                <span className="text-[11px] text-navy/40 bg-[#FAF7F2] px-2.5 py-1 rounded-md font-medium">TVA {product.tax_rate}%</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => handleOpenForm(product)} className="flex-1 py-2.5 rounded-xl border-2 border-navy/10 bg-white text-xs font-bold text-navy/60 hover:bg-cream hover:text-navy transition-colors flex items-center justify-center gap-2">
                <Pencil size={14} /> Modifier
              </button>
              <button onClick={() => setDeleteId(product.id)} className="w-10 h-10 rounded-xl border-2 border-red-500/20 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl border-2 border-dashed border-navy/10 text-navy/30">
            <Package size={40} className="mx-auto mb-4 opacity-50" />
            <div className="text-base font-bold text-navy/40 mb-1">Aucun produit</div>
            <div className="text-sm">Créez des produits ou synchronisez vos formations.</div>
          </div>
        )}
      </div>

      {/* ── MODAL CREATE / EDIT ── */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if(e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative my-8">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-navy/30 hover:text-navy">
              <X size={24} />
            </button>
            <h2 className="text-xl font-black text-navy mb-6 tracking-tight">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Nom <span className="text-gold">*</span></label>
                <input name="name" type="text" defaultValue={editingProduct?.name} required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Ex: Formation Excel avancé" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Référence</label>
                  <input name="reference" type="text" defaultValue={editingProduct?.reference || ''} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" placeholder="REF-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Unité</label>
                  <select name="unit" defaultValue={editingProduct?.unit || "formation"} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors">
                    <option value="formation">Formation</option>
                    <option value="heure">Heure</option>
                    <option value="jour">Jour</option>
                    <option value="personne">Personne</option>
                    <option value="unité">Unité</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Prix unitaire (€) <span className="text-gold">*</span></label>
                  <input name="unit_price" type="number" step="0.01" min="0" defaultValue={editingProduct?.unit_price} required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">TVA (%)</label>
                  <input name="tax_rate" type="number" step="0.1" min="0" max="100" defaultValue={editingProduct?.tax_rate || 20} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Description</label>
                <textarea name="description" rows={3} defaultValue={editingProduct?.description || ''} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors resize-y" placeholder="Description du produit pour le devis..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 p-3 rounded-full border-2 border-navy/15 text-navy font-bold text-sm hover:bg-cream transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="flex-[2] p-3 rounded-full bg-gold text-navy font-extrabold text-sm hover:bg-gold-light transition-colors flex items-center justify-center gap-2 shadow-gold disabled:opacity-70">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL SUPPRESSION ── */}
      {deleteId && (
        <div 
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if(e.target === e.currentTarget) setDeleteId(null); }}
        >
          <div className="bg-white rounded-[22px] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-navy mb-2">Supprimer ce produit ?</h3>
            <p className="text-sm text-navy/60 mb-6">Cette action est définitive et ne peut pas être annulée.</p>
            
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 p-3 rounded-xl border-2 border-navy/10 text-navy font-bold text-sm hover:bg-cream transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} className="flex-1 p-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}