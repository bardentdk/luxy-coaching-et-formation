"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, Search, Download, Eye, Pencil, FileText, 
  Globe, Upload, Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock Data ──
const mockContacts = [
  { id: 1, full_name: "Jean Dupont", initials: "JD", email: "jean@techcorp.fr", company: "TechCorp", status: "lead", status_label: "Lead", status_color: "#6366F1", source: "contact_form", deals_count: 1, last_contacted_at: "Hier" },
  { id: 2, full_name: "Marie Blanc", initials: "MB", email: "marie@webagency.com", company: "Web Agency", status: "client", status_label: "Client", status_color: "#22C55E", source: "manual", deals_count: 3, last_contacted_at: "Il y a 3h" },
  { id: 3, full_name: "Paul Martin", initials: "PM", email: "paul@startup.io", company: "Startup.io", status: "prospect", status_label: "Prospect", status_color: "#F59E0B", source: "import", deals_count: 0, last_contacted_at: "Jamais" },
];

const statuses = [
  { value: "", label: "Tous", color: "#0D1B2A" },
  { value: "lead", label: "Lead", color: "#6366F1" },
  { value: "prospect", label: "Prospect", color: "#F59E0B" },
  { value: "client", label: "Client", color: "#22C55E" },
  { value: "lost", label: "Perdu", color: "#EF4444" },
];

export default function ContactsIndexPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const pendingLeads = 3;

  // Filtrage local pour la démo (À remplacer par la requête DB)
  const filteredContacts = mockContacts.filter(c => 
    (statusFilter === "" || c.status === statusFilter) &&
    (search === "" || c.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const getSourceLabel = (source: string) => {
    switch(source) {
      case "manual": return <span className="flex items-center gap-1.5"><Pencil size={12} /> Manuel</span>;
      case "contact_form": return <span className="flex items-center gap-1.5"><Globe size={12} /> Formulaire</span>;
      case "import": return <span className="flex items-center gap-1.5"><Upload size={12} /> Import</span>;
      default: return source;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-navy tracking-tight mb-1">Contacts CRM</h1>
          <p className="text-sm text-navy/50 m-0">{filteredContacts.length} contact{filteredContacts.length > 1 ? "s" : ""} au total</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {pendingLeads > 0 && (
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gold/30 bg-gold/10 text-gold-dark font-bold text-sm hover:bg-gold/20 transition-colors">
              <Download size={16} />
              Importer {pendingLeads} lead{pendingLeads > 1 ? "s" : ""}
            </button>
          )}
          <Link href="/contacts/create" className="btn-primary py-2.5 px-5 text-sm rounded-xl !bg-navy !text-white hover:!bg-navy-light shadow-md">
            <Plus size={16} />
            Nouveau contact
          </Link>
        </div>
      </div>

      {/* ── FILTRES ── */}
      <div className="bg-white rounded-2xl p-4 border border-navy/5 shadow-sm flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
          <input 
            type="text" 
            placeholder="Rechercher un contact..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all",
                statusFilter === s.value ? "" : "bg-white text-navy/50 border-navy/10 hover:bg-cream"
              )}
              style={statusFilter === s.value ? { backgroundColor: `${s.color}18`, color: s.color, borderColor: `${s.color}40` } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLEAU ── */}
      <div className="bg-white rounded-2xl border border-navy/5 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/50 border-b border-navy/5">
                <th className="px-5 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Contact</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Entreprise</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Statut</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Source</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Deals</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em]">Dernier contact</th>
                <th className="px-4 py-4 text-[11px] font-bold text-navy/40 uppercase tracking-[0.08em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="border-b border-navy/5 hover:bg-[#FAFAF8] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-gold">{contact.initials}</span>
                        </div>
                        <div>
                          <Link href={`/contacts/${contact.id}`} className="text-sm font-bold text-navy group-hover:text-gold transition-colors block">
                            {contact.full_name}
                          </Link>
                          <div className="text-xs text-navy/40">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-navy/60 font-medium">{contact.company || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold" style={{ backgroundColor: `${contact.status_color}18`, color: contact.status_color }}>
                        {contact.status_label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-navy/50 font-medium">
                      {getSourceLabel(contact.source)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-navy">{contact.deals_count}</td>
                    <td className="px-4 py-3.5 text-xs text-navy/50 font-medium">{contact.last_contacted_at}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/contacts/${contact.id}`} className="w-8 h-8 rounded-lg border-2 border-navy/10 flex items-center justify-center text-navy/40 hover:bg-cream hover:text-navy transition-colors">
                          <Eye size={14} />
                        </Link>
                        <Link href={`/contacts/${contact.id}/edit`} className="w-8 h-8 rounded-lg border-2 border-navy/10 flex items-center justify-center text-navy/40 hover:bg-cream hover:text-navy transition-colors">
                          <Pencil size={14} />
                        </Link>
                        <Link href={`/devis/create?contact_id=${contact.id}`} className="w-8 h-8 rounded-lg border-2 border-gold/30 bg-gold/10 flex items-center justify-center text-gold-dark hover:bg-gold/20 transition-colors">
                          <FileText size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Users size={40} className="mx-auto text-navy/15 mb-4" />
                    <div className="text-base font-bold text-navy/40 mb-1">Aucun contact trouvé</div>
                    <div className="text-sm text-navy/30">Modifiez vos filtres ou créez un nouveau contact.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}