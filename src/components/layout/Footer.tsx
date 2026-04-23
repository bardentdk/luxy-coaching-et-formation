import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-12">
        {/* Brand Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
              <span className="text-navy font-bold">L</span>
            </div>
            <span className="font-bold text-xl uppercase">Luxy Formation</span>
          </div>
          <p className="text-white/60 text-sm max-w-xs">
            L'excellence de la formation professionnelle pour propulser votre carrière vers de nouveaux sommets.
          </p>
          <div className="flex gap-4">
            {[ExternalLink, ExternalLink, ExternalLink].map((Icon, i) => (
              <Link key={i} href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all">
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-bold text-gold mb-6">Navigation</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
            <li><Link href="/formations" className="hover:text-white transition-colors">Nos formations</Link></li>
            <li><Link href="/vie-du-centre" className="hover:text-white transition-colors">La vie du centre</Link></li>
            <li><Link href="/avis" className="hover:text-white transition-colors">Avis clients</Link></li>
          </ul>
        </div>

        {/* Légal */}
        <div>
          <h4 className="font-bold text-gold mb-6">Informations</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
            <li><Link href="/cgv" className="hover:text-white transition-colors">CGV / CGU</Link></li>
            <li><Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
            <li><Link href="/cookies" className="hover:text-white transition-colors">Gestion des cookies</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="font-bold text-gold mb-6">Contact</h4>
          <div className="flex items-start gap-3 text-sm text-white/70">
            <MapPin size={18} className="text-gold shrink-0" />
            <p>123 Avenue de l'Excellence, 75000 Paris</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Phone size={18} className="text-gold" />
            <p>01 23 45 67 89</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Mail size={18} className="text-gold" />
            <p>contact@luxyformation.fr</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
        <p>© {currentYear} Luxy Formation. Tous droits réservés.</p>
        <p>Développé avec passion pour l'excellence.</p>
      </div>
    </footer>
  );
}