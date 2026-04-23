import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fonction pour remplacer les variables {{...}}
function parseTemplate(template: string, data: Record<string, any>) {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    return data[key.trim()] || match;
  });
}

export async function GET(request: Request) {
  // Sécurité : Vérifier le secret Cron (Vercel ou autre)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL manquante." },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY manquante." },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY manquante." },
        { status: 500 }
      );
    }

    // Initialisation uniquement au moment de l'appel
    const resend = new Resend(resendApiKey);

    // Utilisation du rôle Admin pour contourner les RLS en interne
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    const sentLogs: string[] = [];

    // 1. Récupérer les séquences actives avec leurs étapes
    const { data: sequences, error: sequencesError } = await supabaseAdmin
      .from("email_sequences")
      .select("*, email_sequence_steps(*)")
      .eq("is_active", true);

    if (sequencesError) {
      throw sequencesError;
    }

    if (!sequences || sequences.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucune séquence active.",
        processed: [],
      });
    }

    for (const sequence of sequences) {
      for (const step of sequence.email_sequence_steps ?? []) {
        // 2. Calculer la date cible (Aujourd'hui - X jours de délai)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - step.delay_days);
        const dateString = targetDate.toISOString().split("T")[0];

        // 3. Trouver les deals créés à cette date précise pour ce trigger
        if (sequence.trigger === "deal_created") {
          const { data: deals, error: dealsError } = await supabaseAdmin
            .from("deals")
            .select(`
              id,
              title,
              contact:crm_contacts(id, first_name, last_name, email)
            `)
            .gte("created_at", `${dateString}T00:00:00`)
            .lte("created_at", `${dateString}T23:59:59`);

          if (dealsError) {
            throw dealsError;
          }

          if (!deals || deals.length === 0) {
            continue;
          }

          for (const deal of deals) {
            const contact = deal.contact as
              | {
                  id: number | string;
                  first_name?: string;
                  last_name?: string;
                  email?: string;
                }
              | null;

            if (!contact?.email) {
              continue;
            }

            // 4. Vérifier si l'email a déjà été envoyé (anti-doublon)
            const { data: alreadySent, error: logCheckError } = await supabaseAdmin
              .from("email_logs")
              .select("id")
              .eq("deal_id", deal.id)
              .eq("email_sequence_step_id", step.id)
              .maybeSingle();

            if (logCheckError) {
              throw logCheckError;
            }

            if (alreadySent) {
              continue;
            }

            // 5. Préparer et envoyer l'email
            const personalizedBody = parseTemplate(step.body_html, {
              contact_name: contact.first_name ?? "",
              deal_title: deal.title ?? "",
            });

            const { error: resendError } = await resend.emails.send({
              from: "Luxy Formation <contact@velt.re>",
              to: [contact.email],
              subject: step.subject,
              html: personalizedBody,
            });

            if (resendError) {
              console.error("RESEND ERROR:", resendError);
              continue;
            }

            // 6. Loguer l'envoi pour ne pas recommencer demain
            const { error: insertLogError } = await supabaseAdmin
              .from("email_logs")
              .insert([
                {
                  crm_contact_id: contact.id,
                  deal_id: deal.id,
                  email_sequence_step_id: step.id,
                },
              ]);

            if (insertLogError) {
              throw insertLogError;
            }

            sentLogs.push(`Email envoyé à ${contact.email} pour le deal ${deal.id}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: sentLogs });
  } catch (error: any) {
    console.error("CRON ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur inconnue." },
      { status: 500 }
    );
  }
}