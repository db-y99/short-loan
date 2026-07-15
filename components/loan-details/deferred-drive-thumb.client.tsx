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
};

/**
 * Thumbnail Drive có giới hạn concurrency — tránh 50 request cùng đập API/auth/Drive.
 * Effects chạy theo thứ tự grid → vài ảnh đầu thường lấy slot trước.
 * Modal full-size dùng URL không qua component này → không chung hàng đợi.
 */
const DeferredDriveThumb = ({ fileId, alt }: TProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  /** Release gắn lifecycle hiện tại — tránh stale closure / double-free */
  const releaseRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let holdsSlot = false;
    let released = false;

    const releaseOnce = () => {
      if (!holdsSlot || released) return;
      released = true;
      holdsSlot = false;
      releaseThumbSlot();
    };

    releaseRef.current = releaseOnce;

    setFailed(false);
    setSrc(null);

    const start = async () => {
      await acquireThumbSlot();

      // Race: cleanup có thể chạy giữa acquire và gán holdsSlot
      if (cancelled) {
        releaseThumbSlot();

        return;
      }

      holdsSlot = true;

      if (cancelled) {
        releaseOnce();

        return;
      }

      setSrc(`/api/drive/image/${fileId}?thumb=1`);
    };

    void start();

    return () => {
      cancelled = true;
      releaseOnce();
      releaseRef.current = () => {};
    };
  }, [fileId]);

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
        releaseRef.current();
      }}
      onLoad={() => releaseRef.current()}
    />
  );
};

export default DeferredDriveThumb;
