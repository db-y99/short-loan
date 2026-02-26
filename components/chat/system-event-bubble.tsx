/**
 * SystemEventBubble Component
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Display system events (approval, disbursement, etc.)
 */

"use client";

import { ActivityLog } from "@/types/chat.types";
import {
  CheckCircle,
  XCircle,
  FileText,
  FileSignature,
  DollarSign,
  Info,
} from "lucide-react";
import { formatTimestamp } from "@/lib/format-timestamp";

interface SystemEventBubbleProps {
  event: ActivityLog;
}

export function SystemEventBubble({ event }: SystemEventBubbleProps) {
  // Get icon based on event type
  const getIcon = () => {
    switch (event.type) {
      case "approval":
        return event.system_message?.includes("từ chối") ? (
          <XCircle className="h-5 w-5 text-danger" />
        ) : (
          <CheckCircle className="h-5 w-5 text-success" />
        );
      case "contract_created":
        return <FileText className="h-5 w-5 text-primary" />;
      case "contract_signed":
        return <FileSignature className="h-5 w-5 text-secondary" />;
      case "disbursement":
        return <DollarSign className="h-5 w-5 text-success" />;
      case "system_event":
        return <Info className="h-5 w-5 text-default-500" />;
      default:
        return <Info className="h-5 w-5 text-default-500" />;
    }
  };

  // Get display text
  const getDisplayText = () => {
    if (event.system_message) {
      return event.system_message;
    }

    // Fallback based on type
    switch (event.type) {
      case "approval":
        return "Hồ sơ đã được phê duyệt";
      case "contract_created":
        return "Hợp đồng đã được tạo";
      case "contract_signed":
        return "Hợp đồng đã được ký";
      case "disbursement":
        return "Đã giải ngân";
      default:
        return "Sự kiện hệ thống";
    }
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-3 rounded-full bg-default-100 px-4 py-2 text-sm text-default-700">
        {/* Icon */}
        {getIcon()}

        {/* Message */}
        <span className="font-medium">{getDisplayText()}</span>

        {/* Timestamp */}
        <span className="text-xs text-default-500">
          {formatTimestamp(event.created_at)}
        </span>
      </div>
    </div>
  );
}
