"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Image } from "@heroui/react";
import {
  Download,
  ImageIcon,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { addToast } from "@heroui/toast";
import pMap from "p-map";

import { TAssetImage } from "@/types/loan.types";
import ConfirmModal from "@/components/confirm-modal";
import DeferredDriveThumb from "@/components/loan-details/deferred-drive-thumb.client";
import { UPLOAD_CONCURRENCY } from "@/constants/google-drive";
import {
  getUploadErrorMessage,
  parseUploadResponse,
} from "@/lib/parse-upload-response";

type TProps = {
  assetImages: TAssetImage[];
  loanId: string;
  canManageImages?: boolean;
  onRefresh?: () => void;
};

type TPreviewImage = {
  file: File;
  preview: string;
};

const AssetGallery = ({
  assetImages,
  loanId,
  canManageImages = false,
  onRefresh,
}: TProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [localImages, setLocalImages] = useState<TAssetImage[]>(assetImages);
  const [deleteTarget, setDeleteTarget] = useState<TAssetImage | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [previewImages, setPreviewImages] = useState<TPreviewImage[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalImages(assetImages);
  }, [assetImages]);

  const displayImages = localImages.map((image) => image.fileId);

  const handleOpenPreview = (image: string, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < displayImages.length - 1;

  const goToImage = (index: number) => {
    const fileId = displayImages[index];

    if (!fileId) return;
    setSelectedIndex(index);
    setSelectedImage(`/api/drive/image/${fileId}`);
  };

  const handlePrev = () => {
    if (hasPrev) goToImage(selectedIndex - 1);
  };

  const handleNext = () => {
    if (hasNext) goToImage(selectedIndex + 1);
  };

  // Handle keyboard + prevent body scroll when image viewer is open
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();

        return;
      }
      if (displayImages.length <= 1) return;
      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        e.preventDefault();
        goToImage(selectedIndex - 1);
      }
      if (e.key === "ArrowRight" && selectedIndex < displayImages.length - 1) {
        e.preventDefault();
        goToImage(selectedIndex + 1);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, selectedIndex, displayImages]);

  const handleDownloadImage = () => {
    if (!selectedImage) return;
    const fileId = localImages[selectedIndex].fileId;

    const link = document.createElement("a");

    link.href = `/api/drive/download/${fileId}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleRequestDelete = (image: TAssetImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteTarget(image);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/assets/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        const deletedIndex = localImages.findIndex(
          (img) => img.id === deleteTarget.id,
        );
        const newImages = localImages.filter(
          (img) => img.id !== deleteTarget.id,
        );

        setLocalImages(newImages);

        addToast({
          title: "Đã xóa",
          description:
            "Ảnh đã được gỡ khỏi danh sách. File trên Drive vẫn được giữ.",
          color: "success",
        });

        if (selectedImage) {
          if (newImages.length === 0) {
            handleClose();
          } else {
            const nextIndex = Math.min(deletedIndex, newImages.length - 1);

            goToImage(nextIndex);
          }
        }

        onRefresh?.();
      } else {
        addToast({
          title: "Lỗi",
          description: result.error || "Không thể xóa ảnh",
          color: "danger",
        });
        onRefresh?.();
      }
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Không thể xóa ảnh",
        color: "danger",
      });
      console.error(error);
      onRefresh?.();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
    setMessage(null);
    setPreviewImages([]);
  };

  const handlePickImages = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const newPreviews: TPreviewImage[] = [];

    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);

      newPreviews.push({ file, preview });
    });

    setPreviewImages([...previewImages, ...newPreviews]);
    setMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePreviewImage = (index: number) => {
    const newPreviews = [...previewImages];

    URL.revokeObjectURL(newPreviews[index].preview);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleCancelUpload = () => {
    if (isUploading) return;

    previewImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setPreviewImages([]);
    setIsUploadModalOpen(false);
    setMessage(null);
  };

  const handleConfirmUpload = async () => {
    if (previewImages.length === 0) return;

    const total = previewImages.length;

    setIsUploading(true);
    setUploadProgress({ current: 0, total });
    setMessage(null);

    let completedCount = 0;

    try {
      // 1 file / request, chạy song song (p-map) — tránh payload lớn + nhanh hơn
      const results = await pMap(
        previewImages,
        async (img) => {
          const formData = new FormData();

          formData.append("loanId", loanId);
          formData.append("file", img.file);

          const response = await fetch("/api/assets/upload-images", {
            method: "POST",
            body: formData,
          });

          const result = await parseUploadResponse<{
            success?: boolean;
            error?: string;
            data?: TAssetImage[];
          }>(response);

          if (!response.ok || !result?.success) {
            throw new Error(
              getUploadErrorMessage(response, result, img.file.name),
            );
          }

          completedCount += 1;
          setUploadProgress({ current: completedCount, total });

          return result.data ?? [];
        },
        { concurrency: UPLOAD_CONCURRENCY },
      );

      const uploadedImages = results.flat();

      addToast({
        title: "Thành công",
        description: `Đã upload ${uploadedImages.length} ảnh thành công!`,
        color: "success",
      });

      setLocalImages((prev) => [...prev, ...uploadedImages]);

      previewImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setPreviewImages([]);
      setIsUploadModalOpen(false);
      setMessage(null);
      onRefresh?.();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Lỗi khi upload ảnh",
      });
      console.error(error);
      // Partial uploads đã vào DB/Drive — refresh để đồng bộ UI
      if (completedCount > 0) {
        onRefresh?.();
      }
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <p className="text-xs text-default-400 mb-2">
          {displayImages.length} ảnh tài sản
        </p>
        {canManageImages && (
          <Button
            color="primary"
            size="sm"
            startContent={<Upload className="w-4 h-4" />}
            variant="light"
            onPress={handleUploadClick}
          >
            Thêm ảnh
          </Button>
        )}
      </div>

      {!displayImages.length && (
        <div className="flex items-center justify-center py-8 text-default-400">
          <ImageIcon className="w-8 h-8 mr-2" />
          <span>Chưa có ảnh tài sản</span>
        </div>
      )}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {localImages.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-default-200 hover:border-primary transition-colors group"
            >
              <button
                className="absolute inset-0 w-full h-full cursor-pointer"
                type="button"
                onClick={() =>
                  handleOpenPreview(`/api/drive/image/${image.fileId}`, index)
                }
              >
                <DeferredDriveThumb
                  alt={`Ảnh ${index + 1}`}
                  fileId={image.fileId}
                  priority={index < 3}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Ảnh {index + 1}
                </span>
              </button>
              {canManageImages && (
                <button
                  aria-label={`Xóa ảnh ${index + 1}`}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-danger text-white hover:bg-danger-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10"
                  type="button"
                  onClick={(e) => handleRequestDelete(image, e)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Overlay */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] bg-content1 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <span className="font-semibold">
                {isUploading
                  ? "Đang upload ảnh..."
                  : `Chọn ảnh để upload (${previewImages.length} ảnh)`}
              </span>
              <button
                className="p-2 rounded-lg hover:bg-default-100 transition-colors"
                disabled={isUploading}
                type="button"
                onClick={handleCancelUpload}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <input
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handleFileChange}
              />
              {message && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg mb-3 ${
                    message.type === "success"
                      ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                      : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              {previewImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-default-400">
                  <button
                    className="flex flex-col items-center justify-center w-full max-w-xl p-12 border-2 border-dashed border-default-300 rounded-xl hover:border-primary hover:bg-default-50 transition-all cursor-pointer"
                    type="button"
                    onClick={handlePickImages}
                  >
                    <Upload className="w-16 h-16 mb-4 text-default-400" />
                    <p className="text-lg font-medium mb-2">
                      Click để chọn ảnh
                    </p>
                    <p className="text-sm text-default-400">
                      Hỗ trợ nhiều ảnh cùng lúc
                    </p>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {previewImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-default-200 group hover:border-primary transition-colors"
                      >
                        <img
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          src={img.preview}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none" />

                        {!isUploading && (
                          <button
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-danger text-white hover:bg-danger-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10"
                            type="button"
                            onClick={() => handleRemovePreviewImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded max-w-[calc(100%-1rem)] truncate z-10">
                          {img.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isUploading && (
                    <button
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-default-300 rounded-xl hover:border-primary hover:bg-default-50 transition-all cursor-pointer text-sm font-medium"
                      type="button"
                      onClick={handlePickImages}
                    >
                      <Upload className="w-4 h-4" />
                      Thêm ảnh khác
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-divider">
              <Button
                isDisabled={isUploading}
                variant="flat"
                onPress={handleCancelUpload}
              >
                {isUploading ? "Đang upload..." : "Hủy"}
              </Button>
              <Button
                color="primary"
                isDisabled={previewImages.length === 0 || isUploading}
                startContent={
                  isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )
                }
                onPress={handleConfirmUpload}
              >
                {isUploading
                  ? `Đang upload ${uploadProgress.current}/${uploadProgress.total}...`
                  : `Upload ${previewImages.length} ảnh`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image View Overlay */}
      {selectedImage && (
        <div className="fixed inset-0 z-[9999]">
          <button
            aria-label="Đóng xem ảnh"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            type="button"
            onClick={handleClose}
          />
          <div className="relative z-10 flex h-full items-center justify-center p-4">
            <div
              className="relative max-w-7xl w-full mx-4 bg-content1 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "90vh" }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-content1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {displayImages.length > 1 && (
                    <>
                      <button
                        aria-label="Ảnh trước"
                        className="p-2 rounded-lg hover:bg-default-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!hasPrev}
                        type="button"
                        onClick={handlePrev}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        aria-label="Ảnh sau"
                        className="p-2 rounded-lg hover:bg-default-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!hasNext}
                        type="button"
                        onClick={handleNext}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <h3 className="text-lg font-semibold">
                    Ảnh tài sản ({selectedIndex + 1}/{displayImages.length})
                  </h3>
                </div>
                <button
                  aria-label="Đóng"
                  className="p-2 rounded-lg hover:bg-default-100 transition-colors"
                  type="button"
                  onClick={handleClose}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 overflow-auto flex items-center justify-center p-6 bg-content2 min-h-0">
                {displayImages.length > 1 && (
                  <>
                    <button
                      aria-label="Ảnh trước"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={!hasPrev}
                      type="button"
                      onClick={handlePrev}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      aria-label="Ảnh sau"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={!hasNext}
                      type="button"
                      onClick={handleNext}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <img
                  key={selectedImage}
                  alt={`Ảnh tài sản ${selectedIndex + 1}`}
                  className="max-w-full object-contain"
                  src={selectedImage}
                  style={{ maxHeight: "calc(90vh - 140px)" }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-divider bg-content1 flex-shrink-0">
                {displayImages.length > 1 ? (
                  <p className="text-xs text-default-500">
                    Dùng ← → hoặc nút mũi tên để chuyển ảnh
                  </p>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    color="primary"
                    startContent={<Download size={16} />}
                    variant="flat"
                    onPress={handleDownloadImage}
                  >
                    Tải xuống
                  </Button>
                  {canManageImages && (
                    <Button
                      color="danger"
                      isDisabled={isDeleting}
                      startContent={
                        isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )
                      }
                      variant="flat"
                      onPress={() =>
                        handleRequestDelete(localImages[selectedIndex])
                      }
                    >
                      Xóa ảnh
                    </Button>
                  )}
                  <Button color="danger" variant="light" onPress={handleClose}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        confirmColor="danger"
        confirmText="Xóa"
        isLoading={isDeleting}
        isOpen={isDeleteConfirmOpen}
        message={
          "Bạn có chắc muốn xóa ảnh này?\n\nẢnh sẽ được gỡ khỏi danh sách nhưng file trên Drive vẫn được giữ lại."
        }
        title="Xóa ảnh tài sản"
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteConfirmOpen(false);
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default AssetGallery;
