"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { Loader2, UserCog, CheckCircle, XCircle } from "lucide-react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { CCCD_ISSUE_PLACE } from "@/constants/loan";
import { formatNumberInput } from "@/lib/format";
import type { TCustomerFormData } from "@/types/customer.types";
import {parseDateString} from "@/lib/format"

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerData: TCustomerFormData;
  onSuccess?: () => void;
};

const EditCustomerModal = ({
  isOpen,
  onClose,
  customerId,
  customerData,
  onSuccess,
}: TProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    full_name: customerData.fullName,
    cccd: customerData.cccd,
    phone: customerData.phone,
    address: customerData.address,
    cccd_issue_date: customerData.cccdIssueDate,
    cccd_issue_place: customerData.cccdIssuePlace,
    facebook_link: customerData.facebookUrl || "",
    job: customerData.job,
    income: customerData.income ? formatNumberInput(String(customerData.income)) : "",
  });


  // Update form when customerData changes
  useEffect(() => {
    setFormData({
      full_name: customerData.fullName,
      cccd: customerData.cccd,
      phone: customerData.phone,
      address: customerData.address,
      cccd_issue_date: customerData.cccdIssueDate,
      cccd_issue_place: customerData.cccdIssuePlace,
      facebook_link: customerData.facebookUrl || "",
      job: customerData.job,
      income: customerData.income ? formatNumberInput(String(customerData.income)) : "",
    });
  }, [customerData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.full_name.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập họ tên" });
      return;
    }
    if (!formData.cccd.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập số CCCD" });
      return;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập số điện thoại" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      console.log({formData})
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          cccd: formData.cccd,
          phone: formData.phone,
          address: formData.address,
          cccd_issue_date: formData.cccd_issue_date,
          cccd_issue_place: formData.cccd_issue_place,
          facebook_link: formData.facebook_link,
          job: formData.job,
          income: formData.income ? parseFloat(formData.income.replace(/[.,]/g, "")) : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Cập nhật thông tin khách hàng thành công!",
        });

        // Call success callback
        if (onSuccess) {
            onSuccess();
            onClose();
            setMessage(null);
        }
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi cập nhật thông tin" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage(null);
      onClose();
    }
  };

  const handleDateChange = (date: any) => {
    if (!date) {
      setFormData({ ...formData, cccd_issue_date: "" });
      return;
    }

    // Chuyển sang ISO yyyy-mm-dd để lưu
    const isoDate = date.toString();
    const updatedData = { ...formData, cccd_issue_date: isoDate };

    // So sánh với 01/07/2024
    const cutoffDate = new Date("2024-07-01");
    const selectedDate = new Date(isoDate);

    if (selectedDate >= cutoffDate) {
      updatedData.cccd_issue_place = CCCD_ISSUE_PLACE.MINISTRY_OF_PUBLIC_SECURITY;
    } else {
      updatedData.cccd_issue_place = CCCD_ISSUE_PLACE.POLICE_ADMIN;
    }

    setFormData(updatedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            <span>Sửa thông tin khách hàng</span>
          </ModalHeader>

          <ModalBody className="gap-4">
            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  message.type === "success"
                    ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                    : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ tên"
                placeholder="Nguyễn Văn A"
                value={formData.full_name}
                onValueChange={(value) =>
                  setFormData({ ...formData, full_name: value })
                }
                isRequired
                isDisabled={isSubmitting}
              />

              <Input
                label="Số CCCD"
                placeholder="001234567890"
                value={formData.cccd}
                onValueChange={(value) =>
                  setFormData({ ...formData, cccd: value })
                }
                isRequired
                isDisabled={isSubmitting}
              />

              <Input
                label="Số điện thoại"
                placeholder="0901234567"
                type="tel"
                value={formData.phone}
                onValueChange={(value) =>
                  setFormData({ ...formData, phone: value })
                }
                isRequired
                isDisabled={isSubmitting}
              />

              <DatePicker
                label="Ngày cấp CCCD"
                showMonthAndYearPickers
                maxValue={today(getLocalTimeZone())}
                value={formData.cccd_issue_date ? parseDateString(formData.cccd_issue_date) : null}
                onChange={handleDateChange}
                isDisabled={isSubmitting}
              />

              <Input
                label="Nơi cấp"
                placeholder="Cục Cảnh sát QLHC về TTXH"
                value={formData.cccd_issue_place}
                onValueChange={(value) =>
                  setFormData({ ...formData, cccd_issue_place: value })
                }
                isDisabled={isSubmitting}
              />

              <Input
                label="Link Facebook"
                placeholder="https://facebook.com/..."
                type="url"
                value={formData.facebook_link}
                onValueChange={(value) =>
                  setFormData({ ...formData, facebook_link: value })
                }
                isDisabled={isSubmitting}
              />

              <Input
                label="Công việc"
                placeholder="Nhân viên văn phòng"
                value={formData.job}
                onValueChange={(value) =>
                  setFormData({ ...formData, job: value })
                }
                isDisabled={isSubmitting}
              />

              <Input
                label="Thu nhập"
                placeholder="10.000.000"
                value={formData.income}
                onValueChange={(value) =>
                  setFormData({ ...formData, income: formatNumberInput(value) })
                }
                isDisabled={isSubmitting}
              />
            </div>

            <Input
              label="Địa chỉ"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              value={formData.address}
              onValueChange={(value) =>
                setFormData({ ...formData, address: value })
              }
              isDisabled={isSubmitting}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={handleClose}
              isDisabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              type="submit"
              startContent={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCog className="w-4 h-4" />
                )
              }
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditCustomerModal;
