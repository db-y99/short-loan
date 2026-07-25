"use client";

import type {
  TCreateLoanForm,
  TReference,
  TUploadFiles,
} from "@/types/loan.types";
import type { TBranch } from "@/types/branch.types";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useCallback, useEffect, useState } from "react";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";

import CustomerInfoSection from "./customer-info-section.client";
import BankInfoSection from "./bank-info-section.client";
import LoanInfoSection from "./loan-info-section.client";
import ReferencesSection from "./references-section.client";
import AttachmentsSection from "./attachments-section.client";

import { createLoanAction } from "@/features/loans/actions/create-loan.action";
import { CreateLoanSchema } from "@/features/loans/actions/create-loan.schema";
import { saveLoanAttachmentsAction } from "@/features/loans/actions/save-loan-attachments.action";
import { cleanupDriveFilesAction } from "@/features/loans/actions/cleanup-drive-files.action";
import { useFileUpload } from "@/hooks/use-file-upload";
import { PROVIDER_TYPES } from "@/constants/google-drive";
import { LOAN_TYPES } from "@/constants/loan";
import { zodIssuesToFieldErrors } from "@/lib/zod-field-errors";
import ConfirmModal from "@/components/confirm-modal";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branches?: TBranch[];
  isAdmin?: boolean;
  userBranchName?: string | null;
  initialForm?: TCreateLoanForm | null;
  initialBranchId?: string | null;
  sourceLoanCode?: string | null;
  initialAssetImages?: TUploadFiles[] | null;
  keepAssetImages?: boolean;
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
  loan_type: LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD,
  notes: "",
  references: [],
  attachments: [],
};

const FORM_TEXT_FIELDS = [
  "full_name",
  "cccd",
  "phone",
  "cccd_issue_date",
  "cccd_issue_place",
  "address",
  "facebook_link",
  "job",
  "income",
  "bank_name",
  "bank_account_holder",
  "bank_account_number",
  "asset_type",
  "asset_name",
  "chassis_number",
  "engine_number",
  "imei",
  "serial",
  "asset_condition",
  "loan_amount",
  "notes",
] as const satisfies readonly (keyof TCreateLoanForm)[];

const isCreateLoanFormDirty = (
  form: TCreateLoanForm,
  selectedBranchId: string,
  isAdmin: boolean,
): boolean => {
  if (isAdmin && selectedBranchId.trim() !== "") return true;
  if (form.attachments.length > 0) return true;
  if (form.loan_type !== INITIAL_FORM.loan_type) return true;

  for (const field of FORM_TEXT_FIELDS) {
    const value = form[field];

    if (typeof value === "string" && value.trim() !== "") return true;
  }

  return form.references.length > 0;
};

const CreateContractModal = ({
  isOpen,
  onClose,
  onSuccess,
  branches = [],
  isAdmin = false,
  userBranchName,
  initialForm = null,
  initialBranchId = null,
  sourceLoanCode = null,
  initialAssetImages = null,
  keepAssetImages = false,
}: TProps) => {
  const [form, setForm] = useState<TCreateLoanForm>(INITIAL_FORM);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [keptAssetImages, setKeptAssetImages] = useState<TUploadFiles[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const { uploadFiles, isUploading } = useFileUpload();

  useEffect(() => {
    if (!isOpen) return;

    if (initialForm) {
      setForm(initialForm);
      setSelectedBranchId(initialBranchId ?? "");
      setKeptAssetImages(initialAssetImages ?? []);
    } else {
      setForm(INITIAL_FORM);
      setSelectedBranchId("");
      setKeptAssetImages([]);
    }
    setError(null);
    setFieldErrors({});
    setUploadProgress("");
    setShowDiscardConfirm(false);
  }, [isOpen, initialForm, initialBranchId, initialAssetImages]);

  const handleFieldChange = useCallback(
    (field: keyof TCreateLoanForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };

        delete next[field];

        return next;
      });
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

  const handleRemoveKeptAssetImage = useCallback((index: number) => {
    setKeptAssetImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClose = useCallback(() => {
    setShowDiscardConfirm(false);
    setForm(INITIAL_FORM);
    setSelectedBranchId("");
    setKeptAssetImages([]);
    setError(null);
    setFieldErrors({});
    setUploadProgress("");
    onClose();
  }, [onClose]);

  const handleRequestClose = useCallback(() => {
    if (isSubmitting || isUploading) return;

    if (isCreateLoanFormDirty(form, selectedBranchId, isAdmin)) {
      setShowDiscardConfirm(true);

      return;
    }

    handleClose();
  }, [form, selectedBranchId, isAdmin, isSubmitting, isUploading, handleClose]);

  const handleSubmit = useCallback(async () => {
    setError(null);

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
      asset_condition: form.asset_condition,
      loan_amount: form.loan_amount,
      loan_type: form.loan_type,
      notes: form.notes,
      branch_id: isAdmin ? selectedBranchId || null : null,
      references: form.references.map((r) => ({
        full_name: r.full_name,
        phone: r.phone,
        relationship: r.relationship || null,
      })),
    };

    const parseResult = CreateLoanSchema.safeParse(payload);

    if (!parseResult.success) {
      setFieldErrors(zodIssuesToFieldErrors(parseResult.error.issues));

      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);

    try {
      const result = await createLoanAction(payload);

      if (result.success) {
        // 2) Upload files mới vào folder đã tạo — giữ ảnh cũ (vay lại) + ảnh mới
        let uploadedFiles: TUploadFiles[] = [...keptAssetImages];
        let newlyUploadedFileIds: string[] = [];

        if (form.attachments.length > 0) {
          setUploadProgress(
            `Đang upload 0/${form.attachments.length} file...`,
          );
          const results = await uploadFiles(form.attachments, {
            folderId: result.data.folderId,
            onProgress: (current, total) => {
              setUploadProgress(`Đang upload ${current}/${total} file...`);
            },
          });

          const newFiles = results.map((r) => ({
            name: r.fileName,
            provider: PROVIDER_TYPES.GOOGLE_DRIVE,
            file_id: r.fileId,
          }));

          newlyUploadedFileIds = newFiles.map((f) => f.file_id);
          uploadedFiles = [...keptAssetImages, ...newFiles];
        }

        // 3) Save attachments vào DB
        if (uploadedFiles.length > 0) {
          setUploadProgress("Đang lưu attachments...");
          const saveRes = await saveLoanAttachmentsAction({
            loanId: result.data.id,
            attachments: uploadedFiles,
          });

          if (!saveRes.success) {
            // Chỉ xóa file mới upload — không đụng ảnh cũ đang dùng bởi hợp đồng trước
            if (newlyUploadedFileIds.length > 0) {
              await cleanupDriveFilesAction(newlyUploadedFileIds).catch(
                (cleanupError) => {
                  console.error(
                    "[CREATE_LOAN_ATTACHMENT_CLEANUP_ERROR]",
                    cleanupError,
                  );
                },
              );
            }
            setError(saveRes.error);

            return;
          }
        }

        handleClose();
        onSuccess?.();
      } else if (
        result.fieldErrors &&
        Object.keys(result.fieldErrors).length > 0
      ) {
        setFieldErrors(result.fieldErrors);
      } else {
        setError(result.error ?? "Đã xảy ra lỗi khi tạo hợp đồng");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  }, [
    form,
    keptAssetImages,
    handleClose,
    onSuccess,
    uploadFiles,
    isAdmin,
    selectedBranchId,
  ]);

  const isLoading = isSubmitting || isUploading;

  const [datePickerPortalContainer, setDatePickerPortalContainer] =
    useState<HTMLDivElement | null>(null);
  const setModalContentRef = useCallback((el: HTMLDivElement | null) => {
    setDatePickerPortalContainer(el);
  }, []);

  return (
    <>
      <Modal
        isKeyboardDismissDisabled
        isDismissable={false}
        isOpen={isOpen}
        scrollBehavior="inside"
        size="4xl"
        onClose={handleRequestClose}
      >
        <ModalContent>
          <ModalHeader className="flex gap-2">
            <div>
              {sourceLoanCode
                ? `Tạo đơn vay mới (từ ${sourceLoanCode})`
                : "Tạo hợp đồng mới"}
            </div>
            <Chip
              color={userBranchName ? "primary" : "default"}
              variant="bordered"
            >
              {userBranchName ?? "Chưa được gán chi nhánh"}
            </Chip>
          </ModalHeader>

          <ModalBody ref={setModalContentRef} className="flex flex-col gap-8">
            {sourceLoanCode && (
              <div className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                Thông tin khách hàng, tài sản và ngân hàng đã được điền sẵn từ
                hợp đồng cũ.
                {keepAssetImages
                  ? " Ảnh tài sản cũ đã được giữ lại — bạn có thể bổ sung thêm ảnh mới nếu cần."
                  : " Vui lòng kiểm tra lại và tải ảnh tài sản mới trước khi tạo đơn."}
              </div>
            )}
            {error ? <p className="text-sm text-danger">{error}</p> : null}

            {/* Chi nhánh */}
            {isAdmin ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Chi nhánh</h3>
                <Divider />
                <Select
                  className="max-w-xs"
                  label="Chi nhánh"
                  placeholder="Chọn chi nhánh"
                  selectedKeys={selectedBranchId ? [selectedBranchId] : []}
                  onSelectionChange={(keys) =>
                    setSelectedBranchId((Array.from(keys)[0] as string) || "")
                  }
                >
                  {branches.map((b) => (
                    <SelectItem key={b.id}>{b.name}</SelectItem>
                  ))}
                </Select>
              </div>
            ) : (
              <></>
            )}

            <CustomerInfoSection
              datePickerPortalContainer={datePickerPortalContainer}
              fieldErrors={fieldErrors}
              form={form}
              onChange={handleFieldChange}
            />
            <BankInfoSection form={form} onChange={handleFieldChange} />
            <LoanInfoSection
              fieldErrors={fieldErrors}
              form={form}
              onChange={handleFieldChange}
            />
            <ReferencesSection
              references={form.references}
              onAdd={handleAddReference}
              onChangeRef={handleChangeReference}
              onRemove={handleRemoveReference}
            />
            <AttachmentsSection
              attachments={form.attachments}
              existingImages={keptAssetImages}
              onAdd={handleAddAttachments}
              onRemove={handleRemoveAttachment}
              onRemoveExisting={handleRemoveKeptAssetImage}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              isDisabled={isLoading}
              variant="flat"
              onPress={handleRequestClose}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              isDisabled={isLoading}
              isLoading={isLoading}
              onPress={handleSubmit}
            >
              {isLoading ? "Đang tạo hợp đồng..." : "Tạo hợp đồng"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        cancelText="Tiếp tục nhập"
        confirmColor="danger"
        confirmText="Thoát và xóa dữ liệu"
        isOpen={showDiscardConfirm}
        message="Bạn đã nhập dữ liệu. Nếu thoát, mọi thông tin sẽ bị mất và không thể khôi phục."
        title="Hủy tạo hợp đồng?"
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={handleClose}
      />
    </>
  );
};

export default CreateContractModal;
