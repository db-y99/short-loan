"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";
import { Chip } from "@heroui/chip";
import {
  FileText,
  CheckCircle,
  Loader2,
  Pen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  ScrollText,
} from "lucide-react";
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

type Step = "review" | "sign" | "done";

export default function LoanSignPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;

  const [step, setStep] = useState<Step>("review");
  const [selectedContractType, setSelectedContractType] =
    useState<ContractType>(CONTRACT_TYPE.ASSET_PLEDGE);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [draftSignature, setDraftSignature] = useState<string | null>(null);
  const [officialSignature, setOfficialSignature] = useState<string | null>(
    null,
  );
  const draftSigRef = useRef<SignatureCanvas>(null);
  const officialSigRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (!loanId) return;
    fetchContractData();
  }, [loanId]);

  const fetchContractData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/loans/${loanId}/contract-data`);
      const result = await res.json();

      if (result.success) {
        setContractData(result.data);
        const createdTypes = result.data.createdContractTypes ?? [];
        const tabs = getSignPageContractTabsForCreatedTypes(createdTypes);

        if (tabs.length > 0) {
          setSelectedContractType((current) =>
            tabs.some((tab) => tab.key === current) ? current : tabs[0].key,
          );
        }
      } else {
        setContractData(null);
        setLoadError(
          typeof result.error === "string"
            ? result.error
            : "Không tải được hợp đồng",
        );
      }
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setContractData(null);
      setLoadError("Không tải được hợp đồng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSig = (
    ref: React.RefObject<SignatureCanvas>,
    setter: (v: string | null) => void,
    label: string,
  ) => {
    if (ref.current?.isEmpty()) {
      addToast({
        title: "Chưa có chữ ký",
        description: "Vui lòng ký trước khi lưu",
        color: "warning",
      });

      return;
    }
    const dataURL = ref.current?.toDataURL("image/png");

    if (!dataURL || dataURL === "data:,") {
      addToast({
        title: "Lỗi lưu chữ ký",
        description: "Dữ liệu không hợp lệ, vui lòng ký lại",
        color: "danger",
      });

      return;
    }
    setter(dataURL);
    addToast({ title: `Đã lưu ${label}`, color: "success" });
  };

  const clearSig = (
    ref: React.RefObject<SignatureCanvas>,
    setter: (v: string | null) => void,
  ) => {
    ref.current?.clear();
    setter(null);
  };

  const handleSign = async () => {
    if (!canSign) {
      addToast({
        title: "Chưa thể ký hợp đồng",
        description:
          "Vui lòng tạo hợp đồng PDF trước khi ký. Liên hệ nhân viên để được hỗ trợ.",
        color: "warning",
      });

      return;
    }

    if (!isAgreed || !draftSignature || !officialSignature) return;
    setIsSigning(true);
    try {
      const signRes = await fetch(`/api/loans/${loanId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftSignature, officialSignature }),
      });
      const signResult = await signRes.json();

      if (!signResult.success) {
        addToast({
          title: "Lỗi khi ký hợp đồng",
          description: signResult.error || "Có lỗi xảy ra",
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
      setStep("done");
    } catch (err) {
      console.error("Error signing:", err);
      addToast({
        title: "Lỗi khi ký hợp đồng",
        description: "Có lỗi xảy ra",
        color: "danger",
      });
    } finally {
      setIsSigning(false);
    }
  };

  const contractTabs = useMemo(() => {
    const createdTypes = contractData?.createdContractTypes ?? [];

    if (createdTypes.length === 0) return [];

    return getSignPageContractTabsForCreatedTypes(createdTypes);
  }, [contractData?.createdContractTypes]);

  const canSign = contractData?.canSign ?? contractTabs.length > 0;

  const currentTabIndex = contractTabs.findIndex(
    (t) => t.key === selectedContractType,
  );

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-success flex items-center justify-center mb-6 shadow-lg shadow-success/30">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Ký hợp đồng thành công!
        </h1>
        <p className="text-default-500 mb-8 max-w-xs text-sm leading-relaxed">
          Hợp đồng đã được ký kết. PDF đang được tạo trong nền, bạn có thể đóng
          trang này.
        </p>
        <Button
          className="text-white font-semibold px-8"
          color="success"
          size="lg"
          onPress={() => router.push("/")}
        >
          Về trang chủ
        </Button>
      </div>
    );
  }

  // ── SIGN ────────────────────────────────────────────────────────────────────
  if (step === "sign") {
    const canSubmit =
      canSign && isAgreed && !!draftSignature && !!officialSignature;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-background border-b border-default-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={() => setStep("review")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Ký hợp đồng</p>
            <p className="text-xs text-default-400">Bước 2 / 2</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-4">
          {/* Instruction banner */}
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-xs text-primary font-medium">
              Ký vào ô bên dưới để xác nhận đồng ý với tất cả điều khoản hợp
              đồng
            </p>
          </div>

          {/* Draft Signature */}
          <div className="bg-content1 rounded-2xl border border-default-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-default-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pen className="w-3.5 h-3.5 text-primary" />{" "}
                </div>
                <div>
                  <p className="font-semibold text-sm">Chữ ký nháy</p>
                  <p className="text-xs text-default-400">Ký tắt / ký nháy</p>
                </div>
              </div>
              {draftSignature ? (
                <Chip color="success" size="sm" variant="flat">
                  Đã ký
                </Chip>
              ) : (
                <Chip color="warning" size="sm" variant="flat">
                  Chưa ký
                </Chip>
              )}
            </div>
            <div className="p-4">
              {!draftSignature ? (
                <>
                  <div className="relative">
                    <SignaturePad
                      ref={draftSigRef}
                      className="rounded-xl"
                      heightClass="h-56"
                    />
                    <p className="absolute bottom-2 right-3 text-xs text-default-400 pointer-events-none select-none">
                      Ký tại đây
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex-1"
                      size="sm"
                      variant="flat"
                      onPress={() => clearSig(draftSigRef, setDraftSignature)}
                    >
                      Xóa
                    </Button>
                    <Button
                      className="flex-1 font-medium"
                      color="primary"
                      size="sm"
                      onPress={() =>
                        saveSig(draftSigRef, setDraftSignature, "chữ ký nháy")
                      }
                    >
                      Xác nhận chữ ký
                    </Button>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <div className="border border-success-200 rounded-xl p-3 bg-white dark:bg-white">
                    <img
                      alt="Chữ ký nháy"
                      className="w-full h-44 object-contain bg-white"
                      src={draftSignature}
                    />
                  </div>
                  <Button
                    className="mt-2 w-full"
                    color="danger"
                    size="sm"
                    startContent={<Trash2 className="w-3.5 h-3.5" />}
                    variant="flat"
                    onPress={() => clearSig(draftSigRef, setDraftSignature)}
                  >
                    Ký lại
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Official Signature */}
          <div className="bg-content1 rounded-2xl border border-default-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-default-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center">
                  <ScrollText className="w-3.5 h-3.5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Chữ ký chính thức</p>
                  <p className="text-xs text-default-400">Chữ ký đầy đủ</p>
                </div>
              </div>
              {officialSignature ? (
                <Chip color="success" size="sm" variant="flat">
                  Đã ký
                </Chip>
              ) : (
                <Chip color="warning" size="sm" variant="flat">
                  Chưa ký
                </Chip>
              )}
            </div>
            <div className="p-4">
              {!officialSignature ? (
                <>
                  <div className="relative">
                    <SignaturePad
                      ref={officialSigRef}
                      className="rounded-xl"
                      heightClass="h-56"
                    />
                    <p className="absolute bottom-2 right-3 text-xs text-default-400 pointer-events-none select-none">
                      Ký tại đây
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex-1"
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        clearSig(officialSigRef, setOfficialSignature)
                      }
                    >
                      Xóa
                    </Button>
                    <Button
                      className="flex-1 font-medium text-white"
                      color="success"
                      size="sm"
                      onPress={() =>
                        saveSig(
                          officialSigRef,
                          setOfficialSignature,
                          "chữ ký chính thức",
                        )
                      }
                    >
                      Xác nhận chữ ký
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="border border-success-200 rounded-xl p-3 bg-white dark:bg-white">
                    <img
                      alt="Chữ ký chính thức"
                      className="w-full h-44 object-contain bg-white"
                      src={officialSignature}
                    />
                  </div>
                  <Button
                    className="mt-2 w-full"
                    color="danger"
                    size="sm"
                    startContent={<Trash2 className="w-3.5 h-3.5" />}
                    variant="flat"
                    onPress={() =>
                      clearSig(officialSigRef, setOfficialSignature)
                    }
                  >
                    Ký lại
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Agreement */}
          <div className="bg-content1 rounded-2xl border border-default-200 px-4 py-3">
            <Checkbox
              color="primary"
              isSelected={isAgreed}
              size="sm"
              onValueChange={setIsAgreed}
            >
              <span className="text-sm text-default-700">
                Tôi đã đọc, hiểu và đồng ý với tất cả{" "}
                <span className="text-primary font-medium">
                  {contractTabs.length} hợp đồng
                </span>{" "}
                và các điều khoản liên quan
              </span>
            </Checkbox>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-default-200 px-4 py-4">
          {!canSubmit && (
            <p className="text-xs text-default-400 text-center mb-2">
              {!canSign
                ? "Chưa có hợp đồng để ký. Liên hệ nhân viên tạo hợp đồng trước."
                : !draftSignature && !officialSignature
                  ? "Cần ký cả 2 chữ ký"
                  : !draftSignature
                    ? "Còn thiếu chữ ký nháy"
                    : !officialSignature
                      ? "Còn thiếu chữ ký chính thức"
                      : "Vui lòng tích đồng ý điều khoản"}
            </p>
          )}
          <Button
            className="w-full font-semibold text-base"
            color="primary"
            isDisabled={!canSubmit || isSigning}
            isLoading={isSigning}
            size="lg"
            startContent={!isSigning && <CheckCircle className="w-5 h-5" />}
            onPress={handleSign}
          >
            {isSigning ? "Đang xử lý..." : "Hoàn tất ký hợp đồng"}
          </Button>
        </div>
      </div>
    );
  }

  // ── REVIEW ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b border-default-200 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="font-bold text-sm text-foreground">
              Xem & Ký Hợp Đồng
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-default-200" />
          </div>
        </div>
        <p className="text-xs text-default-400 mb-3">
          Bước 1 / 2 — Vui lòng đọc kỹ các hợp đồng trước khi ký
        </p>

        {/* Tab bar */}
        <div className="flex gap-1.5">
          {contractTabs.map((t) => {
            const isActive = t.key === selectedContractType;

            return (
              <button
                key={t.key}
                className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "bg-default-100 text-default-500 hover:bg-default-200"
                }`}
                onClick={() => setSelectedContractType(t.key)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-default-400">Đang tải hợp đồng...</p>
          </div>
        ) : contractData ? (
          canSign ? (
            <div className="bg-content1 mx-3 my-4 rounded-2xl overflow-hidden border border-default-200">
              {/* Contract label */}
              <div className="px-4 py-2.5 border-b border-default-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  {currentTabIndex + 1}
                </span>
                <p className="text-xs font-medium text-default-600">
                  {contractTabs[currentTabIndex]?.label}
                </p>
              </div>
              <div className="p-4 flex justify-center overflow-x-auto">
                {selectedContractType === CONTRACT_TYPE.ASSET_PLEDGE &&
                  contractData?.pledgeContract && (
                    <AssetPledgeContractView
                      data={contractData.pledgeContract}
                    />
                  )}
                {selectedContractType === CONTRACT_TYPE.ASSET_LEASE &&
                  contractData?.leaseContract && (
                    <AssetLeaseContractView data={contractData.leaseContract} />
                  )}
                {selectedContractType === CONTRACT_TYPE.FULL_PAYMENT &&
                  contractData?.paymentConfirmation && (
                    <FullPaymentConfirmationView
                      data={contractData.paymentConfirmation}
                    />
                  )}
                {selectedContractType === CONTRACT_TYPE.ASSET_DISPOSAL &&
                  contractData?.disposalAuthorization && (
                    <AssetDisposalAuthorizationView
                      data={contractData.disposalAuthorization}
                    />
                  )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 gap-3 px-6 text-center">
              <FileText className="w-12 h-12 text-warning" />
              <p className="text-default-700 font-medium">
                Chưa có hợp đồng để ký
              </p>
              <p className="text-default-500 text-sm">
                Vui lòng liên hệ nhân viên tạo hợp đồng PDF trước khi ký.
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-3 px-6 text-center">
            <FileText className="w-12 h-12 text-default-300" />
            <p className="text-default-700 font-medium">
              Không tải được hợp đồng
            </p>
            <p className="text-default-500 text-sm">
              {loadError ??
                "Vui lòng kiểm tra kết nối hoặc liên hệ nhân viên hỗ trợ."}
            </p>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={fetchContractData}
            >
              Thử lại
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-default-200 px-4 py-4">
        {/* Tab navigation hint */}
        <div className="flex items-center justify-between mb-3">
          <Button
            isDisabled={currentTabIndex === 0}
            size="sm"
            startContent={<ChevronLeft className="w-3.5 h-3.5" />}
            variant="flat"
            onPress={() =>
              setSelectedContractType(contractTabs[currentTabIndex - 1].key)
            }
          >
            Trước
          </Button>
          <p className="text-xs text-default-400">
            {currentTabIndex + 1} / {contractTabs.length} hợp đồng
          </p>
          <Button
            endContent={<ChevronRight className="w-3.5 h-3.5" />}
            isDisabled={currentTabIndex === contractTabs.length - 1}
            size="sm"
            variant="flat"
            onPress={() =>
              setSelectedContractType(contractTabs[currentTabIndex + 1].key)
            }
          >
            Tiếp
          </Button>
        </div>
        <Button
          className="w-full font-semibold text-base"
          color="primary"
          endContent={<ChevronRight className="w-5 h-5" />}
          isDisabled={isLoading || !contractData || !canSign}
          size="lg"
          onPress={() => setStep("sign")}
        >
          Tiếp tục ký hợp đồng
        </Button>
      </div>
    </div>
  );
}
