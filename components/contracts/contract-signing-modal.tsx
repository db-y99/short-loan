"use client";

import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { X, FileText, CheckCircle, Loader2, Pen, Trash2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { AssetPledgeContractView } from "@/components/contracts/asset-pledge-contract-view.client";
import { AssetLeaseContractView } from "@/components/contracts/asset-lease-contract-view.client";
import { FullPaymentConfirmationView } from "@/components/contracts/full-payment-confirmation-view.client";
import { AssetDisposalAuthorizationView } from "@/components/contracts/asset-disposal-authorization-view.client";

const CONTRACT_TYPE = {
  ASSET_PLEDGE: "asset_pledge",
  ASSET_LEASE: "asset_lease",
  FULL_PAYMENT: "full_payment",
  ASSET_DISPOSAL: "asset_disposal",
} as const;

type ContractType = typeof CONTRACT_TYPE[keyof typeof CONTRACT_TYPE];

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  onSign: () => Promise<void>;
};

const ContractSigningModal = ({
  isOpen,
  onClose,
  loanId,
  onSign,
}: TProps) => {
  const [selectedContractType, setSelectedContractType] = useState<ContractType>(CONTRACT_TYPE.ASSET_PLEDGE);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);
  
  // Signature states
  const [draftSignature, setDraftSignature] = useState<string | null>(null);
  const [officialSignature, setOfficialSignature] = useState<string | null>(null);
  const draftSigRef = useRef<SignatureCanvas>(null);
  const officialSigRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (isOpen && loanId) {
      fetchContractData();
    }
  }, [isOpen, loanId]);

  const fetchContractData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/contract-data`);
      const result = await response.json();
      
      console.log({ result });
      if (result.success) {
        setContractData(result.data);
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const contractTypes = [
    { key: CONTRACT_TYPE.ASSET_PLEDGE, label: "HĐ Cầm Cố Tài Sản" },
    { key: CONTRACT_TYPE.ASSET_LEASE, label: "HĐ Thuê Tài Sản" },
    { key: CONTRACT_TYPE.FULL_PAYMENT, label: "XN Đã Nhận Đủ Tiền" },
    { key: CONTRACT_TYPE.ASSET_DISPOSAL, label: "Ủy Quyền Xử Lý TS" },
  ];

  const handleSign = async () => {
    if (!isAgreed) {
      alert("Vui lòng đồng ý với điều khoản hợp đồng");
      return;
    }

    if (!draftSignature || !officialSignature) {
      alert("Vui lòng ký cả chữ ký nháy và chữ ký chính thức");
      return;
    }

    setIsSigning(true);
    try {
      // Call API to sign with signatures
      const response = await fetch(`/api/loans/${loanId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftSignature,
          officialSignature,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSign(); // Just call callback to close modal and show success
      } else {
        alert(result.error || "Có lỗi xảy ra khi ký hợp đồng");
      }
    } catch (error) {
      console.error("Error signing contract:", error);
      alert("Có lỗi xảy ra khi ký hợp đồng");
    } finally {
      setIsSigning(false);
    }
  };

  const clearDraftSignature = () => {
    draftSigRef.current?.clear();
    setDraftSignature(null);
  };

  const saveDraftSignature = () => {
    if (draftSigRef.current?.isEmpty()) {
      alert("Vui lòng ký trước khi lưu");
      return;
    }
    const dataURL = draftSigRef.current?.toDataURL();
    setDraftSignature(dataURL || null);
  };

  const clearOfficialSignature = () => {
    officialSigRef.current?.clear();
    setOfficialSignature(null);
  };

  const saveOfficialSignature = () => {
    if (officialSigRef.current?.isEmpty()) {
      alert("Vui lòng ký trước khi lưu");
      return;
    }
    const dataURL = officialSigRef.current?.toDataURL();
    setOfficialSignature(dataURL || null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      hideCloseButton
      classNames={{
        base: "m-0 max-w-full h-screen",
        wrapper: "items-start",
      }}
    >
      <ModalContent className="h-full rounded-none">
        {/* Header */}
        <ModalHeader className="flex items-center justify-between border-b border-default-200 bg-primary px-6 py-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">XEM VÀ KÝ HỢP ĐỒNG</span>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onClose}
            className="text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </ModalHeader>

        <ModalBody className="p-0 overflow-hidden">
          <div className="flex h-full">
            {/* Left - Contract Content */}
            <div className="flex-[8] flex flex-col overflow-hidden">
              {/* Tabs - Contract Types */}
              <div className="border-b border-default-200 px-4">
                <Tabs
                  selectedKey={selectedContractType}
                  onSelectionChange={(key) => setSelectedContractType(key as ContractType)}
                  variant="underlined"
                  classNames={{
                    tabList: "gap-0 w-full relative rounded-none p-0 border-b-0",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-6 h-12",
                    tabContent: "group-data-[selected=true]:text-primary",
                  }}
                >
                  {contractTypes.map((type) => (
                    <Tab key={type.key} title={type.label} />
                  ))}
                </Tabs>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : contractData ? (
                  <div className="max-w-4xl mx-auto">
                    <Card shadow="sm">
                      <CardBody className="p-8">
                        {selectedContractType === CONTRACT_TYPE.ASSET_PLEDGE && (
                          <AssetPledgeContractView data={contractData} />
                        )}
                        {selectedContractType === CONTRACT_TYPE.ASSET_LEASE && (
                          <AssetLeaseContractView data={contractData} />
                        )}
                        {selectedContractType === CONTRACT_TYPE.FULL_PAYMENT && (
                          <FullPaymentConfirmationView data={contractData} />
                        )}
                        {selectedContractType === CONTRACT_TYPE.ASSET_DISPOSAL && (
                          <AssetDisposalAuthorizationView data={contractData} />
                        )}
                      </CardBody>
                    </Card>
                  </div>
                ) : (
                  <Card shadow="sm">
                    <CardBody className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-default-400" />
                      <p className="text-default-600">Không thể tải dữ liệu hợp đồng</p>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Sidebar - Signing Actions */}
            <div className="flex-[4] border-l border-default-200 flex flex-col">
              <div className="p-4 border-b border-default-200">
                <h3 className="font-semibold text-sm">Sẵn sàng để ký bản</h3>
                <p className="text-xs text-default-500 mt-1">
                  Vui lòng xem và đồng ý với các điều khoản
                </p>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Contract Counter */}
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4">
                    <p className="text-xs text-default-600 mb-2">
                      Tổng số hợp đồng
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {contractTypes.length} hợp đồng
                    </p>
                    <p className="text-xs text-default-500 mt-1">
                      Đang xem: {contractTypes.find(t => t.key === selectedContractType)?.label}
                    </p>
                  </CardBody>
                </Card>

                {/* Draft Signature */}
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Pen className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold">Chữ ký nháy</p>
                      </div>
                      {draftSignature && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={clearDraftSignature}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {!draftSignature ? (
                      <>
                        <div className="border-2 border-dashed border-default-300 rounded-lg bg-default-50">
                          <SignatureCanvas
                            ref={draftSigRef}
                            canvasProps={{
                              className: "w-full h-48 cursor-crosshair",
                            }}
                            backgroundColor="rgb(250, 250, 250)"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={clearDraftSignature}
                            className="flex-1"
                          >
                            Xóa
                          </Button>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={saveDraftSignature}
                            className="flex-1"
                          >
                            Lưu
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="border border-default-200 rounded-lg p-2 bg-white">
                        <img src={draftSignature} alt="Draft signature" className="w-full h-48 object-contain" />
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Official Signature */}
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-success" />
                        <p className="text-sm font-semibold">Chữ ký chính thức</p>
                      </div>
                      {officialSignature && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={clearOfficialSignature}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {!officialSignature ? (
                      <>
                        <div className="border-2 border-dashed border-success-300 rounded-lg bg-success-50">
                          <SignatureCanvas
                            ref={officialSigRef}
                            canvasProps={{
                              className: "w-full h-48 cursor-crosshair",
                            }}
                            backgroundColor="rgb(240, 253, 244)"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={clearOfficialSignature}
                            className="flex-1"
                          >
                            Xóa
                          </Button>
                          <Button
                            size="sm"
                            color="success"
                            onPress={saveOfficialSignature}
                            className="flex-1"
                          >
                            Lưu
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="border border-success-200 rounded-lg p-2 bg-white">
                        <img src={officialSignature} alt="Official signature" className="w-full h-48 object-contain" />
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Agreement Checkbox */}
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4">
                    <Checkbox
                      isSelected={isAgreed}
                      onValueChange={setIsAgreed}
                      size="sm"
                    >
                      <span className="text-sm">
                        Tôi đã xem tất cả {contractTypes.length} hợp đồng và đồng ý với các điều khoản
                      </span>
                    </Checkbox>
                  </CardBody>
                </Card>

                {/* Info Card */}
                <Card shadow="sm" className="bg-primary-50 border border-primary-200">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-primary">
                          YÊU CẦU KÝ
                        </p>
                        <p className="text-xs text-default-600 mt-1">
                          Cần có cả chữ ký nháy và chữ ký chính thức để hoàn tất
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-default-200 space-y-2">
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  startContent={<FileText className="w-4 h-4" />}
                  onPress={handleSign}
                  isDisabled={!isAgreed || !draftSignature || !officialSignature || isSigning}
                  isLoading={isSigning}
                >
                  {isSigning ? "Đang ký..." : "HOÀN TẤT VÀ KÝ HỢP ĐỒNG"}
                </Button>
                <Button
                  variant="flat"
                  size="md"
                  className="w-full"
                  onPress={onClose}
                >
                  Hủy bỏ
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ContractSigningModal;
