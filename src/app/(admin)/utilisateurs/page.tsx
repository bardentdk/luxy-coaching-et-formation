"use client";

import { useState } from "react";
import { 
  Plus, Pencil, Trash2, Search, Check, X, 
  Shield, User, Briefcase, GraduationCap, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Mock Data ──
type AppUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

const initialUsers: AppUser[] = [
  { id: 1, name: "Admin Principal", email: "admin@luxyformation.fr", role: "admin", is_active: true, created_at: "01 Jan 2026" },
  { id: 2, name: "Alice Dupont", email: "alice.commerciale@luxyformation.fr", role: "commercial", is_active: true, created_at: "15 Fév 2026" },
  { id: 3, name: "Marc Leroy", email: "marc.formateur@luxyformation.fr", role: "formateur", is_active: true, created_at: "10 Mar 2026" },
  { id: 4, name: "Ancien Employé", email: "ancien@luxyformation.fr", role: "commercial", is_active: false, created_at: "12 Déc 2025" },
];

const roles = [
  { value: "admin", label: "Administrateur", color: "#EF4444", icon: Shield },
  { value: "commercial", label: "Commercial", color: "#F59E0B", icon: Briefcase },
  { value: "formateur", label: "Formateur", color: "#3B82F6", icon: GraduationCap },
  { value: "apprenant", label: "Apprenant", color: "#10B981", icon: User },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  // Modales
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers = users.filter(u => 
    (roleFilter === "" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getRoleBadge = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue) || roles[3];
    const Icon = role.icon;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold" style={{ backgroundColor: `${role.color}15`, color: role.color }}>
        <Icon size={12} /> {role.label}
      </span>
    );
  };

  // ── Actions CRUD ──
  const handleOpenForm = (user: AppUser | null = null) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const newUser: AppUser = {
      id: editingUser ? editingUser.id : Date.now(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      is_active: formData.get("is_active") === "true",
      created_at: editingUser ? editingUser.created_at : "A l'instant",
    };

    await new Promise(resolve => setTimeout(resolve, 800));

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? newUser : u));
    } else {
      setUsers([newUser, ...users]);
    }

    setIsSaving(false);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await new Promise(resolve => setTimeout(resolve, 600));
    setUsers(users.filter(u => u.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-navy tracking-tight mb-1">Utilisateurs & Rôles</h1>
          <p className="text-sm text-navy/50 m-0">Gérez les accès à l'espace Admin, Commercial et Apprenant.</p>
        </div>
        <button onClick={() => handleOpenForm(null)} className="btn-primary py-2.5 px-5 text-sm rounded-xl">
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      {/* ── FILTRES ── */}
      <div className="bg-white rounded-2xl p-4 border border-navy/5 shadow-sm flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
          <input 
            type="text" 
            placeholder="Rechercher un nom, un email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setRoleFilter("")}
            className={cn("px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all", roleFilter === "" ? "bg-navy/10 border-navy/20 text-navy" : "bg-white text-navy/50 border-navy/10 hover:bg-[#FAF7F2]")}
          >
            Tous
          </button>
          {roles.map(r => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={cn("px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all", roleFilter === r.value ? "" : "bg-white text-navy/50 border-navy/10 hover:bg-[#FAF7F2]")}
              style={roleFilter === r.value ? { backgroundColor: `${r.color}18`, color: r.color, borderColor: `${r.color}40` } : {}}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLEAU ── */}
      <div className="bg-white rounded-2xl border border-navy/5 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2]/50 border-b border-navy/5">
                <th className="px-5 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Utilisateur</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Rôle d'accès</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Statut</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Création</th>
                <th className="px-5 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={cn("border-b border-navy/5 hover:bg-[#FAF7F2] transition-colors", !user.is_active && "opacity-60")}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-sm font-black text-gold shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy">{user.name}</div>
                        <div className="text-xs text-navy/40">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", user.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                      {user.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-navy/60 font-medium">
                    {user.created_at}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenForm(user)} className="w-8 h-8 rounded-lg border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-white hover:text-navy hover:border-navy/30 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(user.id)} disabled={user.id === 1} className="w-8 h-8 rounded-lg border-2 border-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-500/30 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-navy/30">
                    <User size={40} className="mx-auto mb-4 opacity-50" />
                    <div className="text-base font-bold text-navy/40 mb-1">Aucun utilisateur trouvé</div>
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
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative my-8">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-navy/30 hover:text-navy">
              <X size={24} />
            </button>
            <h2 className="text-xl font-black text-navy mb-6 tracking-tight">
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Nom complet <span className="text-gold">*</span></label>
                <input name="name" type="text" defaultValue={editingUser?.name} required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Adresse email <span className="text-gold">*</span></label>
                <input name="email" type="email" defaultValue={editingUser?.email} required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Mot de passe temporaire <span className="text-gold">*</span></label>
                  <input name="password" type="password" required className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" />
                  <p className="text-[10px] text-navy/40 mt-1.5">L'utilisateur devra changer son mot de passe à la première connexion.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Rôle d'accès <span className="text-gold">*</span></label>
                  <select name="role" defaultValue={editingUser?.role || "apprenant"} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors">
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">Statut du compte</label>
                  <select name="is_active" defaultValue={editingUser ? String(editingUser.is_active) : "true"} className="w-full p-3 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors">
                    <option value="true">Actif (Autorisé)</option>
                    <option value="false">Désactivé (Bloqué)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-navy/10">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 p-3 rounded-xl border-2 border-navy/15 text-navy font-bold text-sm hover:bg-[#FAF7F2] transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="flex-[2] p-3 rounded-xl bg-gold text-navy font-extrabold text-sm hover:bg-gold-light transition-colors flex items-center justify-center gap-2 shadow-gold disabled:opacity-70">
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
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="bg-white rounded-[22px] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-navy mb-2">Supprimer l'accès ?</h3>
            <p className="text-sm text-navy/60 mb-6">Cet utilisateur n'aura plus du tout accès à ses espaces.</p>
            
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