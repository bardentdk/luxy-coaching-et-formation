"use client";

import { useState } from "react";
import { 
  Plus, Pencil, Trash2, Search, Check, X, 
  Image as ImageIcon, Loader2, GraduationCap,
  EyeOff, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Mock Data ──
type Formation = {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  is_active: boolean;
  image_url?: string;
  description?: string;
};

const initialFormations: Formation[] = [
  { id: 1, title: "Développement React JS Avancé", category: "Développement Web", level: "Expert", duration: "3 jours", price: 1500, is_active: true },
  { id: 2, title: "Introduction à Next.js 14", category: "Développement Web", level: "Intermédiaire", duration: "2 jours", price: 900, is_active: true },
  { id: 3, title: "Maîtriser le SEO Technique", category: "Marketing Digital", level: "Avancé", duration: "1 jour", price: 500, is_active: false },
];

export default function AdminFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>(initialFormations);
  const [search, setSearch] = useState("");
  
  // États des modales
  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredFormations = formations.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);

  // ── Actions CRUD ──
  const handleOpenForm = (formation: Formation | null = null) => {
    setEditingFormation(formation);
    setShowForm(true);
  };

  const handleToggleStatus = (id: number) => {
    setFormations(formations.map(f => f.id === id ? { ...f, is_active: !f.is_active } : f));
  };

  const handleSaveFormation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const newFormation: Formation = {
      id: editingFormation ? editingFormation.id : Date.now(),
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      level: formData.get("level") as string,
      duration: formData.get("duration") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      description: formData.get("description") as string,
      is_active: editingFormation ? editingFormation.is_active : true,
    };

    await new Promise(resolve => setTimeout(resolve, 800));

    if (editingFormation) {
      setFormations(formations.map(f => f.id === editingFormation.id ? newFormation : f));
    } else {
      setFormations([newFormation, ...formations]);
    }

    setIsSaving(false);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await new Promise(resolve => setTimeout(resolve, 600));
    setFormations(formations.filter(f => f.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-navy tracking-tight mb-1">Programmes de formation</h1>
          <p className="text-sm text-navy/50 m-0">Gérez le catalogue publié sur le site web.</p>
        </div>
        <button onClick={() => handleOpenForm(null)} className="btn-primary py-2.5 px-5 text-sm rounded-xl">
          <Plus size={16} />
          Nouvelle formation
        </button>
      </div>

      {/* ── FILTRES ── */}
      <div className="bg-white rounded-2xl p-4 border border-navy/5 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
          <input 
            type="text" 
            placeholder="Rechercher une formation..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors"
          />
        </div>
      </div>

      {/* ── TABLEAU ── */}
      <div className="bg-white rounded-2xl border border-navy/5 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2]/50 border-b border-navy/5">
                <th className="px-5 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Formation</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Catégorie</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Modalités</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Prix</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em] text-center">Statut</th>
                <th className="px-5 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormations.map(formation => (
                <tr key={formation.id} className={cn("border-b border-navy/5 hover:bg-[#FAF7F2] transition-colors group", !formation.is_active && "bg-gray-50/50")}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0 border border-navy/10 overflow-hidden relative">
                        {formation.image_url ? (
                          <img src={formation.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-navy/20" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy mb-0.5 leading-tight">{formation.title}</div>
                        <div className="text-[11px] font-medium text-navy/40">ID: {formation.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-bold text-navy/60 bg-navy/5 px-2.5 py-1 rounded-md">{formation.category}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-bold text-navy">{formation.level}</div>
                    <div className="text-[11px] text-navy/40">{formation.duration}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-black text-navy">{formatCurrency(formation.price)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button 
                      onClick={() => handleToggleStatus(formation.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors border",
                        formation.is_active 
                          ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" 
                          : "bg-navy/5 text-navy/40 border-navy/10 hover:bg-navy/10"
                      )}
                    >
                      {formation.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {formation.is_active ? 'Publié' : 'Brouillon'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenForm(formation)} className="w-8 h-8 rounded-lg border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-white hover:text-navy hover:border-navy/30 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(formation.id)} className="w-8 h-8 rounded-lg border-2 border-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-500/30 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredFormations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-navy/30">
                    <GraduationCap size={40} className="mx-auto mb-4 opacity-50" />
                    <div className="text-base font-bold text-navy/40 mb-1">Aucune formation trouvée</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL CREATE / EDIT ── */}
      {showForm && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if(e.target === e.currentTarget) setShowForm(false); }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative my-8">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-navy/30 hover:text-navy">
              <X size={24} />
            </button>
            <h2 className="text-xl font-black text-navy mb-6 tracking-tight">
              {editingFormation ? 'Modifier la formation' : 'Nouvelle formation'}
            </h2>

            <form onSubmit={handleSaveFormation} className="flex flex-col gap-5">
              
              {/* Image Upload Zone */}
              <div className="border-2 border-dashed border-navy/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#FAF7F2] hover:bg-white transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-navy/10 flex items-center justify-center mb-3 group-hover:border-gold group-hover:text-gold transition-colors">
                  <ImageIcon size={20} />
                </div>
                <div className="text-sm font-bold text-navy mb-1">Ajouter une image de couverture</div>
                <div className="text-xs text-navy/40">JPG, PNG ou WebP (Max. 2Mo)</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Titre de la formation <span className="text-gold">*</span></label>
                <input name="title" type="text" defaultValue={editingFormation?.title} required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Ex: Maîtriser React en 2026" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Catégorie <span className="text-gold">*</span></label>
                  <select name="category" defaultValue={editingFormation?.category || "Développement Web"} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors">
                    <option value="Développement Web">Développement Web</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Niveau</label>
                  <select name="level" defaultValue={editingFormation?.level || "Débutant"} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors">
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Durée</label>
                  <input name="duration" type="text" defaultValue={editingFormation?.duration} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Ex: 3 jours (21h)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Prix catalogue (€) <span className="text-gold">*</span></label>
                  <input name="price" type="number" step="0.01" min="0" defaultValue={editingFormation?.price} required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Description complète (Programme)</label>
                <textarea name="description" rows={5} defaultValue={editingFormation?.description} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors resize-y" placeholder="Détaillez le programme, les objectifs et les prérequis..." />
              </div>

              <div className="flex gap-3 pt-4 border-t border-navy/10">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 p-3 rounded-xl border-2 border-navy/15 text-navy font-bold text-sm hover:bg-[#FAF7F2] transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="flex-[2] p-3 rounded-xl bg-gold text-navy font-extrabold text-sm hover:bg-gold-light transition-colors flex items-center justify-center gap-2 shadow-gold disabled:opacity-70">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                  {isSaving ? "Enregistrement..." : "Publier la formation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL SUPPRESSION ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="bg-white rounded-[22px] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-navy mb-2">Supprimer ce programme ?</h3>
            <p className="text-sm text-navy/60 mb-6">Cette action est définitive. Les devis commerciaux liés conserveront une trace du produit.</p>
            
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 p-3 rounded-xl border-2 border-navy/10 text-navy font-bold text-sm hover:bg-[#FAF7F2] transition-colors">
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