const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : "https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar";

let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

interface PdfBrowser {
  newPage(): Promise<PdfPage>;
  close(): Promise<void>;
}

interface PdfPage {
  setContent(html: string, options: { waitUntil: "load" | "domcontentloaded" }): Promise<void>;
  waitForNetworkIdle(options?: { idleTime?: number; timeout?: number }): Promise<void>;
  emulateMediaType(type: "screen" | "print"): Promise<void>;
  pdf(options: {
    format: "A4";
    landscape: boolean;
    printBackground: boolean;
    displayHeaderFooter: boolean;
    headerTemplate: string;
    footerTemplate: string;
    margin: { top: string; bottom: string; left: string; right: string };
  }): Promise<Uint8Array>;
}

export interface RenderHtmlToPdfOptions {
  html: string;
  landscape?: boolean;
  generatedAt?: string;
  displayHeaderFooter?: boolean;
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

async function getChromiumPath(): Promise<string> {
  if (cachedExecutablePath) return cachedExecutablePath;

  if (!downloadPromise) {
    const chromium = (
      (await import("@sparticuz/chromium-min")) as {
        default: { executablePath(url: string): Promise<string> };
      }
    ).default;

    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path) => {
        cachedExecutablePath = path;
        return path;
      })
      .catch((error: unknown) => {
        downloadPromise = null;
        throw error;
      });
  }

  return downloadPromise;
}

export async function launchPdfBrowser(): Promise<PdfBrowser> {
  if (process.env.VERCEL_ENV) {
    const chromium = (
      (await import("@sparticuz/chromium-min")) as {
        default: { args: string[] };
      }
    ).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      headless: true,
      args: chromium.args,
      executablePath: await getChromiumPath(),
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.launch({ headless: true });
}

export async function renderHtmlToPdf({
  html,
  landscape = false,
  generatedAt,
  displayHeaderFooter = false,
  margin,
}: RenderHtmlToPdfOptions): Promise<Uint8Array> {
  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 5_000 });
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      format: "A4",
      landscape,
      printBackground: true,
      displayHeaderFooter,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="width:100%;display:flex;justify-content:space-between;font-family:sans-serif;font-size:9px;color:#888;padding:0 1cm;">
          <span>${generatedAt ? `Report generated ${generatedAt}` : ""}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
      margin: {
        top: margin?.top ?? "32px",
        bottom: margin?.bottom ?? "32px",
        left: margin?.left ?? "40px",
        right: margin?.right ?? "40px",
      },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
