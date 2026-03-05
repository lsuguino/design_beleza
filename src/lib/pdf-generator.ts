import puppeteer from 'puppeteer';

const STORAGE_KEY = 'rtg-preview-data';

/**
 * Gera um PDF a partir da página de prévia usando Puppeteer (roda localmente).
 * Se data for passado, injeta no localStorage antes de carregar a página, para o preview renderizar o material.
 * @param previewUrl - URL da página de prévia (ex.: http://localhost:3000/preview)
 * @param data - Dados do material (design, conteudo, tema). Se não passar, a página usa o que estiver no localStorage (só funciona no navegador do usuário).
 * @returns Buffer do PDF gerado
 */
export async function generatePDF(previewUrl: string, data?: unknown): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    if (data != null) {
      const json = JSON.stringify(data);
      await page.evaluateOnNewDocument((key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // ignore
        }
      }, STORAGE_KEY, json);
    }

    await page.goto(previewUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.waitForSelector('.preview-page-wrap, .print-content, .page', { timeout: 10000 }).catch(() => {
      // continua mesmo se não achar (página pode ter conteúdo diferente)
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
