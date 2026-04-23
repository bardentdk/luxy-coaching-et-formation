"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, User, Building2, Phone, Mail, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CreateContactPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newContact = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      company: formData.get("company") || null,
      job_title: formData.get("job_title") || null,
      status: formData.get("status"),
      source: formData.get("source"),
      notes: formData.get("notes") || null,
    };

    const { data, error } = await supabase
      .from("crm_contacts")
      .insert([newContact])
      .select()
      .single();

    if (error) {
      alert("Erreur lors de la création du contact : " + error.message);
      setIsSubmitting(false);
    } else {
      // Redirection vers la fiche du nouveau contact
      router.push(`/contacts/${data.id}`);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-cream hover:text-navy transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight mb-1">Nouveau Contact</h1>
          <p className="text-sm text-navy/50 m-0">Ajoutez un nouveau prospect ou client au CRM.</p>
        </div>
      </div>

      {/* ── FORMULAIRE ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="bg-white rounded-3xl p-8 border border-navy/5 shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.15em] mb-4">Informations Personnelles</h3>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-2"><User size={14} className="text-gold"/> Prénom <span className="text-gold">*</span></label>
              <input name="first_name" required className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Jean" />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-2"><User size={14} className="text-gold"/> Nom <span className="text-gold">*</span></label>
              <input name="last_name" required className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Dupont" />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-2"><Mail size={14} className="text-gold"/> Email <span className="text-gold">*</span></label>
              <input name="email" type="email" required className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="jean.dupont@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-2"><Phone size={14} className="text-gold"/> Téléphone</label>
              <input name="phone" type="tel" className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="06 12 34 56 78" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-navy/5 shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.15em] mb-4">Informations Professionnelles</h3>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-2"><Building2 size={14} className="text-gold"/> Entreprise</label>
              <input name="company" className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Nom de l'entreprise" />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-2"><Briefcase size={14} className="text-gold"/> Fonction / Poste</label>
              <input name="job_title" className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors" placeholder="Directeur Marketing" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">Statut du contact</label>
              <select name="status" className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors">
                <option value="lead">Lead (Prospect froid)</option>
                <option value="prospect">Prospect qualifié</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">Source d'acquisition</label>
              <select name="source" className="w-full p-3.5 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors">
                <option value="manual">Saisie manuelle</option>
                <option value="contact_form">Formulaire site internet</option>
                <option value="linkedin">Prospection LinkedIn</option>
                <option value="event">Événement / Salon</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-navy/5 shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.15em] mb-4">Notes Internes</h3>
          <textarea 
            name="notes" 
            rows={4} 
            className="w-full p-4 border-2 border-navy/10 rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-gold outline-none transition-colors resize-y" 
            placeholder="Informations supplémentaires sur ce contact..."
          />
        </div>

        {/* ── ACTIONS ── */}
        <div className="flex flex-wrap justify-end gap-3">
          <Link href="/contacts" className="px-6 py-3 rounded-xl border-2 border-navy/10 text-navy font-bold hover:bg-[#FAF7F2] transition-colors">
            Annuler
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-primary px-8 py-3 rounded-xl shadow-gold flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
            Enregistrer le contact
          </button>
        </div>
      </form>
    </div>
  );
}