/**
 * MessageInput Component
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Input component for sending text messages and images
 */

"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent, ClipboardEvent } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
  onSendImages: (files: File[]) => Promise<void>; // Thêm callback cho nhiều ảnh
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onSendImage,
  onSendImages,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to truncate filename
  const truncateFilename = (filename: string, maxLength: number = 15): string => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop() || '';
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const maxNameLength = maxLength - extension.length - 4; // 4 for "..." and "."
    
    if (maxNameLength <= 0) {
      return `...${extension}`;
    }
    
    return `${nameWithoutExt.substring(0, maxNameLength)}...${extension}`;
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // Tăng lên 10MB cho ảnh paste
    if (file.size > maxSize) {
      return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return "Chỉ hỗ trợ định dạng JPG, PNG, WEBP, GIF.";
    }

    return null;
  };

  // Validate multiple files
  const validateFiles = (files: File[]): string | null => {
    const maxFiles = 10; // Giới hạn tối đa 10 ảnh
    const totalFiles = selectedImages.length + files.length;
    
    if (totalFiles > maxFiles) {
      return `Chỉ có thể gửi tối đa ${maxFiles} ảnh cùng lúc. Hiện tại: ${totalFiles} ảnh.`;
    }

    for (const file of files) {
      const error = validateFile(file);
      if (error) return error;
    }

    return null;
  };

  // Handle file selection (multiple files)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validationError = validateFiles(filesArray);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Add to existing images
    const allImages = [...selectedImages, ...filesArray];
    setSelectedImages(allImages);
    
    // Create previews for new files
    const newPreviews = [...imagePreviews];
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === allImages.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Clear selected images
  const clearImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove specific image
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    
    if (newImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle send message
  const handleSend = async () => {
    // Send images if selected
    if (selectedImages.length > 0) {
      setIsLoading(true);
      setError(null);
      try {
        if (selectedImages.length === 1) {
          // Single image - use existing callback
          await onSendImage(selectedImages[0]);
        } else {
          // Multiple images - use new callback
          await onSendImages(selectedImages);
        }
        clearImages();
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

  // Handle paste event (multiple images)
  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    // Look for all images in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault(); // Prevent default paste behavior
      
      const validationError = validateFiles(imageFiles);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setError(null);
      
      // Add to existing images
      const allImages = [...selectedImages, ...imageFiles];
      setSelectedImages(allImages);

      // Create previews for new images
      const newPreviews = [...imagePreviews];
      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === allImages.length) {
            setImagePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const canSend = !disabled && !isLoading && (message.trim() || selectedImages.length > 0);

  return (
    <div className="border-t border-default-200 bg-default-50 dark:bg-default-100/5 p-4">
      {/* Error message */}
      {error && (
        <div className="mb-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Images preview */}
      {imagePreviews.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-20 w-20 rounded-lg object-cover border-2 border-default-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -right-1 -top-1 rounded-full bg-danger p-1 text-white hover:bg-danger-600 transition-colors shadow-lg"
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </button>
                {/* File name with truncation */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 rounded-b-lg truncate max-w-[80px]"
                  title={selectedImages[index]?.name || `Ảnh ${index + 1}`} // Tooltip with full name
                >
                  {selectedImages[index]?.name ? 
                    truncateFilename(selectedImages[index].name, 12)
                    : `Ảnh ${index + 1}`
                  }
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-default-500">
            {selectedImages.length} ảnh đã chọn
            {selectedImages.length > 1 && (
              <button
                onClick={clearImages}
                className="ml-2 text-danger hover:underline"
                disabled={isLoading}
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-3">
        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          className="flex-shrink-0 rounded-lg p-2.5 text-default-500 hover:bg-default-200 hover:text-default-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Đính kèm ảnh (có thể chọn nhiều)"
        >
          <ImageIcon className="h-6 w-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={selectedImages.length > 0 ? `${selectedImages.length} ảnh đã sẵn sàng để gửi...` : "Nhập tin nhắn hoặc dán ảnh (Ctrl+V)..."}
          disabled={disabled || isLoading}
          className="flex-1 resize-none rounded-lg border border-default-200 bg-default-50 dark:bg-default-100/5 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors [&::-webkit-scrollbar]:hidden"
          rows={1}
          style={{ 
            maxHeight: "120px",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
            overflowY: "auto", // Allow scrolling when needed
          }}
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
