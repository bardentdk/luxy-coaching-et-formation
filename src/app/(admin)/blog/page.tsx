"use client";

import { useState } from "react";
import { 
  Plus, Pencil, Trash2, Search, Check, X, 
  Image as ImageIcon, Loader2, FileText,
  EyeOff, Eye, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Mock Data ──
type Article = {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content?: string;
  is_published: boolean;
  image_url?: string;
  views: number;
  created_at: string;
};

const initialArticles: Article[] = [
  { id: 1, title: "Les nouveautés de la certification Qualiopi en 2026", category: "Actualité", excerpt: "Découvrez ce qui change cette année...", is_published: true, views: 1240, created_at: "12 Avril 2026" },
  { id: 2, title: "Pourquoi se former à Next.js aujourd'hui ?", category: "Développement", excerpt: "Le framework React continue de dominer le marché.", is_published: true, views: 856, created_at: "05 Avril 2026" },
  { id: 3, title: "Retour sur notre dernière session de coaching", category: "Vie du centre", excerpt: "Une journée riche en émotions et en apprentissage.", is_published: false, views: 0, created_at: "Aujourd'hui" },
];

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  
  // États des modales
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Actions CRUD ──
  const handleOpenForm = (article: Article | null = null) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleToggleStatus = (id: number) => {
    setArticles(articles.map(a => a.id === id ? { ...a, is_published: !a.is_published } : a));
  };

  const handleSaveArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const newArticle: Article = {
      id: editingArticle ? editingArticle.id : Date.now(),
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      is_published: editingArticle ? editingArticle.is_published : true,
      views: editingArticle ? editingArticle.views : 0,
      created_at: editingArticle ? editingArticle.created_at : "A l'instant",
    };

    // Simulation réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    if (editingArticle) {
      setArticles(articles.map(a => a.id === editingArticle.id ? newArticle : a));
    } else {
      setArticles([newArticle, ...articles]);
    }

    setIsSaving(false);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await new Promise(resolve => setTimeout(resolve, 600));
    setArticles(articles.filter(a => a.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-navy tracking-tight mb-1">Articles & Actualités</h1>
          <p className="text-sm text-navy/50 m-0">Gérez le contenu du blog "La vie du centre".</p>
        </div>
        <button onClick={() => handleOpenForm(null)} className="btn-primary py-2.5 px-5 text-sm rounded-xl">
          <Plus size={16} />
          Nouvel article
        </button>
      </div>

      {/* ── FILTRES ── */}
      <div className="bg-white rounded-2xl p-4 border border-navy/5 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
          <input 
            type="text" 
            placeholder="Rechercher un article..." 
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
                <th className="px-5 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Article</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Catégorie</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Performances</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em] text-center">Statut</th>
                <th className="px-5 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map(article => (
                <tr key={article.id} className={cn("border-b border-navy/5 hover:bg-[#FAF7F2] transition-colors group", !article.is_published && "bg-gray-50/50")}>
                  <td className="px-5 py-3.5 max-w-[300px]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0 border border-navy/10 overflow-hidden relative">
                        {article.image_url ? (
                          <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-navy/20" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-navy mb-0.5 leading-tight truncate">{article.title}</div>
                        <div className="text-[11px] font-medium text-navy/40 truncate flex items-center gap-1">
                          <Calendar size={12} /> {article.created_at}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-bold text-navy/60 bg-navy/5 px-2.5 py-1 rounded-md">{article.category}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-black text-navy">{article.views.toLocaleString()}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-navy/40">Vues</div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button 
                      onClick={() => handleToggleStatus(article.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors border",
                        article.is_published 
                          ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" 
                          : "bg-navy/5 text-navy/40 border-navy/10 hover:bg-navy/10"
                      )}
                    >
                      {article.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {article.is_published ? 'Publié' : 'Brouillon'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenForm(article)} className="w-8 h-8 rounded-lg border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-white hover:text-navy hover:border-navy/30 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(article.id)} className="w-8 h-8 rounded-lg border-2 border-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-500/30 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-navy/30">
                    <FileText size={40} className="mx-auto mb-4 opacity-50" />
                    <div className="text-base font-bold text-navy/40 mb-1">Aucun article trouvé</div>
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
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl relative my-8">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-navy/30 hover:text-navy">
              <X size={24} />
            </button>
            <h2 className="text-xl font-black text-navy mb-6 tracking-tight">
              {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
            </h2>

            <form onSubmit={handleSaveArticle} className="flex flex-col gap-5">
              
              {/* Image Upload Zone */}
              <div className="border-2 border-dashed border-navy/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#FAF7F2] hover:bg-white transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-navy/10 flex items-center justify-center mb-3 group-hover:border-gold group-hover:text-gold transition-colors">
                  <ImageIcon size={20} />
                </div>
                <div className="text-sm font-bold text-navy mb-1">Image à la une</div>
                <div className="text-xs text-navy/40">Format recommandé : 1200x630px</div>
              </div>

              <div className="grid grid-cols-[2fr_1fr] gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Titre de l'article <span className="text-gold">*</span></label>
                  <input name="title" type="text" defaultValue={editingArticle?.title} required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Titre accrocheur..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Catégorie <span className="text-gold">*</span></label>
                  <select name="category" defaultValue={editingArticle?.category || "Actualité"} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors">
                    <option value="Actualité">Actualité</option>
                    <option value="Développement">Développement</option>
                    <option value="Vie du centre">Vie du centre</option>
                    <option value="Conseils Pro">Conseils Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Extrait (Meta description) <span className="text-gold">*</span></label>
                <textarea name="excerpt" rows={2} required defaultValue={editingArticle?.excerpt} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors resize-y" placeholder="Court résumé de 2 phrases pour les cartes et le SEO..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Contenu principal (Markdown ou HTML)</label>
                <textarea name="content" rows={10} defaultValue={editingArticle?.content} className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors resize-y font-mono" placeholder="Rédigez votre article ici..." />
              </div>

              <div className="flex gap-3 pt-4 border-t border-navy/10">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 p-3 rounded-xl border-2 border-navy/15 text-navy font-bold text-sm hover:bg-[#FAF7F2] transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="flex-[2] p-3 rounded-xl bg-gold text-navy font-extrabold text-sm hover:bg-gold-light transition-colors flex items-center justify-center gap-2 shadow-gold disabled:opacity-70">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                  {isSaving ? "Enregistrement..." : "Enregistrer l'article"}
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
            <h3 className="text-xl font-black text-navy mb-2">Supprimer cet article ?</h3>
            <p className="text-sm text-navy/60 mb-6">Cette action est définitive. L'article ne sera plus visible sur le site public.</p>
            
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