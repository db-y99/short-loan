/**
 * Realtime Activity Logs Hook
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Subscribe to realtime changes in loan_activity_logs table
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabase/client";
import { ActivityLog, ConnectionStatus } from "@/types/chat.types";
import { fetchActivityLogs } from "@/lib/chat";

interface UseRealtimeActivityLogsResult {
  messages: ActivityLog[];
  connectionStatus: ConnectionStatus;
  refetch: () => Promise<void>;
}

/**
 * Hook to subscribe to realtime activity log changes for a loan
 * 
 * @param loanId - The loan ID to subscribe to
 * @returns Messages array, connection status, and refetch function
 */
export function useRealtimeActivityLogs(
  loanId: string
): UseRealtimeActivityLogsResult {
  const [messages, setMessages] = useState<ActivityLog[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch initial messages
  const refetch = useCallback(async () => {
    try {
      const logs = await fetchActivityLogs(loanId);
      setMessages(logs);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      setConnectionStatus("error");
    }
  }, [loanId]);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Setup realtime subscription
  useEffect(() => {
    if (!loanId) return;

    const newChannel = supabaseClient
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
          const newLog = payload.new as ActivityLog;
          setMessages((prev) => {
            // Check if message already exists (avoid duplicates)
            if (prev.some((msg) => msg.id === newLog.id)) {
              return prev;
            }
            // Add new message at the end (sorted by created_at ASC)
            return [...prev, newLog];
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          setConnectionStatus("error");
          // Retry connection after 3 seconds
          setTimeout(() => {
            setConnectionStatus("connecting");
            refetch();
          }, 3000);
        } else if (status === "TIMED_OUT") {
          setConnectionStatus("error");
        } else if (status === "CLOSED") {
          setConnectionStatus("disconnected");
        }
      });

    setChannel(newChannel);

    // Cleanup on unmount
    return () => {
      newChannel.unsubscribe();
    };
  }, [loanId, refetch]);

  // Auto-refetch when reconnecting after error
  useEffect(() => {
    if (connectionStatus === "connected" && channel) {
      // Refetch to ensure we didn't miss any messages during disconnect
      refetch();
    }
  }, [connectionStatus, channel, refetch]);

  return {
    messages,
    connectionStatus,
    refetch,
  };
}
