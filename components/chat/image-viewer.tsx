/**
 * ImageViewer Component
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Modal to view images in full size with zoom functionality
 */

"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({ imageUrl, isOpen, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Reset zoom when opening new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setIsLoading(true);
    }
  }, [isOpen, imageUrl]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={handleBackdropClick}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Zoom controls */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="rounded-lg bg-gray-900/80 backdrop-blur-sm border border-white/20 p-2.5 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          title="Thu nhỏ"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-white/20 text-white font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          className="rounded-lg bg-gray-900/80 backdrop-blur-sm border border-white/20 p-2.5 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          title="Phóng to"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="rounded-lg bg-gray-900/80 backdrop-blur-sm border border-white/20 p-2.5 text-white hover:bg-red-600 transition-colors shadow-lg"
          title="Đóng (ESC)"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}
        <img
          src={`/api/drive/file/${imageUrl}`}
          alt="Full size"
          className="max-h-[85vh] max-w-[85vw] object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>

      {/* Helper text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white text-opacity-70">
        Click bên ngoài hoặc nhấn ESC để đóng
      </div>
    </div>
  );
}
