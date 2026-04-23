import Link from "next/link";
import { BookOpen, LayoutDashboard, PlayCircle, Award, User, LogOut } from "lucide-react";

export default function ApprenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream/30 overflow-hidden">
      {/* Sidebar Apprenant */}
      <aside className="w-64 bg-navy text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-6 mb-4">
          <span className="font-bold text-xl tracking-tight">
            LUXY<span className="text-gold">LEARNING</span>
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/espace-apprenant" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold text-navy font-bold shadow-gold transition-all">
            <LayoutDashboard size={20} />
            <span className="text-sm">Tableau de bord</span>
          </Link>
          <Link href="/espace-apprenant/formations" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <PlayCircle size={20} />
            <span className="font-medium text-sm">Mes Formations</span>
          </Link>
          <Link href="/espace-apprenant/certificats" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <Award size={20} />
            <span className="font-medium text-sm">Mes Certificats</span>
          </Link>
          <Link href="/espace-apprenant/profil" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all mt-8">
            <User size={20} />
            <span className="font-medium text-sm">Mon Profil</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <LogOut size={20} />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-navy/5 flex items-center justify-between px-6 md:px-10 shrink-0">
          <h2 className="font-bold text-navy">Espace Apprenant</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-navy hidden md:block">Bonjour, Jean</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-navy-light text-gold flex items-center justify-center font-black text-sm shadow-sm">
              JD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}