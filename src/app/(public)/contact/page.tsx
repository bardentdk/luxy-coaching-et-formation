"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PublicContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialisation du client Supabase pour le navigateur
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Formatage des données pour la table 'crm_contacts'
    const contactData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      notes: formData.get("message") as string,
      source: "contact_form",
      status: "lead"
    };

    try {
      const { error } = await supabase.from('crm_contacts').insert([contactData]);

      if (error) throw error;

      // Succès : on affiche le message de confirmation et on vide le formulaire
      setIsSuccess(true);
      form.reset();
    } catch (error: any) {
      console.error("Erreur lors de l'envoi :", error);
      setErrorMsg("Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── HERO SECTION ── */}
      <section className="bg-cream pt-32 pb-16 relative overflow-hidden">
        <div className="dot-grid opacity-30" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-gold/20 text-gold-dark text-xs font-black uppercase tracking-widest mb-6">
            Contactez-nous
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-navy tracking-tight mb-6">
            Prêt à propulser votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-dark">Carrière ?</span>
          </h1>
          <p className="text-lg text-navy/60 max-w-2xl mx-auto">
            Une question sur un programme ? Un besoin de formation sur-mesure pour votre entreprise ? Notre équipe pédagogique vous répond sous 24h.
          </p>
        </div>
      </section>

      {/* ── CONTENT SECTION ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-12">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          
          {/* ── INFOS DE CONTACT ── */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-black text-navy mb-4 tracking-tight">Parlons de votre projet</h2>
              <p className="text-navy/60 leading-relaxed">
                Remplissez le formulaire et l'un de nos conseillers experts prendra contact avec vous pour analyser vos besoins et vous proposer la solution la plus adaptée.
              </p>
            </div>

            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-cream border border-navy/5 hover:border-gold/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gold shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy mb-1 uppercase tracking-wider">Email</h3>
                  <a href="mailto:contact@luxyformation.fr" className="text-lg font-bold text-navy hover:text-gold transition-colors">
                    contact@luxyformation.fr
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-3xl bg-cream border border-navy/5 hover:border-gold/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gold shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy mb-1 uppercase tracking-wider">Téléphone</h3>
                  <a href="tel:+33123456789" className="text-lg font-bold text-navy hover:text-gold transition-colors">
                    01 23 45 67 89
                  </a>
                  <div className="text-xs text-navy/40 mt-1 font-medium">Lun-Ven, 9h-18h</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-3xl bg-cream border border-navy/5 hover:border-gold/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gold shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy mb-1 uppercase tracking-wider">Campus</h3>
                  <p className="text-base font-medium text-navy/70 leading-relaxed">
                    123 Avenue de l'Excellence<br />
                    75000 Paris, France
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── FORMULAIRE ── */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-hover border border-navy/5 relative overflow-hidden">
            {/* Décoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-bl-full -z-10" />

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-16 h-full animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-navy mb-3">Demande envoyée !</h3>
                <p className="text-navy/60 mb-8 max-w-sm">
                  Merci de nous avoir contactés. Votre demande a bien été transmise à notre équipe. Nous vous répondrons dans les plus brefs délais.
                </p>
                <button 
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="btn-secondary py-3 px-6"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {errorMsg && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wide">Prénom <span className="text-gold">*</span></label>
                    <input 
                      name="first_name" type="text" required 
                      className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" 
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wide">Nom <span className="text-gold">*</span></label>
                    <input 
                      name="last_name" type="text" required 
                      className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" 
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wide">Email <span className="text-gold">*</span></label>
                    <input 
                      name="email" type="email" required 
                      className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" 
                      placeholder="jean.dupont@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wide">Téléphone</label>
                    <input 
                      name="phone" type="tel" 
                      className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" 
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wide">Entreprise (Optionnel)</label>
                  <input 
                    name="company" type="text" 
                    className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors" 
                    placeholder="Nom de votre société"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wide">Votre message <span className="text-gold">*</span></label>
                  <textarea 
                    name="message" required rows={5}
                    className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-cream focus:bg-white focus:border-gold outline-none transition-colors resize-y" 
                    placeholder="Détaillez votre besoin, la formation visée ou votre projet..."
                  />
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-navy/40 mb-6 leading-relaxed">
                    En soumettant ce formulaire, vous acceptez que les informations saisies soient exploitées dans le cadre de la relation commerciale qui peut en découler. Pour connaître et exercer vos droits, veuillez consulter notre <Link href="/confidentialite" className="underline hover:text-navy font-bold">politique de confidentialité</Link>.
                  </p>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 rounded-xl bg-gold text-navy font-black text-sm hover:bg-gold-light transition-all flex items-center justify-center gap-2 shadow-gold disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</>
                    ) : (
                      <>Envoyer ma demande <Send size={16} strokeWidth={2.5} className="ml-1" /></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}