"use client";

import { useState } from "react";

export function usePdfGenerator() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePDF = async (
    elementId: string,
    fileName: string,
  ): Promise<{ blob: Blob; buffer: ArrayBuffer }> => {
    setGenerating(true);
    setProgress(0);

    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error("Element not found");

      setProgress(20);

      // Get all stylesheets from the document
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch (e) {
            // Handle CORS issues with external stylesheets
            return "";
          }
        })
        .join("\n");

      // Get the HTML content
      const html = element.outerHTML;
      
      // Create complete HTML document with all styles
      const styledHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              ${styles}
              
              /* Additional PDF-specific styles */
              body {
                font-family: 'Times New Roman', serif;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              * {
                box-sizing: border-box;
              }
              @page {
                margin: 20mm;
                size: A4;
              }
              /* Remove wrapper padding since @page handles it */
              .pdf-wrapper {
                padding: 0;
              }
              /* Remove container padding in PDF */
              .pdf-wrapper #contract-content {
                padding: 0 !important;
                width: 100% !important;
                background-color: white;
              }
              @media print {
                .page-break {
                  page-break-after: always;
                  break-after: page;
                }
                .no-page-break {
                  page-break-after: avoid;
                  break-after: avoid;
                }
                /* Hide page numbers when printing */
                .page-number-badge {
                  display: none !important;
                }
              }
              /* Ensure pages display vertically */
              #contract-content {
                display: block !important;
              }
              #contract-content > div {
                display: block !important;
                page-break-inside: avoid;
              }
            </style>
          </head>
          <body>
            <div class="pdf-wrapper">
              ${html}
            </div>
          </body>
        </html>
      `;

      setProgress(40);

      // Call the Puppeteer API
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: styledHtml,
          fileName,
        }),
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.json();
        console.error("PDF API Error:", error);
        throw new Error(error.details || error.error || "Failed to generate PDF");
      }

      const pdfBlob = await response.blob();
      setProgress(100);
      setGenerating(false);

      return { blob: pdfBlob, buffer: await pdfBlob.arrayBuffer() };
    } catch (error) {
      setGenerating(false);
      throw error;
    }
  };

  const downloadPDF = async (elementId: string, fileName: string) => {
    const { blob } = await generatePDF(elementId, fileName);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadPDFToDrive = async (
    elementId: string,
    fileName: string,
    folderId: string,
    loanId?: string,
    fileType?: string,
  ) => {
    const { buffer } = await generatePDF(elementId, fileName);
    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: "application/pdf" }));
    formData.append("fileName", fileName);
    formData.append("folderId", folderId);
    if (loanId) formData.append("loanId", loanId);
    if (fileType) formData.append("fileType", fileType);

    const response = await fetch("/api/drive/upload-contract", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error ?? "Upload failed");
    }

    return (await response.json()) as {
      success: boolean;
      fileId: string;
    };
  };

  return {
    generating,
    progress,
    generatePDF,
    downloadPDF,
    uploadPDFToDrive,
  };
}
