import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    console.log("Environment:", isDev ? "development" : "production");
    
    let puppeteer;
    let browser;
    
    if (isDev) {
      // Use full puppeteer in development
      console.log("Attempting to import puppeteer...");
      puppeteer = (await import("puppeteer")).default;
      console.log("Puppeteer imported successfully");
      
      // Try to find Chrome on system
      const chromePath = findChromeExecutable();
      console.log("Chrome path:", chromePath || "Not found, will use bundled");
      
      const launchOptions: any = {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      };
      
      if (chromePath) {
        launchOptions.executablePath = chromePath;
      }
      
      console.log("Launching browser...");
      browser = await puppeteer.launch(launchOptions);
      console.log("Browser launched successfully");
    } else {
      // Use puppeteer-core with Chromium in production
      console.log("Attempting to import puppeteer-core and chromium...");
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = (await import("puppeteer-core")).default;
      console.log("Imports successful");
      
      const executablePath = await chromium.executablePath();
      console.log("Chromium path:", executablePath);
      
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });
      console.log("Browser launched successfully");
    }

    const page = await browser.newPage();
    console.log("New page created");
    
    await page.setContent("<h1>Test PDF</h1><p>This is a test.</p>");
    console.log("Content set");
    
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    console.log("PDF generated, size:", pdf.length, "bytes");

    await browser.close();
    console.log("Browser closed");

    return new NextResponse(pdf.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="test.pdf"',
      },
    });
  } catch (error) {
    console.error("Test PDF error:", error);
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return NextResponse.json(
      { 
        error: "Test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        env: process.env.NODE_ENV,
        nodeVersion: process.version,
      },
      { status: 500 }
    );
  }
}
