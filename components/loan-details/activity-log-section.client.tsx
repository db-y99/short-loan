"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/button";
import {
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import type { TActivityLogEntry } from "@/types/loan.types";
import ActivityLogEntry from "@/components/loan-details/activity-log-entry";
import { supabaseClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "@/lib/contexts/auth-context";

type TProps = {
  entries: TActivityLogEntry[];
  loanId: string;
};

const ActivityLogSection = ({ 
  entries: initialEntries, 
  loanId,
}: TProps) => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [entries, setEntries] = useState<TActivityLogEntry[]>(initialEntries);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Get user info
  const currentUserId = user?.id || "system";
  const currentUserName = user?.user_metadata?.full_name || user?.email || "Hệ thống";

  // Update entries when initialEntries changes
  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entries]);

  // Setup realtime subscription
  useEffect(() => {
    if (!loanId) return;

    // Subscribe to loan_activity_logs changes
    const channel = supabaseClient
      .channel(`loan_activity_logs:${loanId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "loan_activity_logs",
          filter: `loan_id=eq.${loanId}`,
        },
        (payload) => {
          const newEntry = payload.new as {
            id: string;
            type: string;
            user_id: string;
            user_name: string;
            content?: string;
            system_message?: string;
            images?: string[];
            links?: string[];
            mentions?: string[];
            created_at: string;
          };

          // Transform to TActivityLogEntry format
          const entry: TActivityLogEntry = {
            id: newEntry.id,
            type: newEntry.type as TActivityLogEntry["type"],
            userId: newEntry.user_id,
            userName: newEntry.user_name,
            timestamp: newEntry.created_at,
            content: newEntry.content,
            systemMessage: newEntry.system_message,
            images: newEntry.images,
            links: newEntry.links,
            mentions: newEntry.mentions,
          };

          setEntries((prev) => [...prev, entry]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
      }
    };
  }, [loanId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch(`/api/loans/${loanId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputValue.trim(),
          userId: currentUserId,
          userName: currentUserName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setInputValue("");
      } else {
        console.error("Failed to send message:", result.error);
        alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Lỗi khi gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {
        !entries || entries.length === 0 && (
          <div className="flex items-center justify-center h-full py-8 text-default-400">
            <MessageSquare className="w-8 h-8 mr-2" />
            <span>Chưa có trao đổi</span>
          </div>
        )
      }
      <div className="flex-1 h-full overflow-y-auto p-2">
        {entries && entries.length > 0 && entries.map((entry) => (
          <ActivityLogEntry key={entry.id} entry={entry} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 border-t border-default-200">
        <div className="flex gap-2 p-2">
          <Input
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyPress}
            isDisabled={isSending}
          />
          <Button
            isIconOnly
            color="primary"
            onPress={handleSendMessage}
            isDisabled={isSending || !inputValue.trim()}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogSection;

