"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertCircle, CreditCard, MessageCircle, MessageSquare, ShoppingCart } from "lucide-react";
import type { TContractDetails } from "@/types/contracts.types";
import ContractHeader from "@/components/contract-details/contract-header";
import ContractProfileSection from "@/components/contract-details/contract-profile-section";
import ContractInfoCards from "@/components/contract-details/contract-info-cards.client";
import LoanAmountSummary from "@/components/contract-details/loan-amount-summary";
import PaymentPeriods from "@/components/contract-details/payment-periods";
import ActivityLogSection from "@/components/contract-details/activity-log-section.client";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  contract: TContractDetails | null;
};

const ContractDetailsModal = ({ isOpen, onClose, contract }: TProps) => {
  if (!contract) return null;

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="full"
      hideCloseButton
      className="max-w-[1400px] h-[90vh]"
      onClose={onClose}
    >
      <ModalContent className="h-full">
        <ModalHeader className="flex-shrink-0 py-3 px-6 border-b border-default-200">
          <ContractHeader contract={contract} onClose={onClose} />
        </ModalHeader>

        <ModalBody className="flex-1 p-0 overflow-hidden">
          <div className="flex h-full">
            {/* Left Column - Contract Details */}
            <div className="flex-3 overflow-y-auto p-6 border-r border-default-200">
              <ContractProfileSection contract={contract} />

              {contract.notes && (
                <div className="flex items-start gap-3 p-3 mb-4 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                  <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-warning-700 dark:text-warning-400">
                    {contract.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <ContractInfoCards
                    contract={contract}
                    showAssetGallery
                  />
                </div>
                <LoanAmountSummary contract={contract} />
                <PaymentPeriods contract={contract} />
              </div>

              {contract.statusMessage && (
                <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <p className="text-sm">{contract.statusMessage}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center flex-col gap-2 mt-4">
                <Button color="primary" variant="bordered" className="w-full" size="lg" startContent={<CreditCard size={16} />} onPress={() => { }}>Đóng lãi</Button>
                <Button color="primary" variant="solid" className="w-full" size="lg" startContent={<ShoppingCart size={16} />} onPress={() => { }}>Chuộc đồ</Button>
              </div>


            </div>

            {/* Right Column - Activity Log */}
            <div className="w-[400px] flex flex-col flex-2 h-full bg-default-50 dark:bg-default-100/5">
              <div className="flex-shrink-0 p-4 border-b border-default-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Trao đổi & Nhật ký</h3>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {contract.activityLog && contract.activityLog.length > 0 ? (
                  <ActivityLogSection entries={contract.activityLog} />
                ) : (
                  <div className="flex items-center justify-center h-full text-default-400">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Chưa có trao đổi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex-shrink-0 border-t border-default-200 py-3">
          <Button variant="flat" onPress={onClose}>
            Đóng
          </Button>
          <Button color="primary">Giải ngân</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContractDetailsModal;
