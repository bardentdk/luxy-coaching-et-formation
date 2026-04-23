import Link from "next/link";
import { LayoutDashboard, GraduationCap, FileText, Users, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F4EFE4]/30 overflow-hidden">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-navy-light text-white flex flex-col hidden md:flex shrink-0 border-r border-navy/10">
        <div className="p-6">
          <span className="font-bold text-xl tracking-tight">
            LUXY<span className="text-gold">ADMIN</span>
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <LayoutDashboard size={20} />
            <span className="font-medium text-sm">Vue d'ensemble</span>
          </Link>
          <Link href="/admin/formations" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <GraduationCap size={20} />
            <span className="font-medium text-sm">Catalogue Formations</span>
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <FileText size={20} />
            <span className="font-medium text-sm">Blog & Vie du centre</span>
          </Link>
          <Link href="/admin/utilisateurs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <Users size={20} />
            <span className="font-medium text-sm">Utilisateurs & Rôles</span>
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
        <header className="h-16 bg-white border-b border-navy/5 flex items-center justify-between px-6 shrink-0">
          <h2 className="font-bold text-navy">Espace Administration</h2>
          <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shadow-sm">
            AD
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}