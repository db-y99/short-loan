"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
} from "@heroui/react";
import { Download, ImageIcon } from "lucide-react";

type TProps = {
  images: string[];
};

const getDownloadFilename = (url: string, index: number): string => {
  try {
    const pathname = new URL(url, "http://dummy").pathname;
    const basename = pathname.split("/").pop();
    if (basename && basename.includes(".")) return basename;
  } catch {
    // ignore
  }
  return `anh-tai-san-${index + 1}.jpg`;
};

const AssetGallery = ({ images }: TProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleOpenPreview = (image: string, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handleDownloadImage = () => {
    if (!selectedImage) return;
    const link = document.createElement("a");
    link.href = selectedImage;
    link.download = getDownloadFilename(selectedImage, selectedIndex);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!images.length) {
    return (
      <div className="flex items-center justify-center py-8 text-default-400">
        <ImageIcon className="w-8 h-8 mr-2" />
        <span>Chưa có ảnh tài sản</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <p className="text-xs text-default-400 mb-2">
          {images.length} ảnh tài sản
        </p>
        <Button
          color="primary"
          variant="light"
        >
          Thêm ảnh
        </Button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            className="relative aspect-square rounded-lg overflow-hidden border border-default-200 hover:border-primary transition-colors cursor-pointer group"
            onClick={() => handleOpenPreview(image, index)}
          >
            <Image
              alt={`Ảnh ${index + 1}`}
              classNames={{
                wrapper: "!max-w-full h-full",
                img: "w-full h-full object-cover",
              }}
              src={image}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                Ảnh {index + 1}
              </span>
            </div>
          </button>
        ))}
      </div>

      {
        selectedImage && (<Modal
          isOpen={!!selectedImage}
          scrollBehavior="inside"
          size="5xl"
          onClose={handleClose}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Ảnh tài sản {selectedImage ? `(${selectedIndex + 1}/${images.length})` : ""}
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
                    startContent={<Download size={16} />}
                    variant="flat"
                    onPress={handleDownloadImage}
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
        </Modal>)
      }
    </>
  );
};

export default AssetGallery;
