"use client";

import { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
} from "@heroui/react";
import { Download, ImageIcon, Upload, Loader2, CheckCircle, XCircle, X } from "lucide-react";
import { TAssetImage } from "@/types/loan.types";

type TProps = {
  assetImages: TAssetImage[];
  loanId: string;
};

type TPreviewImage = {
  file: File;
  preview: string;
};

const AssetGallery = ({ assetImages, loanId }: TProps) => {
  const images = assetImages.map((image) => image.fileId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [localImages, setLocalImages] = useState<TAssetImage[]>(assetImages);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [previewImages, setPreviewImages] = useState<TPreviewImage[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPreview = (image: string, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

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

  const handleUploadClick = () => {
    // Mở modal trước, không trigger file input ngay
    setIsUploadModalOpen(true);
    setMessage(null);
    setPreviewImages([]);
  };

  const handleSelectFiles = () => {
    // Trigger file input khi click vào vùng chọn ảnh trong modal
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Tạo preview cho các ảnh mới và CỘNG THÊM vào danh sách hiện tại
    const newPreviews: TPreviewImage[] = [];
    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);
      newPreviews.push({ file, preview });
    });

    // Cộng thêm vào danh sách cũ thay vì reset
    setPreviewImages([...previewImages, ...newPreviews]);
    setMessage(null);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePreviewImage = (index: number) => {
    const newPreviews = [...previewImages];
    // Revoke URL để giải phóng memory
    URL.revokeObjectURL(newPreviews[index].preview);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleCancelUpload = () => {
    if (isUploading) return; // Không cho đóng khi đang upload
    
    // Revoke tất cả URLs
    previewImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setPreviewImages([]);
    setIsUploadModalOpen(false);
    setMessage(null);
  };

  const handleConfirmUpload = async () => {
    if (previewImages.length === 0) return;

    setIsUploading(true);
    setMessage(null);

    try {
      // Tạo FormData với tất cả files
      const formData = new FormData();
      formData.append("loanId", loanId);
      previewImages.forEach((img, index) => {
        formData.append(`file_${index}`, img.file);
      });

      // Gọi API route
      const response = await fetch("/api/assets/upload-images", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({
          type: "success",
          text: `Đã upload ${result.data.length} ảnh thành công!`,
        });
        
        // Cập nhật local state
        setLocalImages([...localImages, ...result.data]);
        
        // Đóng modal sau 1.5s
        setTimeout(() => {
          // Cleanup preview URLs
          previewImages.forEach((img) => URL.revokeObjectURL(img.preview));
          setPreviewImages([]);
          setIsUploadModalOpen(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Lỗi khi upload ảnh" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi upload ảnh" });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const displayImages = localImages.map((image) => image.fileId);

  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <p className="text-xs text-default-400 mb-2">
          {displayImages.length} ảnh tài sản
        </p>
        <Button
          color="primary"
          variant="light"
          size="sm"
          startContent={<Upload className="w-4 h-4" />}
          onPress={handleUploadClick}
        >
          Thêm ảnh
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {!displayImages.length && (
        <div className="flex items-center justify-center py-8 text-default-400">
          <ImageIcon className="w-8 h-8 mr-2" />
          <span>Chưa có ảnh tài sản</span>
        </div>
      )}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              type="button"
              className="relative aspect-square rounded-lg overflow-hidden border border-default-200 hover:border-primary transition-colors cursor-pointer group"
              onClick={() =>
                handleOpenPreview(`/api/drive/image/${image}`, index)
              }
            >
              <Image
                alt={`Ảnh ${index + 1}`}
                classNames={{
                  wrapper: "!max-w-full h-full",
                  img: "w-full h-full object-cover",
                }}
                src={`/api/drive/image/${image}`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Ảnh {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Upload Modal - Chọn ảnh, preview và upload */}
      <Modal
        isOpen={isUploadModalOpen}
        scrollBehavior="inside"
        size="4xl"
        isDismissable={!isUploading}
        hideCloseButton={isUploading}
        onClose={handleCancelUpload}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                  <span>
                    {isUploading
                      ? "Đang upload ảnh..."
                      : `Chọn ảnh để upload (${previewImages.length} ảnh)`}
                  </span>
                  {!isUploading && previewImages.length > 0 && (
                    <p className="text-sm text-default-500 font-normal">
                      Nhấn vào dấu X để xóa ảnh không muốn upload
                    </p>
                  )}
                </div>
              </ModalHeader>
              <ModalBody>
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
                      type="button"
                      onClick={handleSelectFiles}
                      disabled={isUploading}
                      className="flex flex-col items-center justify-center w-full max-w-xl p-12 border-2 border-dashed border-default-300 rounded-xl hover:border-primary hover:bg-default-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          {/* Overlay khi hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none" />
                          
                          {/* Nút xóa - hiện khi hover */}
                          {!isUploading && (
                            <button
                              type="button"
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-danger text-white hover:bg-danger-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10"
                              onClick={() => handleRemovePreviewImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Tên file */}
                          <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded max-w-[calc(100%-1rem)] truncate z-10">
                            {img.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isUploading && (
                      <Button
                        variant="bordered"
                        className="w-full"
                        startContent={<Upload className="w-4 h-4" />}
                        onPress={handleSelectFiles}
                      >
                        Thêm ảnh khác
                      </Button>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={handleCancelUpload}
                  isDisabled={isUploading}
                >
                  {isUploading ? "Đang upload..." : "Hủy"}
                </Button>
                <Button
                  color="primary"
                  isDisabled={previewImages.length === 0 || isUploading}
                  onPress={handleConfirmUpload}
                  startContent={
                    isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )
                  }
                >
                  {isUploading
                    ? `Đang upload ${previewImages.length} ảnh...`
                    : `Upload ${previewImages.length} ảnh`}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Image View Modal - Xem ảnh đã upload */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          scrollBehavior="inside"
          size="5xl"
          onClose={handleClose}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Ảnh tài sản{" "}
                  {selectedImage
                    ? `(${selectedIndex + 1}/${displayImages.length})`
                    : ""}
                </ModalHeader>
                <ModalBody className="flex items-center justify-center p-6">
                  {selectedImage && (
                    <Image
                      alt="Ảnh tài sản"
                      className="max-w-full max-h-[80vh] object-contain"
                      src={selectedImage}
                    />
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={handleDownloadImage}
                    startContent={<Download size={16} />}
                  >
                    Tải xuống
                  </Button>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Đóng
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default AssetGallery;
