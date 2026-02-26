"use client";

import { Card, CardBody } from "@heroui/card";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

type TErrorDetailsProps = {
  error: string;
};

/**
 * Component hiển thị chi tiết lỗi khi tạo hợp đồng
 * Giúp người dùng debug dễ dàng hơn
 */
export default function ContractErrorDetails({ error }: TErrorDetailsProps) {
  // Parse error để đưa ra gợi ý cụ thể
  const getErrorSuggestion = (errorMsg: string) => {
    const lowerError = errorMsg.toLowerCase();

    if (lowerError.includes("không tìm thấy khoản vay")) {
      return {
        title: "Không tìm thấy khoản vay",
        suggestions: [
          "Kiểm tra ID khoản vay có đúng không",
          "Đảm bảo bạn có quyền truy cập khoản vay này",
          "Thử refresh lại trang",
        ],
      };
    }

    if (lowerError.includes("folder drive") || lowerError.includes("drivefolder")) {
      return {
        title: "Chưa có folder Drive",
        suggestions: [
          "Tạo folder Drive cho khoản vay trước",
          "Liên hệ Admin để được hỗ trợ",
          "Kiểm tra cấu hình Google Drive",
        ],
      };
    }

    if (lowerError.includes("pdf") || lowerError.includes("generate")) {
      return {
        title: "Lỗi tạo PDF",
        suggestions: [
          "Kiểm tra biến môi trường NEXT_PUBLIC_APP_URL",
          "Đảm bảo Chrome đã được cài đặt",
          "Thử lại sau vài giây",
          "Liên hệ IT nếu lỗi vẫn tiếp diễn",
        ],
      };
    }

    if (lowerError.includes("upload") || lowerError.includes("drive")) {
      return {
        title: "Lỗi upload lên Drive",
        suggestions: [
          "Kiểm tra kết nối internet",
          "Kiểm tra cấu hình Google Service Account",
          "Đảm bảo Service Account có quyền write vào folder",
          "Thử lại sau vài giây",
        ],
      };
    }

    if (lowerError.includes("database") || lowerError.includes("db")) {
      return {
        title: "Lỗi database",
        suggestions: [
          "Kiểm tra kết nối Supabase",
          "Thử refresh lại trang",
          "Liên hệ Admin nếu lỗi vẫn tiếp diễn",
        ],
      };
    }

    // Lỗi chung
    return {
      title: "Lỗi không xác định",
      suggestions: [
        "Thử refresh lại trang",
        "Kiểm tra kết nối internet",
        "Xem console (F12) để biết thêm chi tiết",
        "Liên hệ Admin hoặc IT để được hỗ trợ",
      ],
    };
  };

  const errorInfo = getErrorSuggestion(error);

  return (
    <Card className="border-danger-200 bg-danger-50 dark:bg-danger-900/20">
      <CardBody className="space-y-3">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-danger-700 dark:text-danger-400 mb-1">
              {errorInfo.title}
            </h4>
            <p className="text-sm text-danger-600 dark:text-danger-300 mb-3">
              {error}
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-danger-700 dark:text-danger-400">
                <AlertCircle className="w-4 h-4" />
                <span>Gợi ý khắc phục:</span>
              </div>
              <ul className="space-y-1.5 ml-6">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-danger-600 dark:text-danger-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
