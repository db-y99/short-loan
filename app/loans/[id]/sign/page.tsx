"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";
import { Chip } from "@heroui/chip";
import {
  FileText, CheckCircle, Loader2, Pen, Trash2,
  ChevronLeft, ChevronRight, Shield, ScrollText,
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { AssetPledgeContractView } from "@/components/contracts/asset-pledge-contract-view.client";
import { AssetLeaseContractView } from "@/components/contracts/asset-lease-contract-view.client";
import { FullPaymentConfirmationView } from "@/components/contracts/full-payment-confirmation-view.client";
import { AssetDisposalAuthorizationView } from "@/components/contracts/asset-disposal-authorization-view.client";
import {
  getSignPageContractTabsForLoan,
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
  const [selectedContractType, setSelectedContractType] = useState<ContractType>(CONTRACT_TYPE.ASSET_PLEDGE);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);
  const [draftSignature, setDraftSignature] = useState<string | null>(null);
  const [officialSignature, setOfficialSignature] = useState<string | null>(null);
  const draftSigRef = useRef<SignatureCanvas>(null);
  const officialSigRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (!loanId) return;
    fetchContractData();
  }, [loanId]);

  const fetchContractData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/contract-data`);
      const result = await res.json();
      if (result.success) {
        setContractData(result.data);
        const tabs = getSignPageContractTabsForLoan(result.data.loanType ?? "");
        if (tabs.length > 0) {
          setSelectedContractType((current) =>
            tabs.some((tab) => tab.key === current) ? current : tabs[0].key,
          );
        }
      }
    } catch (err) {
      console.error("Error fetching contract data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSig = (
    ref: React.RefObject<SignatureCanvas>,
    setter: (v: string | null) => void,
    label: string
  ) => {
    if (ref.current?.isEmpty()) {
      addToast({ title: "Chưa có chữ ký", description: "Vui lòng ký trước khi lưu", color: "warning" });
      return;
    }
    const dataURL = ref.current?.toDataURL("image/png");
    if (!dataURL || dataURL === "data:,") {
      addToast({ title: "Lỗi lưu chữ ký", description: "Dữ liệu không hợp lệ, vui lòng ký lại", color: "danger" });
      return;
    }
    setter(dataURL);
    addToast({ title: `Đã lưu ${label}`, color: "success" });
  };

  const clearSig = (ref: React.RefObject<SignatureCanvas>, setter: (v: string | null) => void) => {
    ref.current?.clear();
    setter(null);
  };

  const handleSign = async () => {
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
        addToast({ title: "Lỗi khi ký hợp đồng", description: signResult.error || "Có lỗi xảy ra", color: "danger" });
        return;
      }
      fetch(`/api/loans/${loanId}/generate-signed-contracts`, { method: "POST" }).catch(() => {});
      setStep("done");
    } catch (err) {
      console.error("Error signing:", err);
      addToast({ title: "Lỗi khi ký hợp đồng", description: "Có lỗi xảy ra", color: "danger" });
    } finally {
      setIsSigning(false);
    }
  };

  const contractTabs = useMemo(
    () =>
      contractData?.loanType
        ? getSignPageContractTabsForLoan(contractData.loanType)
        : [],
    [contractData?.loanType],
  );

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
        <h1 className="text-2xl font-bold mb-2 text-foreground">Ký hợp đồng thành công!</h1>
        <p className="text-default-500 mb-8 max-w-xs text-sm leading-relaxed">
          Hợp đồng đã được ký kết. PDF đang được tạo trong nền, bạn có thể đóng trang này.
        </p>
        <Button color="success" size="lg" className="text-white font-semibold px-8" onPress={() => router.push("/")}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  // ── SIGN ────────────────────────────────────────────────────────────────────
  if (step === "sign") {
    const canSubmit = isAgreed && !!draftSignature && !!officialSignature;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-background border-b border-default-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <Button isIconOnly variant="flat" size="sm" onPress={() => setStep("review")}>
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
              Ký vào ô bên dưới để xác nhận đồng ý với tất cả điều khoản hợp đồng
            </p>
          </div>

          {/* Draft Signature */}
          <div className="bg-content1 rounded-2xl border border-default-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-default-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pen className="w-3.5 h-3.5 text-primary" />                </div>
                <div>
                  <p className="font-semibold text-sm">Chữ ký nháy</p>
                  <p className="text-xs text-default-400">Ký tắt / ký nháy</p>
                </div>
              </div>
              {draftSignature ? (
                <Chip color="success" size="sm" variant="flat">Đã ký</Chip>
              ) : (
                <Chip color="warning" size="sm" variant="flat">Chưa ký</Chip>
              )}
            </div>
            <div className="p-4">
              {!draftSignature ? (
                <>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 relative">
                    <SignatureCanvas
                      ref={draftSigRef}
                      canvasProps={{ className: "w-full h-56 cursor-crosshair rounded-xl" }}
                    />
                    <p className="absolute bottom-2 right-3 text-xs text-default-300 pointer-events-none select-none">Ký tại đây</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="flat" className="flex-1" onPress={() => clearSig(draftSigRef, setDraftSignature)}>
                      Xóa
                    </Button>
                    <Button size="sm" color="primary" className="flex-1 font-medium" onPress={() => saveSig(draftSigRef, setDraftSignature, "chữ ký nháy")}>
                      Xác nhận chữ ký
                    </Button>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <div className="border border-success-200 rounded-xl p-3">
                    <img src={draftSignature} alt="Chữ ký nháy" className="w-full h-44 object-contain" />
                  </div>
                  <Button
                    size="sm" variant="flat" color="danger"
                    className="mt-2 w-full"
                    startContent={<Trash2 className="w-3.5 h-3.5" />}
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
                <Chip color="success" size="sm" variant="flat">Đã ký</Chip>
              ) : (
                <Chip color="warning" size="sm" variant="flat">Chưa ký</Chip>
              )}
            </div>
            <div className="p-4">
              {!officialSignature ? (
                <>
                  <div className="border-2 border-dashed border-success/30 rounded-xl bg-success/5 relative">
                    <SignatureCanvas
                      ref={officialSigRef}
                      canvasProps={{ className: "w-full h-56 cursor-crosshair rounded-xl" }}
                    />
                    <p className="absolute bottom-2 right-3 text-xs text-default-300 pointer-events-none select-none">Ký tại đây</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="flat" className="flex-1" onPress={() => clearSig(officialSigRef, setOfficialSignature)}>
                      Xóa
                    </Button>
                    <Button size="sm" color="success" className="flex-1 font-medium text-white" onPress={() => saveSig(officialSigRef, setOfficialSignature, "chữ ký chính thức")}>
                      Xác nhận chữ ký
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="border border-success-200 rounded-xl p-3">
                    <img src={officialSignature} alt="Chữ ký chính thức" className="w-full h-44 object-contain" />
                  </div>
                  <Button
                    size="sm" variant="flat" color="danger"
                    className="mt-2 w-full"
                    startContent={<Trash2 className="w-3.5 h-3.5" />}
                    onPress={() => clearSig(officialSigRef, setOfficialSignature)}
                  >
                    Ký lại
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Agreement */}
          <div className="bg-content1 rounded-2xl border border-default-200 px-4 py-3">
            <Checkbox isSelected={isAgreed} onValueChange={setIsAgreed} size="sm" color="primary">
              <span className="text-sm text-default-700">
                Tôi đã đọc, hiểu và đồng ý với tất cả <span className="text-primary font-medium">{contractTabs.length} hợp đồng</span> và các điều khoản liên quan
              </span>
            </Checkbox>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-default-200 px-4 py-4">
          {!canSubmit && (
            <p className="text-xs text-default-400 text-center mb-2">
              {!draftSignature && !officialSignature ? "Cần ký cả 2 chữ ký" : !draftSignature ? "Còn thiếu chữ ký nháy" : !officialSignature ? "Còn thiếu chữ ký chính thức" : "Vui lòng tích đồng ý điều khoản"}
            </p>
          )}
          <Button
            color="primary"
            size="lg"
            className="w-full font-semibold text-base"
            startContent={!isSigning && <CheckCircle className="w-5 h-5" />}
            onPress={handleSign}
            isDisabled={!canSubmit || isSigning}
            isLoading={isSigning}
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
            <p className="font-bold text-sm text-foreground">Xem & Ký Hợp Đồng</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-default-200" />
          </div>
        </div>
        <p className="text-xs text-default-400 mb-3">Bước 1 / 2 — Vui lòng đọc kỹ các hợp đồng trước khi ký</p>

        {/* Tab bar */}
        <div className="flex gap-1.5">
          {contractTabs.map((t) => {
            const isActive = t.key === selectedContractType;
            return (
              <button
                key={t.key}
                onClick={() => setSelectedContractType(t.key)}
                className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "bg-default-100 text-default-500 hover:bg-default-200"
                }`}
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
              {selectedContractType === CONTRACT_TYPE.ASSET_PLEDGE && contractData?.pledgeContract && (
                <AssetPledgeContractView data={contractData.pledgeContract} />
              )}
              {selectedContractType === CONTRACT_TYPE.ASSET_LEASE && contractData?.leaseContract && (
                <AssetLeaseContractView data={contractData.leaseContract} />
              )}
              {selectedContractType === CONTRACT_TYPE.FULL_PAYMENT && contractData?.paymentConfirmation && (
                <FullPaymentConfirmationView data={contractData.paymentConfirmation} />
              )}
              {selectedContractType === CONTRACT_TYPE.ASSET_DISPOSAL && contractData?.disposalAuthorization && (
                <AssetDisposalAuthorizationView data={contractData.disposalAuthorization} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-3 px-6 text-center">
            <FileText className="w-12 h-12 text-default-300" />
            <p className="text-default-500 text-sm">Không thể tải dữ liệu hợp đồng</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-default-200 px-4 py-4">
        {/* Tab navigation hint */}
        <div className="flex items-center justify-between mb-3">
          <Button
            size="sm" variant="flat"
            isDisabled={currentTabIndex === 0}
            onPress={() => setSelectedContractType(contractTabs[currentTabIndex - 1].key)}
            startContent={<ChevronLeft className="w-3.5 h-3.5" />}
          >
            Trước
          </Button>
          <p className="text-xs text-default-400">
            {currentTabIndex + 1} / {contractTabs.length} hợp đồng
          </p>
          <Button
            size="sm" variant="flat"
            isDisabled={currentTabIndex === contractTabs.length - 1}
            onPress={() => setSelectedContractType(contractTabs[currentTabIndex + 1].key)}
            endContent={<ChevronRight className="w-3.5 h-3.5" />}
          >
            Tiếp
          </Button>
        </div>
        <Button
          color="primary"
          size="lg"
          className="w-full font-semibold text-base"
          endContent={<ChevronRight className="w-5 h-5" />}
          onPress={() => setStep("sign")}
          isDisabled={isLoading || !contractData}
        >
          Tiếp tục ký hợp đồng
        </Button>
      </div>
    </div>
  );
}
