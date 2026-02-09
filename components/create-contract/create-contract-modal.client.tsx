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

import type {
  TCreateContractForm,
  TReference,
} from "@/types/contracts.types";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
};

const INITIAL_FORM: TCreateContractForm = {
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

const CreateContractModal = ({ isOpen, onClose }: TProps) => {
  const [form, setForm] = useState<TCreateContractForm>(INITIAL_FORM);

  const handleFieldChange = useCallback(
    (field: keyof TCreateContractForm, value: string) => {
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
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    // TODO: Gọi server action khi có database
    // eslint-disable-next-line no-console
    console.log("Submit form:", form);
    handleClose();
  }, [form, handleClose]);

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
          <Button variant="flat" onPress={handleClose}>
            Hủy
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Tạo hợp đồng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateContractModal;
