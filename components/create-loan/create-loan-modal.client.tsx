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
import type {
  TCreateLoanForm,
  TReference,
} from "@/types/loan.types";

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
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("full_name", form.full_name);
      fd.set("cccd", form.cccd);
      fd.set("phone", form.phone);
      fd.set("cccd_issue_date", form.cccd_issue_date);
      fd.set("cccd_issue_place", form.cccd_issue_place);
      fd.set("address", form.address);
      fd.set("facebook_link", form.facebook_link);
      fd.set("job", form.job);
      fd.set("income", form.income);
      fd.set("bank_name", form.bank_name);
      fd.set("bank_account_holder", form.bank_account_holder);
      fd.set("bank_account_number", form.bank_account_number);
      fd.set("asset_type", form.asset_type);
      fd.set("asset_name", form.asset_name);
      fd.set("chassis_number", form.chassis_number);
      fd.set("engine_number", form.engine_number);
      fd.set("imei", form.imei);
      fd.set("serial", form.serial);
      fd.set("loan_amount", form.loan_amount);
      fd.set("loan_type", form.loan_type);
      fd.set("notes", form.notes);
      fd.set(
        "references",
        JSON.stringify(
          form.references.map((r) => ({
            full_name: r.full_name,
            phone: r.phone,
            relationship: r.relationship || null,
          }))
        )
      );

      const result = await createLoanAction(fd);
      if (result.success) {
        handleClose();
        onSuccess?.();
      } else {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, handleClose, onSuccess]);

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
          <Button variant="flat" onPress={handleClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Tạo hợp đồng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateContractModal;
