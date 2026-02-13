"use client";

import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Trash2, UserPlus } from "lucide-react";
import type { TReference } from "@/types/loan.types";

type TProps = {
  references: TReference[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChangeRef: (id: string, field: keyof TReference, value: string) => void;
};

const ReferencesSection = ({
  references,
  onAdd,
  onRemove,
  onChangeRef,
}: TProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Người tham chiếu</h3>
        <Button
          color="primary"
          startContent={<UserPlus size={16} />}
          variant="flat"
          onPress={onAdd}
        >
          Thêm người
        </Button>
      </div>
      <Divider />

      {references.length === 0 && (
        <p className="text-default-400 text-center py-4">
          Chưa có người tham chiếu nào
        </p>
      )}

      {references.map((ref) => (
        <div
          key={ref.id}
          className="flex flex-col gap-3 p-4 rounded-lg border border-default-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Họ tên"
              placeholder="Nguyễn Văn B"
              value={ref.full_name}
              onValueChange={(v) => onChangeRef(ref.id, "full_name", v)}
            />
            <Input
              label="Số điện thoại"
              placeholder="0901234567"
              type="tel"
              value={ref.phone}
              onValueChange={(v) => onChangeRef(ref.id, "phone", v)}
            />
            <Input
              label="Mối quan hệ"
              placeholder="Bạn bè, đồng nghiệp..."
              value={ref.relationship}
              onValueChange={(v) => onChangeRef(ref.id, "relationship", v)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              color="danger"
              startContent={<Trash2 size={16} />}
              variant="light"
              onPress={() => onRemove(ref.id)}
            >
              Xóa
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReferencesSection;
