"use client";

import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Divider } from "@heroui/divider";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

type TProps = {
  attachments: File[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
};

const AttachmentsSection = ({ attachments, onAdd, onRemove }: TProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tạo preview URLs từ File objects
  const previewUrls = useMemo(
    () => attachments.map((file) => URL.createObjectURL(file)),
    [attachments],
  );

  // Cleanup URLs khi component unmount hoặc attachments thay đổi
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAdd(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hình ảnh đính kèm</h3>
        <Button
          color="primary"
          startContent={<ImagePlus size={16} />}
          variant="flat"
          onPress={handleClick}
        >
          Chọn file
        </Button>
        <input
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          multiple
          type="file"
          onChange={handleFileChange}
        />
      </div>
      <Divider />

      {attachments.length === 0 ? (
        <p className="text-default-400 text-center py-4">
          Chưa có hình ảnh nào
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-default-200"
            >
              <Image
                alt={file.name}
                className="object-cover w-full h-32"
                src={previewUrls[index]}
              />
              {/* Overlay với nút xóa */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <Button
                  isIconOnly
                  aria-label={`Xóa ${file.name}`}
                  color="danger"
                  radius="full"
                  variant="solid"
                  onPress={() => onRemove(index)}
                >
                  <X size={18} />
                </Button>
              </div>
              {/* Tên file */}
              <div className="p-1.5 bg-default-50">
                <p className="text-xs text-default-500 truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;
