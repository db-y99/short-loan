import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Function to find Chrome executable on Windows
function findChromeExecutable(): string | null {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  ];
  
  const fs = require('fs');
  for (const path of possiblePaths) {
    if (path && fs.existsSync(path)) {
      return path;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { html, fileName } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const isDev = process.env.NODE_ENV === "development";
    
    let puppeteer;
    let chromium;
    
    if (isDev) {
      // Use full puppeteer in development
      try {
        puppeteer = (await import("puppeteer")).default;
        console.log("Using puppeteer in development mode");
        
        // Try to find Chrome on system
        const chromePath = findChromeExecutable();
        
        const launchOptions: any = {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
          ],
        };
        
        if (chromePath) {
          console.log("Using system Chrome at:", chromePath);
          launchOptions.executablePath = chromePath;
        } else {
          console.log("Using bundled Chromium");
        }
        
        browser = await puppeteer.launch(launchOptions);
      } catch (error) {
        console.error("Failed to launch puppeteer:", error);
        throw new Error(`Puppeteer launch failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      // Use puppeteer-core with Chromium in production
      try {
        puppeteer = (await import("puppeteer-core")).default;
        chromium = (await import("@sparticuz/chromium")).default;
        console.log("Using puppeteer-core with Chromium in production mode");

        const executablePath = await chromium.executablePath();
        console.log("Chromium executable path:", executablePath);

        browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
          defaultViewport: {
            width: 1920,
            height: 1080,
          },
          executablePath,
          headless: true,
        });
      } catch (error) {
        console.error("Failed to launch puppeteer-core:", error);
        throw new Error(`Puppeteer-core launch failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    console.log("Browser launched successfully");

    const page = await browser.newPage();
    console.log("New page created");

    // Set content with proper encoding and wait for fonts
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });
    console.log("Content set successfully");

    // Wait a bit for fonts to load
    try {
      await page.evaluateHandle("document.fonts.ready");
      console.log("Fonts loaded");
    } catch (fontError) {
      console.warn("Font loading warning:", fontError);
      // Continue anyway
    }

    // Generate PDF with A4 format
    console.log("Generating PDF...");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });
    console.log("PDF generated successfully, size:", pdf.length, "bytes");

    await browser.close();
    console.log("Browser closed");

    return new NextResponse(pdf.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName || "document.pdf")}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
        console.log("Browser closed after error");
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
    
    return NextResponse.json(
      { 
        error: "Failed to generate PDF", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
