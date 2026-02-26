/**
 * Chat and Activity Log Types
 * Feature: chat-va-trao-doi-nhat-ky
 */

import { TActivityLogType } from "./loan.types";

/**
 * Activity log entry from database
 */
export interface ActivityLog {
  id: string;
  loan_id: string;
  type: TActivityLogType;
  user_id: string;
  user_name: string;
  content: string | null;
  system_message: string | null;
  images: string[] | null;
  links: string[] | null;
  mentions: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Message status for optimistic UI
 */
export type MessageStatus = "sending" | "sent" | "error";

/**
 * Optimistic message with status tracking
 */
export interface OptimisticMessage extends ActivityLog {
  status: MessageStatus;
  tempId?: string;
}

/**
 * Connection status for realtime subscription
 */
export type ConnectionStatus = "connected" | "connecting" | "error" | "disconnected";
