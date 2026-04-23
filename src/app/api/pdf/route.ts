import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return new NextResponse("ID manquant", { status: 400 });

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();

    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader) {
      await page.setExtraHTTPHeaders({ Cookie: cookieHeader });
    }

    const baseUrl = 'http://localhost:3000';
    // ── L'URL EST MISE À JOUR ICI POUR CORRESPONDRE AU NOUVEAU DOSSIER ──
    const targetUrl = `${baseUrl}/print/devis/${id}`;

    await page.goto(targetUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // On attend que la page soit générée avant de prendre le PDF
    await page.waitForSelector('.w-\\[210mm\\]', { timeout: 10000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 } 
    });

    await browser.close();
    const body = new Blob([pdfBuffer], { type: 'application/pdf' });

    return new Response(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Devis_${id}.pdf"`,
      },
    });
    // return new NextResponse(pdfBuffer, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="Devis_${id}.pdf"`,
    //   },
    // });
  } catch (error: any) {
    console.error("Erreur PDF:", error);
    if (browser) await browser.close();
    return new NextResponse(`Erreur : ${error.message}`, { status: 500 });
  }
}