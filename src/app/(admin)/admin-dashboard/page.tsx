"use client";

import { Eye, Users, FileText, GraduationCap, Activity } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

// Initialisation de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// ── Mock Data ──
const stats = {
  views_today: 1245,
  users_total: 48,
  articles_published: 24,
  formations_active: 12,
};

const recentLogs = [
  { id: 1, action: "Connexion", user: "Admin Principal", time: "Il y a 5 min", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, action: "Modification Article", user: "Marc Leroy", time: "Il y a 2 heures", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: 3, action: "Nouveau Devis", user: "Alice Dupont", time: "Il y a 3 heures", color: "text-green-500", bg: "bg-green-500/10" },
];

export default function AdminDashboardPage() {
  // Configuration du Graphique des vues (7 derniers jours)
  const chartData = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [
      {
        fill: true,
        label: "Vues du site",
        data: [800, 950, 1100, 1050, 1300, 850, 1245],
        borderColor: "#C9A84C",
        backgroundColor: "rgba(201, 168, 76, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "#0D1B2A",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0D1B2A",
        titleFont: { family: "Poppins", size: 13 },
        bodyFont: { family: "Poppins", size: 14, weight: 700 as const },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { border: { display: false }, borderDash: [5, 5] },
    },
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-xl font-black text-navy tracking-tight mb-1">Vue d'ensemble</h1>
        <p className="text-sm text-navy/50 m-0">Suivez l'activité globale de la plateforme Luxy Formation.</p>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Vues aujourd'hui", value: stats.views_today, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Utilisateurs", value: stats.users_total, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Articles publiés", value: stats.articles_published, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Formations actives", value: stats.formations_active, icon: GraduationCap, color: "text-green-500", bg: "bg-green-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-navy tracking-tight leading-none mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-xs font-bold text-navy/40 uppercase tracking-[0.05em]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── GRAPHIQUES & LOGS ── */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        
        {/* Graphique des visites */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-navy">Trafic du site (7 derniers jours)</h2>
            <span className="text-xs font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-full">+12% vs semaine préc.</span>
          </div>
          <div className="flex-1 min-h-[300px] relative w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Journal d'activité (Logs) */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-gold" />
            <h2 className="text-base font-extrabold text-navy">Journal d'activité</h2>
          </div>
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-navy/5 rounded-full" />
            {recentLogs.map(log => (
              <div key={log.id} className="flex gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shrink-0 ${log.bg} ${log.color}`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                <div className="pt-1">
                  <div className="text-sm font-bold text-navy">{log.action}</div>
                  <div className="text-xs font-medium text-navy/60">{log.user}</div>
                  <div className="text-[10px] text-navy/40 mt-0.5">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border-2 border-navy/5 text-xs font-bold text-navy/50 hover:bg-cream hover:text-navy transition-colors">
            Voir tout l'historique
          </button>
        </div>
      </div>
    </div>
  );
}