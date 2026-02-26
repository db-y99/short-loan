/**
 * ChatInterface Component
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Main chat interface with realtime messaging and image upload
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRealtimeActivityLogs } from "@/hooks/use-realtime-activity-logs";
import { insertMessage, uploadImage, insertImageLog } from "@/lib/chat";
import { OptimisticMessage } from "@/types/chat.types";
import { MessageInput } from "./message-input";
import { MessageBubble } from "./message-bubble";
import { SystemEventBubble } from "./system-event-bubble";
import { ImageViewer } from "./image-viewer";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

interface ChatInterfaceProps {
  loanId: string;
  driveFolderId: string;
  currentUserId: string;
  currentUserName: string;
}

export function ChatInterface({
  loanId,
  driveFolderId,
  currentUserId,
  currentUserName,
}: ChatInterfaceProps) {
  const { messages: realtimeMessages, connectionStatus, refetch } =
    useRealtimeActivityLogs(loanId);

  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Merge realtime messages with optimistic messages
  const allMessages: OptimisticMessage[] = [
    ...realtimeMessages.map((msg) => ({
      ...msg,
      status: "sent" as const,
    })),
    ...optimisticMessages,
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Check if user is at bottom of messages
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, shouldAutoScroll]);

  // Update auto-scroll based on scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShouldAutoScroll(checkIfAtBottom());
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [checkIfAtBottom]);

  // Handle send message
  const handleSendMessage = async (content: string) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: OptimisticMessage = {
      id: tempId,
      loan_id: loanId,
      type: "message",
      user_id: currentUserId,
      user_name: currentUserName,
      content,
      system_message: null,
      images: null,
      links: null,
      mentions: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      status: "sending",
      tempId,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setShouldAutoScroll(true);

    try {
      await insertMessage(loanId, currentUserId, currentUserName, content);
      // Remove optimistic message after successful send
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.tempId !== tempId)
      );
      // Save to localStorage for recovery
      localStorage.removeItem(`failed-message-${tempId}`);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Update status to error
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "error" } : msg
        )
      );
      // Save to localStorage
      localStorage.setItem(
        `failed-message-${tempId}`,
        JSON.stringify(optimisticMsg)
      );
    }
  };

  // Handle send image
  const handleSendImage = async (file: File) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: OptimisticMessage = {
      id: tempId,
      loan_id: loanId,
      type: "image_upload",
      user_id: currentUserId,
      user_name: currentUserName,
      content: null,
      system_message: null,
      images: ["uploading"],
      links: null,
      mentions: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      status: "sending",
      tempId,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setShouldAutoScroll(true);

    try {
      // Upload image
      const imageUrl = await uploadImage(loanId, file, driveFolderId);
      // Insert log
      await insertImageLog(loanId, currentUserId, currentUserName, imageUrl);
      // Remove optimistic message
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.tempId !== tempId)
      );
    } catch (error) {
      console.error("Failed to send image:", error);
      // Update status to error
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "error" } : msg
        )
      );
    }
  };

  // Handle retry failed message
  const handleRetry = async (message: OptimisticMessage) => {
    if (message.type === "message" && message.content) {
      // Remove failed message
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.tempId !== message.tempId)
      );
      // Resend
      await handleSendMessage(message.content);
    }
  };

  // Handle image click
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageViewerOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-default-200 bg-default-50 dark:bg-default-100/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-default-900">
            Trao đổi & Nhật ký
          </h2>
          {/* Connection status */}
          <div className="flex items-center gap-2">
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-1 text-sm text-success">
                <Wifi className="h-4 w-4" />
                <span>Đã kết nối</span>
              </div>
            )}
            {connectionStatus === "connecting" && (
              <div className="flex items-center gap-1 text-sm text-warning">
                <WifiOff className="h-4 w-4" />
                <span>Đang kết nối...</span>
              </div>
            )}
            {connectionStatus === "error" && (
              <div className="flex items-center gap-1 text-sm text-danger">
                <AlertCircle className="h-4 w-4" />
                <span>Mất kết nối</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {allMessages.length === 0 && (
          <div className="flex h-full items-center justify-center text-default-500">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        )}

        {allMessages.map((message) => {
          const isSystemEvent =
            message.type === "system_event" ||
            message.type === "approval" ||
            message.type === "contract_created" ||
            message.type === "contract_signed" ||
            message.type === "disbursement";

          if (isSystemEvent) {
            return <SystemEventBubble key={message.id} event={message} />;
          }

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.user_id === currentUserId}
              onRetry={handleRetry}
              onImageClick={handleImageClick}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        disabled={connectionStatus === "error"}
      />

      {/* Image viewer */}
      {selectedImage && (
        <ImageViewer
          imageUrl={selectedImage}
          isOpen={isImageViewerOpen}
          onClose={() => {
            setIsImageViewerOpen(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
}
