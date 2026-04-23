"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Redirection vers le dashboard après succès
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Identifiants invalides");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A101D] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* ── EFFETS DÉCORATIFS DE FOND ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[450px] relative z-10"
      >
        {/* ── LOGO & ACCUEIL ── */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center justify-center w-20 h-auto  mb-6"
          >
            {/* <span className="text-[#0A101D] text-4xl font-black italic">L</span> */}
            <img src="https://luxyformation.re/wp-content/uploads/2024/03/cropped-logo-luxy-dore-192x192.png" />

          </motion.div>
          {/* <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Luxy<span className="text-gold italic">CRM</span>
          </h1> */}
          <p className="text-white/40 text-sm font-medium tracking-wide">
            L'excellence commerciale, propulsée par l'intelligence.
          </p>
        </div>

        {/* ── CARTE DE CONNEXION ── */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          {/* Liseré brillant en haut */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Champ Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:border-gold outline-none transition-all placeholder:text-white/10 focus:bg-white/10"
                />
              </div>
            </div>

            {/* Champ Mot de Passe */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  Mot de passe
                </label>
                <a href="#" className="text-[10px] font-black text-gold uppercase tracking-widest hover:underline">
                  Oublié ?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:border-gold outline-none transition-all placeholder:text-white/10 focus:bg-white/10"
                />
              </div>
            </div>

            {/* Message d'erreur */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton de soumission */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-dark text-[#0A101D] font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(201,168,76,0.2)] hover:shadow-[0_10px_30px_rgba(201,168,76,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Se connecter 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── FOOTER DE CONNEXION ── */}
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 text-white/20">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} className="text-gold" />
              Sécurisé par AES-256
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={14} className="text-gold" />
              Luxy Next-Gen
            </div>
          </div>
          
          <p className="text-white/30 text-xs font-medium">
            Pas encore de compte ? <a href="#" className="text-gold font-black hover:underline">Contactez l'administrateur</a>
          </p>
        </div>
      </motion.div>

      {/* Petit copyright flottant en bas à droite */}
      <div className="absolute bottom-6 right-8 hidden md:block">
        <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
          © 2026 Luxy CRM System
        </p>
      </div>
    </div>
  );
}