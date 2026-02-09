"use client";

import { useState } from "react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/button";
import {
  MessageSquare,
  Send,
} from "lucide-react";
import type { TActivityLogEntry } from "@/types/contracts.types";
import ActivityLogEntry from "@/components/contract-details/activity-log-entry";

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
