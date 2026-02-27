"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useCallback, useState } from "react";

import CustomerInfoSection from "./customer-info-section.client";
import BankInfoSection from "./bank-info-section.client";
import LoanInfoSection from "./loan-info-section.client";
import ReferencesSection from "./references-section.client";
import AttachmentsSection from "./attachments-section.client";
import { createLoanAction } from "@/features/loans/actions/create-loan.action";
import { saveLoanAttachmentsAction } from "@/features/loans/actions/save-loan-attachments.action";
import type { TCreateLoanForm, TReference, TUploadFiles } from "@/types/loan.types";
import { useFileUpload } from "@/hooks/use-file-upload";
import { PROVIDER_TYPES } from "@/constants/google-drive";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const INITIAL_FORM: TCreateLoanForm = {
  full_name: "",
  cccd: "",
  phone: "",
  cccd_issue_date: "",
  cccd_issue_place: "",
  address: "",
  facebook_link: "",
  job: "",
  income: "",
  bank_name: "",
  bank_account_holder: "",
  bank_account_number: "",
  asset_type: "",
  asset_name: "",
  chassis_number: "",
  engine_number: "",
  imei: "",
  serial: "",
  asset_condition: "",
  loan_amount: "",
  loan_type: "",
  notes: "",
  references: [],
  attachments: [],
};

const CreateContractModal = ({ isOpen, onClose, onSuccess }: TProps) => {
  const [form, setForm] = useState<TCreateLoanForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const { uploadFiles, isUploading } = useFileUpload();

  const handleFieldChange = useCallback(
    (field: keyof TCreateLoanForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleAddReference = useCallback(() => {
    const newRef: TReference = {
      id: crypto.randomUUID(),
      full_name: "",
      phone: "",
      relationship: "",
    };

    setForm((prev) => ({
      ...prev,
      references: [...prev.references, newRef],
    }));
  }, []);

  const handleRemoveReference = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      references: prev.references.filter((r) => r.id !== id),
    }));
  }, []);

  const handleChangeReference = useCallback(
    (id: string, field: keyof TReference, value: string) => {
      setForm((prev) => ({
        ...prev,
        references: prev.references.map((r) =>
          r.id === id ? { ...r, [field]: value } : r,
        ),
      }));
    },
    [],
  );

  const handleAddAttachments = useCallback((files: FileList) => {
    const fileArray = Array.from(files);

    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...fileArray],
    }));
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  }, []);

  const handleClose = useCallback(() => {
    setForm(INITIAL_FORM);
    setError(null);
    setUploadProgress("");
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // 1) Tạo loan trước (CHƯA có attachments)
      const payload = {
        full_name: form.full_name,
        cccd: form.cccd,
        phone: form.phone,
        cccd_issue_date: form.cccd_issue_date,
        cccd_issue_place: form.cccd_issue_place,
        address: form.address,
        facebook_link: form.facebook_link,
        job: form.job,
        income: form.income,
        bank_name: form.bank_name,
        bank_account_holder: form.bank_account_holder,
        bank_account_number: form.bank_account_number,
        asset_type: form.asset_type,
        asset_name: form.asset_name,
        asset_identity: {
          chassis_number: form.chassis_number,
          engine_number: form.engine_number,
          imei: form.imei,
          serial: form.serial,
        },
        asset_condition: form.asset_condition || null,
        loan_amount: form.loan_amount,
        loan_type: form.loan_type,
        notes: form.notes,
        references: form.references.map((r) => ({
          full_name: r.full_name,
          phone: r.phone,
          relationship: r.relationship || null,
        })),
      };

      const result = await createLoanAction(payload);

      if (result.success) {
        // 2) Upload files vào đúng folder đã tạo
        let uploadedFiles: TUploadFiles[] = [];

        if (form.attachments.length > 0) {
          setUploadProgress(`Đang upload ${form.attachments.length} file...`);
          const results = await uploadFiles(form.attachments, {
            folderId: result.data.folderId,
          });

          uploadedFiles = results.map((r) => ({
            name: r.fileName,
            provider: PROVIDER_TYPES.GOOGLE_DRIVE,
            file_id: r.fileId,
          }));
        }

        // 3) Save attachments vào DB
        if (uploadedFiles.length > 0) {
          setUploadProgress("Đang lưu attachments...");
          const saveRes = await saveLoanAttachmentsAction({
            loanId: result.data.id,
            attachments: uploadedFiles,
          });
          if (!saveRes.success) {
            setError(saveRes.error);
            return;
          }
        }

        handleClose();
        onSuccess?.();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  }, [form, handleClose, onSuccess, uploadFiles]);


  const isLoading = isSubmitting || isUploading;

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Tạo hợp đồng mới
        </ModalHeader>

        <ModalBody className="flex flex-col gap-8">
          {error && (
            <div className="rounded-lg bg-danger-50 px-4 py-3 text-danger text-sm">
              {error}
            </div>
          )}
          <CustomerInfoSection form={form} onChange={handleFieldChange} />
          <BankInfoSection form={form} onChange={handleFieldChange} />
          <LoanInfoSection form={form} onChange={handleFieldChange} />
          <ReferencesSection
            references={form.references}
            onAdd={handleAddReference}
            onChangeRef={handleChangeReference}
            onRemove={handleRemoveReference}
          />
          <AttachmentsSection
            attachments={form.attachments}
            onAdd={handleAddAttachments}
            onRemove={handleRemoveAttachment}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={handleClose}
            isDisabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            {isLoading ? "Đang tạo hợp đồng..." : "Tạo hợp đồng"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateContractModal;
