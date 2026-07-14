/**
 * MessageBubble Component
 * Feature: chat-va-trao-doi-nhat-ky
 *
 * Display a single message with avatar, name, timestamp, and status
 */

"use client";

import { Check, CheckCheck, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@heroui/skeleton";

import { OptimisticMessage } from "@/types/chat.types";
import { formatTimestamp } from "@/lib/format-timestamp";

interface MessageBubbleProps {
  message: OptimisticMessage;
  isOwnMessage: boolean;
  onRetry?: (message: OptimisticMessage) => void;
  onImageClick?: (imageUrl: string) => void;
}

export function MessageBubble({
  message,
  isOwnMessage,
  onRetry,
  onImageClick,
}: MessageBubbleProps) {
  const isTextMessage = message.type === "message" && message.content;
  const isImageMessage = message.type === "image_upload" && message.images;

  // Get status icon
  const getStatusIcon = () => {
    if (message.status === "sending") {
      return <Check className="h-4 w-4 text-default-400" />;
    }
    if (message.status === "sent") {
      return <CheckCheck className="h-4 w-4 text-primary" />;
    }
    if (message.status === "error") {
      return <AlertCircle className="h-4 w-4 text-danger" />;
    }

    return null;
  };

  // Get avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`flex min-w-0 gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
          isOwnMessage ? "bg-primary" : "bg-default-500"
        }`}
      >
        {getInitials(message.user_name)}
      </div>

      {/* Message content */}
      <div
        className={`flex min-w-0 flex-1 max-w-[70%] flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        {/* Name and timestamp */}
        <div
          className={`mb-1 flex min-w-0 max-w-full items-center gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="truncate text-sm font-semibold text-default-900">
            {message.user_name}
          </span>
          <span className="text-xs text-default-500">
            {formatTimestamp(message.created_at)}
          </span>
        </div>

        {/* Message bubble - conditional wrapper based on message type */}
        {isTextMessage && (
          <div
            className={`max-w-full overflow-hidden rounded-lg px-4 py-2 ${
              isOwnMessage
                ? "bg-primary text-white"
                : "bg-default-100 text-default-900"
            }`}
          >
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {message.content}
            </p>
          </div>
        )}

        {/* Image content - no background wrapper */}
        {isImageMessage && message.images && (
          <div className="space-y-2">
            {message.images.map((imageUrl, index) => {
              // Show skeleton loading when uploading
              if (imageUrl === "uploading") {
                return (
                  <div key={index} className="relative w-64 h-48">
                    <Skeleton className="w-full h-full rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-sm text-default-500">
                        Đang tải ảnh...
                      </div>
                    </div>
                  </div>
                );
              }

              // Show actual image
              return (
                <div key={index} className="relative">
                  <button
                    className="block max-w-full rounded-lg p-0 border-0 bg-transparent cursor-pointer hover:opacity-90 transition-opacity"
                    type="button"
                    onClick={() => onImageClick?.(imageUrl)}
                  >
                    <img
                      alt="Tin nhắn đính kèm"
                      className="max-w-full rounded-lg"
                      loading="lazy"
                      src={`/api/drive/file/${imageUrl}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Status and retry */}
        <div
          className={`flex items-center gap-2 mt-1 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
        >
          {/* Status icon */}
          {isOwnMessage && getStatusIcon()}

          {/* Retry button for failed messages */}
          {message.status === "error" && onRetry && (
            <button
              className="flex items-center gap-1 text-xs text-danger hover:text-danger-700"
              onClick={() => onRetry(message)}
            >
              <RefreshCw className="h-3 w-3" />
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
