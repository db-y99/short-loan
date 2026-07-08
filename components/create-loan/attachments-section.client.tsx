"use client";

import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import type { TUploadFiles } from "@/types/loan.types";

type TProps = {
  attachments: File[];
  existingImages?: TUploadFiles[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
  onRemoveExisting?: (index: number) => void;
};

const AttachmentsSection = ({
  attachments,
  existingImages = [],
  onAdd,
  onRemove,
  onRemoveExisting,
}: TProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(
    () => attachments.map((file) => URL.createObjectURL(file)),
    [attachments],
  );

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

  const hasAnyImages = existingImages.length > 0 || attachments.length > 0;

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

      {!hasAnyImages ? (
        <p className="text-default-400 text-center py-4">
          Chưa có hình ảnh nào
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {existingImages.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-default-600">
                  Ảnh từ hợp đồng cũ
                </span>
                <Chip size="sm" variant="flat" color="primary">
                  {existingImages.length}
                </Chip>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((image, index) => (
                  <div
                    key={`existing-${image.file_id}-${index}`}
                    className="relative group rounded-lg overflow-hidden border border-primary-200"
                  >
                    <Image
                      alt={image.name ?? "Ảnh tài sản"}
                      className="object-cover w-full h-32"
                      src={`/api/drive/image/${image.file_id}`}
                    />
                    {onRemoveExisting && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <Button
                          isIconOnly
                          aria-label="Xóa ảnh"
                          color="danger"
                          radius="full"
                          variant="solid"
                          onPress={() => onRemoveExisting(index)}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    )}
                    <div className="p-1.5 bg-primary-50">
                      <p className="text-xs text-default-500 truncate">
                        {image.name ?? "Ảnh tài sản"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              {existingImages.length > 0 && (
                <span className="text-sm font-medium text-default-600">
                  Ảnh mới tải lên
                </span>
              )}
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
                    <div className="p-1.5 bg-default-50">
                      <p className="text-xs text-default-500 truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;
