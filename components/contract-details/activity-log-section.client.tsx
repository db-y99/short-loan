"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { Chip, Image, Input, Link } from "@heroui/react";
import { Button } from "@heroui/button";
import {
  MessageCircle,
  AlertCircle,
  Upload,
  CheckCircle2,
  FileText,
  FileSignature,
  Banknote,
  MessageSquare,
  ExternalLink,
  Send,
} from "lucide-react";

import type { TActivityLogEntry, TActivityLogType } from "@/types/contracts.types";
import {
  ACTIVITY_LOG_TYPE,
  ACTIVITY_SYSTEM_TYPES,
} from "@/constants/contracts";
import { formatActivityTimeVN } from "@/lib/format";

const ACTIVITY_ICON_MAP: Record<TActivityLogType, ElementType> = {
  [ACTIVITY_LOG_TYPE.MESSAGE]: MessageCircle,
  [ACTIVITY_LOG_TYPE.SYSTEM_EVENT]: AlertCircle,
  [ACTIVITY_LOG_TYPE.IMAGE_UPLOAD]: Upload,
  [ACTIVITY_LOG_TYPE.APPROVAL]: CheckCircle2,
  [ACTIVITY_LOG_TYPE.CONTRACT_CREATED]: FileText,
  [ACTIVITY_LOG_TYPE.CONTRACT_SIGNED]: FileSignature,
  [ACTIVITY_LOG_TYPE.DISBURSEMENT]: Banknote,
};

const ACTIVITY_COLOR_MAP: Record<TActivityLogType, string> = {
  [ACTIVITY_LOG_TYPE.MESSAGE]: "text-primary",
  [ACTIVITY_LOG_TYPE.SYSTEM_EVENT]: "text-secondary",
  [ACTIVITY_LOG_TYPE.IMAGE_UPLOAD]: "text-warning",
  [ACTIVITY_LOG_TYPE.APPROVAL]: "text-success",
  [ACTIVITY_LOG_TYPE.CONTRACT_CREATED]: "text-secondary",
  [ACTIVITY_LOG_TYPE.CONTRACT_SIGNED]: "text-success",
  [ACTIVITY_LOG_TYPE.DISBURSEMENT]: "text-success",
};

type TActivityLogEntryProps = {
  entry: TActivityLogEntry;
};

const ActivityLogEntry = ({ entry }: TActivityLogEntryProps) => {
  const Icon = ACTIVITY_ICON_MAP[entry.type];
  const iconColor = ACTIVITY_COLOR_MAP[entry.type];
  const isSystemEvent = (ACTIVITY_SYSTEM_TYPES as readonly string[]).includes(
    entry.type
  );

  const systemMessageClass =
    entry.type === ACTIVITY_LOG_TYPE.DISBURSEMENT
      ? "bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400"
      : entry.type === ACTIVITY_LOG_TYPE.APPROVAL ||
          entry.type === ACTIVITY_LOG_TYPE.CONTRACT_SIGNED
        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
        : "bg-default-100 text-default-700";

  return (
    <div className="flex gap-3 py-3">
      <div className="flex flex-col items-center">
        <div
          className={`p-1.5 rounded-full ${isSystemEvent ? "bg-default-100" : "bg-primary-100 dark:bg-primary-900/30"}`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1 w-px bg-default-200 mt-2" />
      </div>

      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{entry.userName}</span>
          <span className="text-xs text-default-400">
            {formatActivityTimeVN(entry.timestamp)}
          </span>
        </div>

        {entry.systemMessage && (
          <div
            className={`mt-1 text-sm px-3 py-2 rounded-lg ${systemMessageClass}`}
          >
            {entry.systemMessage}
          </div>
        )}

        {entry.content && (
          <div className="mt-1 text-sm text-default-700 whitespace-pre-wrap">
            {entry.content}
          </div>
        )}

        {entry.links && entry.links.length > 0 && (
          <div className="mt-2 space-y-1">
            {entry.links.map((link, index) => (
              <Link
                key={index}
                isExternal
                className="text-xs flex items-center gap-1 text-primary"
                href={link}
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate max-w-[300px]">{link}</span>
              </Link>
            ))}
          </div>
        )}

        {entry.images && entry.images.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-1">
            {entry.images.slice(0, 4).map((img, index) => (
              <div
                key={index}
                className="aspect-square rounded overflow-hidden border border-default-200"
              >
                <Image
                  alt={`Ảnh ${index + 1}`}
                  classNames={{
                    wrapper: "w-full h-full",
                    img: "w-full h-full object-cover",
                  }}
                  src={img}
                />
              </div>
            ))}
            {entry.images.length > 4 && (
              <div className="aspect-square rounded bg-default-100 flex items-center justify-center text-sm text-default-500">
                +{entry.images.length - 4}
              </div>
            )}
          </div>
        )}

        {entry.mentions && entry.mentions.length > 0 && (
          <div className="mt-1 flex gap-1 flex-wrap">
            {entry.mentions.map((mention, index) => (
              <Chip
                key={index}
                className="text-xs"
                color="primary"
                size="sm"
                variant="flat"
              >
                @{mention}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

type TProps = {
  entries: TActivityLogEntry[];
};

const ActivityLogSection = ({ entries }: TProps) => {
  const [inputValue, setInputValue] = useState("");

  if (!entries || entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-default-400">
        <MessageSquare className="w-8 h-8 mr-2" />
        <span>Chưa có trao đổi</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 h-full overflow-y-auto p-2">
        {entries.map((entry) => (
          <ActivityLogEntry key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-default-200">
        <div className="flex gap-2 p-2">
          <Input
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <Button
            isIconOnly
            color="primary"
            onPress={() => {
              // TODO: Send message
              setInputValue("");
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogSection;
