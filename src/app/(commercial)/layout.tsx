"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, KanbanSquare, Users, FileText, 
  Mail, Settings, LogOut, Bell, Search, Package, Palette, Target, Menu, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Devis", href: "/devis", icon: FileText },
  { name: "Produits & Catalogue", href: "/produits", icon: Package },
  { name: "Mode Focus", href: "/focus", icon: Target }, // <-- Le lien du Zen Mode !
  { name: "Automations", href: "/sequences", icon: Mail },
  { name: "Réglages Facture", href: "/settings/billing", icon: Palette },
];

export default function CommercialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // État pour gérer le pliage de la sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8F9FB] overflow-hidden p-4 gap-4 font-sans">
      
      {/* ── SIDEBAR FLOTTANTE 2026 ── */}
      <aside 
        className={cn(
          "bg-[#0A101D] rounded-[2rem] shadow-2xl flex flex-col relative overflow-hidden shrink-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[88px]" : "w-72"
        )}
      >
        {/* Effet de lueur en arrière-plan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Logo */}
        <div className={cn("p-8 pb-4 shrink-0 relative z-10 flex items-center h-24", isCollapsed ? "justify-center px-0" : "")}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {isCollapsed ? (
              // Version icône quand pliée (L initial)
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-gold transition-transform group-hover:scale-105">
                <img src="https://luxyformation.re/wp-content/uploads/2024/03/cropped-logo-luxy-dore-192x192.png" />
                 {/*<span className="font-black text-xl text-[#0A101D]">L</span>*/}
              </div>
            ) : (
              // Ton logo complet quand dépliée
              <img 
                src="https://luxyformation.re/wp-content/uploads/2024/03/cropped-horizontal_luxy_logo-300x97.png" 
                alt="Luxy CRM" 
                className="w-40 object-contain"
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto z-10 scrollbar-hide">
          {!isCollapsed && (
            <div className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 whitespace-nowrap">
              Espace de travail
            </div>
          )}
          
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "flex items-center rounded-2xl font-bold text-sm transition-all duration-300 relative group",
                  isActive 
                    ? "text-[#0A101D] bg-gold shadow-gold" 
                    : "text-white/50 hover:text-white hover:bg-white/5",
                  isCollapsed ? "justify-center p-3.5" : "px-4 py-3.5 gap-3"
                )}
                title={isCollapsed ? link.name : ""} // Tooltip natif rapide
              >
                <link.icon size={18} className={cn("transition-colors shrink-0", isActive ? "text-[#0A101D]" : "text-white/40 group-hover:text-gold")} />
                
                {/* Texte masqué si plié */}
                {!isCollapsed && <span className="whitespace-nowrap truncate">{link.name}</span>}

                {/* Info-bulle stylisée quand plié */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-[#0A101D] text-white text-xs px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-50 border border-white/10 shadow-xl transition-all duration-200">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profil Utilisateur (Bas de la sidebar) */}
        <div className="p-4 z-10 shrink-0">
          <div className={cn(
            "p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer",
            isCollapsed ? "justify-center" : "px-4 py-3"
          )}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              JD
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">Jean Dupont</div>
                <div className="text-xs text-white/40 truncate">Commercial Senior</div>
              </div>
            )}
          </div>
          
          <button className={cn(
            "w-full mt-2 flex items-center rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-400/10 font-bold text-sm transition-colors",
            isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
          )}
          title={isCollapsed ? "Déconnexion" : ""}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── ZONE DE CONTENU PRINCIPALE ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white rounded-[2rem] shadow-sm border border-navy/5 overflow-hidden">
        
        {/* Header Topbar "Glassmorphism" */}
        <header className="h-20 shrink-0 flex items-center px-8 bg-white/80 backdrop-blur-xl border-b border-navy/5 z-20">
          
          {/* Bouton Toggle Sidebar */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-10 h-10 mr-6 rounded-xl bg-[#F8F9FB] flex items-center justify-center text-navy/50 hover:bg-gold/10 hover:text-gold-dark transition-colors shrink-0"
          >
            {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={20} />}
          </button>

          <div className="relative w-96 hidden md:block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input 
              type="text" 
              placeholder="Rechercher un contact, un deal..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FB] border-none rounded-xl text-sm font-medium text-navy placeholder:text-navy/30 focus:ring-2 focus:ring-gold outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="w-10 h-10 rounded-xl bg-[#F8F9FB] flex items-center justify-center text-navy/50 hover:bg-gold/10 hover:text-gold-dark transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#F8F9FB] flex items-center justify-center text-navy/50 hover:bg-gold/10 hover:text-gold-dark transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Le contenu de tes pages vient s'injecter ici */}
        <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          {children}
        </div>
      </main>

    </div>
  );
}