"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";
import { X, FileText, CheckCircle, Loader2, Pen, Trash2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

import SignaturePad from "@/components/signature-pad.client";
import { AssetPledgeContractView } from "@/components/contracts/asset-pledge-contract-view.client";
import { AssetLeaseContractView } from "@/components/contracts/asset-lease-contract-view.client";
import { FullPaymentConfirmationView } from "@/components/contracts/full-payment-confirmation-view.client";
import { AssetDisposalAuthorizationView } from "@/components/contracts/asset-disposal-authorization-view.client";
import {
  getSignPageContractTabsForCreatedTypes,
  type TSignPageContractTabKey,
} from "@/constants/contracts";

const CONTRACT_TYPE = {
  ASSET_PLEDGE: "asset_pledge",
  ASSET_LEASE: "asset_lease",
  FULL_PAYMENT: "full_payment",
  ASSET_DISPOSAL: "asset_disposal",
} as const;

type ContractType = TSignPageContractTabKey;

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  onSign: () => Promise<void>;
};

const ContractSigningModal = ({ isOpen, onClose, loanId, onSign }: TProps) => {
  const [selectedContractType, setSelectedContractType] =
    useState<ContractType>(CONTRACT_TYPE.ASSET_PLEDGE);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);

  // Signature states
  const [draftSignature, setDraftSignature] = useState<string | null>(null);
  const [officialSignature, setOfficialSignature] = useState<string | null>(
    null,
  );
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
        const createdTypes = result.data.createdContractTypes ?? [];
        const tabs = getSignPageContractTabsForCreatedTypes(createdTypes);

        if (tabs.length > 0) {
          setSelectedContractType((current) =>
            tabs.some((tab) => tab.key === current) ? current : tabs[0].key,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const contractTypes = useMemo(() => {
    const createdTypes = contractData?.createdContractTypes ?? [];

    if (createdTypes.length === 0) return [];

    return getSignPageContractTabsForCreatedTypes(createdTypes).map((tab) => ({
      key: tab.key,
      label:
        tab.key === "asset_pledge"
          ? "HĐ Cầm Cố Tài Sản"
          : tab.key === "asset_lease"
            ? "HĐ Thuê Tài Sản"
            : tab.key === "full_payment"
              ? "XN Đã Nhận Đủ Tiền"
              : "Ủy Quyền Xử Lý TS",
    }));
  }, [contractData?.createdContractTypes]);

  const canSign = contractData?.canSign ?? contractTypes.length > 0;

  const handleSign = async () => {
    if (!canSign) {
      addToast({
        title: "Chưa thể ký hợp đồng",
        description:
          "Vui lòng tạo hợp đồng PDF trước khi ký. Quay lại mục Hợp đồng và nhấn Tạo hợp đồng.",
        color: "warning",
      });

      return;
    }

    if (!isAgreed) {
      addToast({
        title: "Vui lòng đồng ý với điều khoản",
        description: "Bạn cần đồng ý với các điều khoản hợp đồng để tiếp tục",
        color: "danger",
      });

      return;
    }

    if (!draftSignature || !officialSignature) {
      addToast({
        title: "Thiếu chữ ký",
        description: "Vui lòng ký cả chữ ký nháy và chữ ký chính thức",
        color: "danger",
      });

      return;
    }

    setIsSigning(true);
    try {
      // Step 1: Sign the contract
      const signResponse = await fetch(`/api/loans/${loanId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftSignature,
          officialSignature,
        }),
      });

      const signResult = await signResponse.json();

      if (!signResult.success) {
        addToast({
          title: "Lỗi khi ký hợp đồng",
          description: signResult.error || "Có lỗi xảy ra khi ký hợp đồng",
          color: "danger",
        });

        return;
      }

      addToast({
        title: "Hoàn tất!",
        description:
          signResult.message || "Hợp đồng đã được ký và tạo PDF thành công",
        color: "success",
      });

      onSign();
    } catch (error) {
      console.error("Error signing contract:", error);
      addToast({
        title: "Lỗi khi ký hợp đồng",
        description: "Có lỗi xảy ra khi ký hợp đồng",
        color: "danger",
      });
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
      addToast({
        title: "Chưa có chữ ký",
        description: "Vui lòng ký trước khi lưu",
        color: "warning",
      });

      return;
    }

    try {
      // Use toDataURL directly instead of getTrimmedCanvas for compatibility
      const dataURL = draftSigRef.current?.toDataURL("image/png");

      if (!dataURL || dataURL === "data:,") {
        addToast({
          title: "Lỗi lưu chữ ký",
          description: "Dữ liệu chữ ký không hợp lệ. Vui lòng ký lại.",
          color: "danger",
        });

        return;
      }

      setDraftSignature(dataURL);
      addToast({
        title: "Đã lưu chữ ký nháy",
        color: "success",
      });
    } catch (error) {
      console.error("Error saving draft signature:", error);
      addToast({
        title: "Lỗi lưu chữ ký",
        description: "Có lỗi xảy ra khi lưu chữ ký. Vui lòng thử lại.",
        color: "danger",
      });
    }
  };

  const clearOfficialSignature = () => {
    officialSigRef.current?.clear();
    setOfficialSignature(null);
  };

  const saveOfficialSignature = () => {
    if (officialSigRef.current?.isEmpty()) {
      addToast({
        title: "Chưa có chữ ký",
        description: "Vui lòng ký trước khi lưu",
        color: "warning",
      });

      return;
    }

    try {
      // Use toDataURL directly instead of getTrimmedCanvas for compatibility
      const dataURL = officialSigRef.current?.toDataURL("image/png");

      if (!dataURL || dataURL === "data:,") {
        addToast({
          title: "Lỗi lưu chữ ký",
          description: "Dữ liệu chữ ký không hợp lệ. Vui lòng ký lại.",
          color: "danger",
        });

        return;
      }

      setOfficialSignature(dataURL);
      addToast({
        title: "Đã lưu chữ ký chính thức",
        color: "success",
      });
    } catch (error) {
      console.error("Error saving official signature:", error);
      addToast({
        title: "Lỗi lưu chữ ký",
        description: "Có lỗi xảy ra khi lưu chữ ký. Vui lòng thử lại.",
        color: "danger",
      });
    }
  };

  return (
    <Modal
      hideCloseButton
      classNames={{
        base: "m-0 max-w-full h-screen",
        wrapper: "items-start",
      }}
      isOpen={isOpen}
      size="full"
      onClose={onClose}
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
            className="text-white"
            variant="light"
            onPress={onClose}
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
                  classNames={{
                    tabList:
                      "gap-0 w-full relative rounded-none p-0 border-b-0",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-6 h-12",
                    tabContent: "group-data-[selected=true]:text-primary",
                  }}
                  selectedKey={selectedContractType}
                  variant="underlined"
                  onSelectionChange={(key) =>
                    setSelectedContractType(key as ContractType)
                  }
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
                  canSign ? (
                    <div className="max-w-4xl mx-auto">
                      <Card shadow="sm">
                        <CardBody className="p-8">
                          {selectedContractType ===
                            CONTRACT_TYPE.ASSET_PLEDGE &&
                            contractData?.pledgeContract && (
                              <AssetPledgeContractView
                                data={contractData.pledgeContract}
                              />
                            )}
                          {selectedContractType === CONTRACT_TYPE.ASSET_LEASE &&
                            contractData?.leaseContract && (
                              <AssetLeaseContractView
                                data={contractData.leaseContract}
                              />
                            )}
                          {selectedContractType ===
                            CONTRACT_TYPE.FULL_PAYMENT &&
                            contractData?.paymentConfirmation && (
                              <FullPaymentConfirmationView
                                data={contractData.paymentConfirmation}
                              />
                            )}
                          {selectedContractType ===
                            CONTRACT_TYPE.ASSET_DISPOSAL &&
                            contractData?.disposalAuthorization && (
                              <AssetDisposalAuthorizationView
                                data={contractData.disposalAuthorization}
                              />
                            )}
                        </CardBody>
                      </Card>
                    </div>
                  ) : (
                    <Card shadow="sm">
                      <CardBody className="p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-warning" />
                        <p className="text-default-700 font-medium">
                          Chưa có hợp đồng để ký
                        </p>
                        <p className="text-sm text-default-500 mt-2">
                          Vui lòng tạo hợp đồng PDF ở mục Hợp đồng trước khi ký.
                        </p>
                      </CardBody>
                    </Card>
                  )
                ) : (
                  <Card shadow="sm">
                    <CardBody className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-default-400" />
                      <p className="text-default-600">
                        Không thể tải dữ liệu hợp đồng
                      </p>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Sidebar - Signing Actions */}
            <div className="flex-[4] border-l border-default-200 flex flex-col">
              <div className="p-4 border-b border-default-200">
                <h3 className="font-semibold text-sm">Sẵn sàng để ký</h3>
                <p className="text-xs text-default-500 mt-1">
                  Vui lòng xem và đồng ý với các điều khoản
                </p>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Contract Counter */}
                <Card className="border border-default-200" shadow="sm">
                  <CardBody className="p-4">
                    <p className="text-xs text-default-600 mb-2">
                      Tổng số hợp đồng
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {contractTypes.length} hợp đồng
                    </p>
                    <p className="text-xs text-default-500 mt-1">
                      Đang xem:{" "}
                      {
                        contractTypes.find(
                          (t) => t.key === selectedContractType,
                        )?.label
                      }
                    </p>
                  </CardBody>
                </Card>

                {/* Draft Signature */}
                <Card className="border border-default-200" shadow="sm">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Pen className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold">Chữ ký nháy</p>
                      </div>
                      {draftSignature && (
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={clearDraftSignature}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {!draftSignature ? (
                      <>
                        <SignaturePad ref={draftSigRef} />
                        <div className="flex gap-2 mt-2">
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="flat"
                            onPress={clearDraftSignature}
                          >
                            Xóa
                          </Button>
                          <Button
                            className="flex-1"
                            color="primary"
                            size="sm"
                            onPress={saveDraftSignature}
                          >
                            Lưu
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="border border-default-200 rounded-lg p-2 bg-white dark:bg-white">
                        <img
                          alt="Draft signature"
                          className="w-full h-48 object-contain bg-white"
                          src={draftSignature}
                        />
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Official Signature */}
                <Card className="border border-default-200" shadow="sm">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-success" />
                        <p className="text-sm font-semibold">
                          Chữ ký chính thức
                        </p>
                      </div>
                      {officialSignature && (
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={clearOfficialSignature}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {!officialSignature ? (
                      <>
                        <SignaturePad ref={officialSigRef} />
                        <div className="flex gap-2 mt-2">
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="flat"
                            onPress={clearOfficialSignature}
                          >
                            Xóa
                          </Button>
                          <Button
                            className="flex-1"
                            color="success"
                            size="sm"
                            onPress={saveOfficialSignature}
                          >
                            Lưu
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="border border-default-200 rounded-lg p-2 bg-white dark:bg-white">
                        <img
                          alt="Official signature"
                          className="w-full h-48 object-contain bg-white"
                          src={officialSignature}
                        />
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Agreement Checkbox */}
                <Card className="border border-default-200" shadow="sm">
                  <CardBody className="p-4">
                    <Checkbox
                      isSelected={isAgreed}
                      size="sm"
                      onValueChange={setIsAgreed}
                    >
                      <span className="text-sm">
                        Tôi đã xem tất cả {contractTypes.length} hợp đồng và
                        đồng ý với các điều khoản
                      </span>
                    </Checkbox>
                  </CardBody>
                </Card>

                {/* Info Card */}
                <Card
                  className="bg-primary-50 border border-primary-200"
                  shadow="sm"
                >
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
                  className="w-full"
                  color="primary"
                  isDisabled={
                    !canSign ||
                    !isAgreed ||
                    !draftSignature ||
                    !officialSignature ||
                    isSigning
                  }
                  isLoading={isSigning}
                  size="lg"
                  startContent={<FileText className="w-4 h-4" />}
                  onPress={handleSign}
                >
                  {isSigning ? "Đang ký..." : "HOÀN TẤT VÀ KÝ HỢP ĐỒNG"}
                </Button>
                <Button
                  className="w-full"
                  size="md"
                  variant="flat"
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
