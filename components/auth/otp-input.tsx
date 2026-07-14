"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync with parent value
    const otpArray = value.split("").slice(0, length);

    while (otpArray.length < length) {
      otpArray.push("");
    }
    setOtp(otpArray);
  }, [value, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (disabled) return;

    const val = element.value.replace(/\D/g, ""); // Only digits

    if (val.length > 1) return;

    const newOtp = [...otp];

    newOtp[index] = val;
    setOtp(newOtp);

    const otpValue = newOtp.join("");

    onChange(otpValue);

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all fields are filled
    if (otpValue.length === length && onComplete) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (disabled) return;

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    const newOtp = new Array(length).fill("");

    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }

    setOtp(newOtp);
    onChange(pasteData);

    if (pasteData.length === length && onComplete) {
      onComplete(pasteData);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el: HTMLInputElement | null) => {
            inputRefs.current[index] = el;
          }}
          autoComplete="one-time-code"
          className="w-12 h-12 text-center"
          classNames={{
            input: "text-center text-lg font-semibold",
            inputWrapper: "h-12",
          }}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          type="text"
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  onResend?: () => void;
  disabled?: boolean;
}

export function CountdownTimer({
  initialSeconds,
  onComplete,
  onResend,
  disabled = false,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      onComplete?.();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, onComplete]);

  const handleResend = () => {
    if (disabled) return;
    setSeconds(initialSeconds);
    setIsActive(true);
    onResend?.();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between text-sm">
      {seconds > 0 ? (
        <span className="text-default-500">
          Gửi lại mã sau:{" "}
          <span className="font-mono font-semibold text-primary">
            {formatTime(seconds)}
          </span>
        </span>
      ) : (
        <span className="text-default-500">Chưa nhận được mã?</span>
      )}

      <Button
        className="min-w-0 px-2"
        color="primary"
        disabled={disabled || seconds > 0}
        isLoading={disabled && seconds === 0}
        size="sm"
        variant="light"
        onPress={handleResend}
      >
        Gửi lại
      </Button>
    </div>
  );
}

interface OtpExpiryTimerProps {
  expirySeconds: number;
  onExpiry?: () => void;
}

export function OtpExpiryTimer({
  expirySeconds,
  onExpiry,
}: OtpExpiryTimerProps) {
  const [seconds, setSeconds] = useState(expirySeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      onExpiry?.();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [seconds, onExpiry]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const remainingSeconds = time % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getColorClass = () => {
    if (seconds <= 300) return "text-danger"; // Dưới 5 phút
    if (seconds <= 900) return "text-warning"; // Dưới 15 phút

    return "text-success";
  };

  return (
    <div className="text-center">
      <p className="text-xs text-default-500 mb-1">Mã OTP có hiệu lực trong:</p>
      <p className={`text-sm font-mono font-semibold ${getColorClass()}`}>
        {formatTime(seconds)}
      </p>
      {seconds <= 300 && (
        <p className="text-xs text-danger mt-1">
          ⚠️ Mã sắp hết hạn, vui lòng nhập nhanh!
        </p>
      )}
    </div>
  );
}
