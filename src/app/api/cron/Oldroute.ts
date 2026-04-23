import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Utilisation du rôle Admin pour contourner les RLS en interne
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fonction pour remplacer les variables {{...}}
function parseTemplate(template: string, data: any) {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    return data[key.trim()] || match;
  });
}

export async function GET(request: Request) {
  // Sécurité : Vérifier le secret Cron (Vercel ou autre)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const sentLogs: string[] = [];

    // 1. Récupérer les séquences actives avec leurs étapes
    const { data: sequences } = await supabaseAdmin
      .from("email_sequences")
      .select("*, email_sequence_steps(*)")
      .eq("is_active", true);

    if (!sequences) return NextResponse.json({ message: "Aucune séquence active." });

    for (const sequence of sequences) {
      for (const step of sequence.email_sequence_steps) {
        
        // 2. Calculer la date cible (Aujourd'hui - X jours de délai)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - step.delay_days);
        const dateString = targetDate.toISOString().split('T')[0];

        // 3. Trouver les deals créés à cette date précise pour ce trigger
        // Ici on traite le trigger "deal_created"
        if (sequence.trigger === "deal_created") {
          const { data: deals } = await supabaseAdmin
            .from("deals")
            .select(`
              id, title, 
              contact:crm_contacts(id, first_name, last_name, email)
            `)
            .gte("created_at", `${dateString}T00:00:00`)
            .lte("created_at", `${dateString}T23:59:59`);

          if (!deals) continue;

          for (const deal of deals) {
            const contact = deal.contact as any;
            if (!contact?.email) continue;

            // 4. Vérifier si l'email a déjà été envoyé (Anti-Doublon)
            const { data: alreadySent } = await supabaseAdmin
              .from("email_logs")
              .select("id")
              .eq("deal_id", deal.id)
              .eq("email_sequence_step_id", step.id)
              .single();

            if (alreadySent) continue;

            // 5. Préparer et envoyer l'email
            const personalizedBody = parseTemplate(step.body_html, {
              contact_name: contact.first_name,
              deal_title: deal.title
            });

            const { data, error } = await resend.emails.send({
              from: 'Luxy Formation <contact@votre-domaine.fr>',
              to: [contact.email],
              subject: step.subject,
              html: personalizedBody,
            });

            if (!error) {
              // 6. Loguer l'envoi pour ne pas recommencer demain
              await supabaseAdmin.from("email_logs").insert([{
                crm_contact_id: contact.id,
                deal_id: deal.id,
                email_sequence_step_id: step.id
              }]);
              sentLogs.push(`Email envoyé à ${contact.email} pour le deal ${deal.id}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: sentLogs });
  } catch (error: any) {
    console.error("CRON ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}