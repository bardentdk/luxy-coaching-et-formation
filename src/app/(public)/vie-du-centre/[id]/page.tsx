"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Share2, ArrowRight } from "lucide-react";

// ── Mock Data (Censé provenir de Supabase par ID) ──
const article = {
  id: 1,
  title: "Les nouveautés de la certification Qualiopi en 2026",
  category: "Actualité",
  created_at: "12 Avril 2026",
  author: "L'équipe Luxy Formation",
  image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  // Contenu HTML simulé généré par l'éditeur de l'Admin
  content: `
    <p>La certification Qualiopi, sésame indispensable pour les organismes de formation souhaitant bénéficier des fonds publics et mutualisés, évolue cette année. Face aux nouveaux enjeux pédagogiques et technologiques, de nouveaux indicateurs font leur apparition.</p>
    
    <h3>1. L'intégration de l'Intelligence Artificielle</h3>
    <p>Le grand changement de cette année 2026 réside dans la prise en compte des outils d'IA dans les processus d'apprentissage. Les organismes doivent désormais démontrer comment ils encadrent l'utilisation de ces outils par les apprenants.</p>
    
    <blockquote>"L'innovation pédagogique n'est plus une option, c'est un critère d'évaluation à part entière."</blockquote>
    
    <h3>2. Un suivi post-formation renforcé</h3>
    <p>L'indicateur 30 se durcit. Il ne suffit plus de récolter les avis à chaud : un suivi de l'impact de la formation sur l'employabilité à 6 mois devient un standard exigé lors des audits de surveillance.</p>
    
    <h3>Comment nous nous préparons chez Luxy Formation ?</h3>
    <p>Toutes nos formations intègrent déjà ces nouvelles exigences. Notre équipe pédagogique a mis en place de nouveaux outils d'accompagnement garantissant une conformité totale avec le référentiel 2026.</p>
  `
};

export default function ArticleShowPage() {
  return (
    <div className="bg-white min-h-screen pb-24">
      
      {/* ── HEADER DE L'ARTICLE ── */}
      <section className="bg-cream pt-32 pb-16 relative overflow-hidden">
        <div className="dot-grid opacity-40" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link 
            href="/vie-du-centre" 
            className="inline-flex items-center gap-2 text-navy/50 font-bold text-sm mb-10 hover:text-navy hover:translate-x-[-4px] transition-all"
          >
            <ArrowLeft size={16} /> Retour au blog
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-md bg-gold/20 text-gold-dark text-[10px] font-black uppercase tracking-widest border border-gold/30">
              <Tag size={12} /> {article.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy/40 uppercase tracking-wider">
              <Calendar size={14} /> {article.created_at}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-navy tracking-tight leading-tight mb-8">
            {article.title}
          </h1>

          <div className="flex items-center justify-between border-t border-navy/10 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm">
                LF
              </div>
              <div>
                <div className="text-sm font-bold text-navy">Rédigé par</div>
                <div className="text-xs text-navy/50">{article.author}</div>
              </div>
            </div>

            <button className="w-10 h-10 rounded-full border-2 border-navy/10 flex items-center justify-center text-navy/50 hover:bg-navy hover:text-white hover:border-navy transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── IMAGE À LA UNE ── */}
      {article.image_url && (
        <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-20">
          <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-hover border-4 border-white bg-navy/5">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* ── CONTENU DE L'ARTICLE ── */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <div 
          className="article-content prose prose-lg prose-navy max-w-none"
          // Injection sécurisée du contenu riche (provenant de l'éditeur d'administration)
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* CTA Bas d'article */}
        <div className="mt-20 p-8 rounded-3xl bg-navy text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-bl-full" />
          <h3 className="text-2xl font-black mb-3">Prêt à développer vos compétences ?</h3>
          <p className="text-white/70 mb-8 max-w-md mx-auto text-sm">
            Découvrez notre catalogue de formations certifiantes et donnez un nouvel élan à votre carrière avec Luxy Formation.
          </p>
          <Link href="/formations" className="btn-primary py-3 px-8 text-sm inline-flex">
            Voir les formations <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </section>

      {/* CSS global stylisé spécifiquement pour le contenu injecté via dangerouslySetInnerHTML */}
      <style jsx global>{`
        .article-content p {
          color: rgba(13, 27, 42, 0.7);
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
        }
        .article-content h3 {
          color: #0D1B2A;
          font-size: 1.5rem;
          font-weight: 900;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .article-content blockquote {
          border-left: 4px solid #C9A84C;
          background: #FAF7F2;
          padding: 1.5rem 2rem;
          border-radius: 0 1rem 1rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0D1B2A;
          font-style: italic;
          margin: 2.5rem 0;
        }
        .article-content ul, .article-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
          color: rgba(13, 27, 42, 0.7);
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}