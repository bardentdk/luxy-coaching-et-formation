"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, KanbanSquare, Users, FileText, 
  Package, Target, Palette, Mail, LogOut 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Devis", href: "/devis", icon: FileText },
  { name: "Produits & Catalogue", href: "/produits", icon: Package },
  { name: "Mode Focus", href: "/focus", icon: Target },
  { name: "Réglages Devis", href: "/settings/billing", icon: Palette },
  { name: "Automations", href: "/sequences", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // Redirection vers la page de connexion
  };

  return (
    <aside className="w-64 bg-[#0A101D] text-white flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl">
      {/* ── LOGO ── */}
      <div className="p-8">
        <h2 className="text-2xl font-black tracking-tight">
          <span className="text-gold">LUXY</span>
          <span className="text-white">CRM</span>
        </h2>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          // Vérifie si on est sur la page courante (pour colorer le bouton en or)
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                  ? "bg-gold text-[#0A101D] shadow-gold" 
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* ── FOOTER / DÉCONNEXION ── */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}