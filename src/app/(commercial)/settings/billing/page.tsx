"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, Palette, Building2, Check } from "lucide-react";

const PATTERNS = [
  { id: "none", name: "Uni (Aucun)", url: "" },
  { id: "cubes", name: "Cubes", url: "https://www.transparenttextures.com/patterns/cubes.png" },
  { id: "diagonal", name: "Lignes Diagonales", url: "https://www.transparenttextures.com/patterns/diagonal-stripes.png" },
  { id: "graphy", name: "Papier Graphique", url: "https://www.transparenttextures.com/patterns/graphy.png" },
  { id: "dots", name: "Points", url: "https://www.transparenttextures.com/patterns/carbon-fibre.png" },
];

export default function BillingSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: "",
    company_address: "",
    brand_color: "#C9A84C",
    pattern_id: "none"
  });

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("billing_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSettings({
          company_name: data.company_name || "",
          company_address: data.company_address || "",
          brand_color: data.brand_color || "#C9A84C",
          pattern_id: data.pattern_id || "none"
        });
      } else {
        // Créer un enregistrement par défaut si inexistant
        await supabase.from("billing_settings").insert([{ user_id: user.id }]);
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("billing_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user?.id);

    if (error) alert("Erreur : " + error.message);
    else alert("Réglages enregistrés avec succès !");
    
    setSaving(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="animate-spin text-gold w-10 h-10" />
      <p className="text-navy/50 font-medium">Chargement de vos préférences...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Paramètres de facturation</h1>
          <p className="text-navy/50">Définissez l'identité visuelle de vos devis et factures.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-3.5 px-8 rounded-2xl shadow-gold flex items-center gap-2 w-full md:w-auto justify-center"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Enregistrer les modifications
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Colonne Gauche : Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Infos Société */}
          <div className="bg-white p-8 rounded-[2rem] border border-navy/5 shadow-sm space-y-5">
            <h3 className="text-xs font-black text-navy/30 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
              <Building2 size={14} className="text-gold" /> Informations de l'émetteur
            </h3>
            <div>
              <label className="block text-[10px] font-black text-navy uppercase tracking-widest mb-2 ml-1">Nom commercial</label>
              <input 
                value={settings.company_name}
                onChange={e => setSettings({...settings, company_name: e.target.value})}
                className="w-full p-4 bg-[#F8F9FB] border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-gold outline-none transition-all shadow-inner"
                placeholder="Ex: LUXY FORMATION"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-navy uppercase tracking-widest mb-2 ml-1">Coordonnées & Mentions Légales</label>
              <textarea 
                rows={5}
                value={settings.company_address}
                onChange={e => setSettings({...settings, company_address: e.target.value})}
                className="w-full p-4 bg-[#F8F9FB] border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-gold outline-none transition-all shadow-inner resize-none"
                placeholder="Adresse, SIRET, TVA, etc."
              />
            </div>
          </div>

          {/* Patterns */}
          <div className="bg-white p-8 rounded-[2rem] border border-navy/5 shadow-sm space-y-5">
            <h3 className="text-xs font-black text-navy/30 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <Palette size={14} className="text-gold" /> Style du papier
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PATTERNS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSettings({...settings, pattern_id: p.id})}
                  className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${
                    settings.pattern_id === p.id 
                    ? "border-gold bg-gold/5" 
                    : "border-navy/5 bg-white hover:border-navy/10 hover:bg-gray-50"
                  }`}
                >
                  <div 
                    className="w-full h-12 rounded-lg border border-navy/5" 
                    style={{ 
                      backgroundColor: settings.brand_color, 
                      backgroundImage: p.url ? `url(${p.url})` : 'none',
                      opacity: settings.pattern_id === p.id ? 1 : 0.6
                    }}
                  />
                  <span className={`text-[10px] font-black uppercase tracking-wider ${settings.pattern_id === p.id ? "text-gold" : "text-navy/40"}`}>
                    {p.name}
                  </span>
                  {settings.pattern_id === p.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-navy shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne Droite : Preview & Couleur */}
        <div className="space-y-6">
          {/* Couleur */}
          <div className="bg-white p-8 rounded-[2rem] border border-navy/5 shadow-sm space-y-6 text-center">
            <h3 className="text-xs font-black text-navy/30 uppercase tracking-[0.2em] mb-4">Couleur d'accent</h3>
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-24 h-24 rounded-[2rem] shadow-2xl flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: settings.brand_color }}
              >
                <input 
                  type="color" 
                  value={settings.brand_color}
                  onChange={e => setSettings({...settings, brand_color: e.target.value})}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer scale-150"
                />
                <Palette size={32} className="text-white mix-blend-overlay opacity-50" />
              </div>
              <p className="text-sm font-black text-navy tracking-widest uppercase">{settings.brand_color}</p>
            </div>
          </div>

          {/* Preview Rendu */}
          <div className="bg-[#0A101D] rounded-[2.5rem] p-10 text-white overflow-hidden relative shadow-2xl h-64 flex flex-col justify-end">
            <div 
              className="absolute inset-0 opacity-30"
              style={{ 
                backgroundColor: settings.brand_color,
                backgroundImage: settings.pattern_id !== 'none' ? `url(${PATTERNS.find(p => p.id === settings.pattern_id)?.url})` : 'none'
              }}
            />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Aperçu du PDF</p>
              <h2 className="text-4xl font-black italic tracking-tighter leading-none">DEVIS<br/>2026</h2>
              <div className="w-12 h-1.5 mt-6 rounded-full" style={{ backgroundColor: settings.brand_color }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}