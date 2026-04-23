import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

// Initialisation de Resend avec ta clé API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { quoteId } = await request.json();
    if (!quoteId) return NextResponse.json({ error: "ID du devis manquant" }, { status: 400 });

    const supabase = await createClient();

    // 1. Récupérer le devis et le client
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(`*, client:crm_contacts(*)`)
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    if (!quote.client?.email) {
      return NextResponse.json({ error: "Le client n'a pas d'adresse email enregistrée." }, { status: 400 });
    }

    // 2. Récupérer les paramètres de l'entreprise (pour le nom de l'expéditeur et la couleur)
    const { data: settings } = await supabase
      .from("billing_settings")
      .select("company_name, brand_color")
      .eq("user_id", quote.created_by)
      .single();

    const companyName = settings?.company_name || "Luxy Coaching & Formation - Centre de formation professionnelle à La Réunion";
    const brandColor = settings?.brand_color || "#C9A84C";

    // Le lien vers la version imprimable du devis
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const quoteUrl = `${baseUrl}/print/devis/${quote.id}`;

    // 3. L'email HTML (Très beau et responsive)
    const htmlEmail = `
      <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: ${brandColor};">Bonjour ${quote.client.first_name},</h2>
        <p>Suite à nos échanges, veuillez trouver ci-joint le lien pour consulter notre proposition commerciale (Devis n° <strong>${quote.reference || quote.quote_number || `DV-${quote.id}`}</strong>).</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${quoteUrl}" style="background-color: ${brandColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Consulter le devis en ligne
          </a>
        </div>
        
        <div style="background-color: #f8f9fb; padding: 15px; border-radius: 8px; font-size: 14px;">
          <p style="margin: 0 0 10px 0;"><strong>Montant total :</strong> ${quote.total_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} TTC</p>
          <p style="margin: 0;"><strong>Valable jusqu'au :</strong> ${new Date(new Date(quote.created_at).setDate(new Date(quote.created_at).getDate() + 30)).toLocaleDateString("fr-FR")}</p>
        </div>

        <p style="margin-top: 30px;">Nous restons à votre entière disposition pour toute question.</p>
        <p>Cordialement,<br/><strong>L'équipe ${companyName}</strong></p>
      </div>
    `;

    // 4. Envoi de l'email via Resend
    const { data, error } = await resend.emails.send({
      // ── LA CORRECTION EST ICI : On utilise ton domaine vérifié ──
      from: `${companyName} <contact@velt.re>`, 
      to: [quote.client.email],
      subject: `Votre devis ${companyName} (n° ${quote.reference || quote.quote_number || `DV-${quote.id}`})`,
      html: htmlEmail,
    });

    if (error) {
      console.error("Erreur API Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. Mise à jour du statut dans la base de données
    await supabase
      .from("quotes")
      .update({ status: 'sent' })
      .eq("id", quote.id);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Erreur serveur lors de l'envoi de l'email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}