/**
 * MessageInput Component
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Input component for sending text messages and images
 */

"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onSendImage,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.";
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Chỉ hỗ trợ định dạng JPG, PNG, WEBP.";
    }

    return null;
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle send message
  const handleSend = async () => {
    // Send image if selected
    if (selectedImage) {
      setIsLoading(true);
      setError(null);
      try {
        await onSendImage(selectedImage);
        clearImage();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể gửi ảnh. Vui lòng thử lại."
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Send text message
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setIsLoading(true);
    setError(null);
    try {
      await onSendMessage(trimmedMessage);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể gửi tin nhắn. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const canSend = !disabled && !isLoading && (message.trim() || selectedImage);

  return (
    <div className="border-t border-default-200 bg-default-50 dark:bg-default-100/5 p-4">
      {/* Error message */}
      {error && (
        <div className="mb-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-24 w-24 rounded-lg object-cover border-2 border-default-200"
          />
          <button
            onClick={clearImage}
            className="absolute -right-2 -top-2 rounded-full bg-danger p-1.5 text-white hover:bg-danger-600 transition-colors shadow-lg"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-3">
        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading || !!selectedImage}
          className="flex-shrink-0 rounded-lg p-2.5 text-default-500 hover:bg-default-200 hover:text-default-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Đính kèm ảnh"
        >
          <ImageIcon className="h-6 w-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          disabled={disabled || isLoading || !!selectedImage}
          className="flex-1 resize-none rounded-lg border border-default-200 bg-default-50 dark:bg-default-100/5 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          rows={1}
          style={{ maxHeight: "120px" }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 rounded-lg bg-primary p-2.5 text-white hover:bg-primary-600 disabled:bg-default-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          title="Gửi"
        >
          <Send className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
