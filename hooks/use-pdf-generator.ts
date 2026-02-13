"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function usePdfGenerator() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePDF = async (
    elementId: string,
    _fileName: string,
  ): Promise<{ blob: Blob; buffer: ArrayBuffer }> => {
    setGenerating(true);
    setProgress(0);

    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error("Element not found");

      setProgress(20);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById(elementId);
          if (clonedEl) {
            clonedEl.style.fontFamily = "Times New Roman, serif";
          }
        },
      });

      setProgress(60);

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pageHeight = 297;

      if (imgHeight > pageHeight) {
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      }

      setProgress(80);

      const pdfBlob = pdf.output("blob");
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
