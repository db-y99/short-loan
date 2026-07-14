"use client";

import { useEffect, useRef, useState } from "react";
import { Image } from "@heroui/react";
import { ImageIcon } from "lucide-react";

const MAX_CONCURRENT_THUMBS = 3;
let activeThumbs = 0;
const waitQueue: Array<() => void> = [];

const acquireThumbSlot = (): Promise<void> => {
  if (activeThumbs < MAX_CONCURRENT_THUMBS) {
    activeThumbs += 1;

    return Promise.resolve();
  }

  return new Promise((resolve) => {
    waitQueue.push(() => {
      activeThumbs += 1;
      resolve();
    });
  });
};

const releaseThumbSlot = () => {
  activeThumbs = Math.max(0, activeThumbs - 1);
  const next = waitQueue.shift();

  if (next) next();
};

type TProps = {
  fileId: string;
  alt: string;
  /** Ảnh đầu viewport — bắt đầu load ngay, không xếp hàng */
  priority?: boolean;
};

/**
 * Thumbnail Drive có giới hạn concurrency — tránh 50 request cùng đập API/auth/Drive
 * (modal xem 1 ảnh vẫn nhanh vì không bị tranh bandwidth).
 */
const DeferredDriveThumb = ({ fileId, alt, priority = false }: TProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const holdsSlotRef = useRef(false);
  const releasedRef = useRef(false);

  const releaseOnce = () => {
    if (!holdsSlotRef.current || releasedRef.current) return;
    releasedRef.current = true;
    holdsSlotRef.current = false;
    releaseThumbSlot();
  };

  useEffect(() => {
    let cancelled = false;

    releasedRef.current = false;
    holdsSlotRef.current = false;
    setFailed(false);
    setSrc(null);

    const start = async () => {
      if (!priority) {
        await acquireThumbSlot();
        if (cancelled) {
          releaseThumbSlot();

          return;
        }
        holdsSlotRef.current = true;
      }

      setSrc(`/api/drive/image/${fileId}?thumb=1`);
    };

    void start();

    return () => {
      cancelled = true;
      releaseOnce();
    };
  }, [fileId, priority]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-default-100 text-default-400">
        <ImageIcon className="w-6 h-6" />
      </div>
    );
  }

  if (!src) {
    return <div className="h-full w-full animate-pulse bg-default-100" />;
  }

  return (
    <Image
      alt={alt}
      classNames={{
        wrapper: "!max-w-full h-full",
        img: "w-full h-full object-cover",
      }}
      src={src}
      onError={() => {
        setFailed(true);
        releaseOnce();
      }}
      onLoad={releaseOnce}
    />
  );
};

export default DeferredDriveThumb;
