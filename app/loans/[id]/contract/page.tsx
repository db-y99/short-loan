"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Tabs, Tab } from "@heroui/tabs";
import { ArrowLeft, Download, CloudUpload } from "lucide-react";
import { AssetPledgeContractView } from "@/components/contracts/asset-pledge-contract-view.client";
import { AssetLeaseContractView } from "@/components/contracts/asset-lease-contract-view.client";
import { FullPaymentConfirmationView } from "@/components/contracts/full-payment-confirmation-view.client";
import { AssetDisposalAuthorizationView } from "@/components/contracts/asset-disposal-authorization-view.client";
import { usePdfGenerator } from "@/hooks/use-pdf-generator";
import {
  CONTRACT_TYPE,
  type TContractData,
  type TAssetPledgeContractData,
  type TAssetLeaseContractData,
  type TFullPaymentConfirmationData,
  type TAssetDisposalAuthorizationData,
} from "@/types/contract.types";

const CONTRACT_TABS = [
  { key: CONTRACT_TYPE.ASSET_PLEDGE, label: "HĐ Cầm cố" },
  { key: CONTRACT_TYPE.ASSET_LEASE, label: "HĐ Thuê tài sản" },
  { key: CONTRACT_TYPE.FULL_PAYMENT, label: "XN Nhận đủ tiền" },
  { key: CONTRACT_TYPE.ASSET_DISPOSAL, label: "Ủy quyền xử lý TS" },
] as const;

function getFileName(type: string, data: TContractData): string {
  const code =
    "SO_HD_THUE" in data
      ? (data as TAssetLeaseContractData).SO_HD_THUE
      : (data as TAssetPledgeContractData | TFullPaymentConfirmationData | TAssetDisposalAuthorizationData)
          .MA_HD;
  const map: Record<string, string> = {
    [CONTRACT_TYPE.ASSET_PLEDGE]: `Hop-dong-cam-co-${code}`,
    [CONTRACT_TYPE.ASSET_LEASE]: `Hop-dong-thue-${code}`,
    [CONTRACT_TYPE.FULL_PAYMENT]: `Xac-nhan-nhan-du-tien-${code}`,
    [CONTRACT_TYPE.ASSET_DISPOSAL]: `Uy-quyen-xu-ly-tai-san-${code}`,
  };
  return `${map[type] ?? "contract"}.pdf`;
}

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;
  const [activeType, setActiveType] = useState<string>(CONTRACT_TYPE.ASSET_PLEDGE);
  const [contractData, setContractData] = useState<TContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { generating, progress, downloadPDF, uploadPDFToDrive } =
    usePdfGenerator();

  useEffect(() => {
    if (!loanId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/loans/${loanId}/contract-data?type=${activeType}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tải được dữ liệu hợp đồng");
        return res.json();
      })
      .then((data: TContractData) => {
        setContractData(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      })
      .finally(() => setLoading(false));
  }, [loanId, activeType]);

  const handleDownload = async () => {
    if (!contractData) return;
    const fileName = getFileName(activeType, contractData);
    await downloadPDF("contract-content", fileName);
  };

  const handleUploadToDrive = async () => {
    const data = contractData as { drive_folder_id?: string } | null;
    if (!data || !data.drive_folder_id) {
      alert("Chưa có thư mục Drive cho khoản vay này.");
      return;
    }
    if (!contractData) return;
    const fileName = getFileName(activeType, contractData);
    try {
      await uploadPDFToDrive(
        "contract-content",
        fileName,
        data.drive_folder_id,
        loanId,
        activeType,
      );
      alert("Đã tải lên Drive thành công!");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi tải lên Drive");
    }
  };

  const driveFolderId =
    contractData && "drive_folder_id" in contractData
      ? (contractData as { drive_folder_id: string }).drive_folder_id
      : "";

  if (error && !contractData) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg bg-danger-50 dark:bg-danger-900/20 px-4 py-6 text-danger text-center">
          {error}
        </div>
        <Button
          variant="flat"
          className="mt-4"
          onPress={() => router.back()}
          startContent={<ArrowLeft className="w-4 h-4" />}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto">
     <div className="mb-2 flex items-center justify-between">
        <Button
          variant="flat"
          size="sm"
          onPress={() => router.back()}
          startContent={<ArrowLeft className="w-4 h-4" />}
        >
          Quay lại
        </Button>
      </div>
      <div className="mb-4 gap-4 sticky top-0 bg-background/95 backdrop-blur py-4 z-10 border-b border-default-200">
        <div className="flex flex-col">

      <Tabs
        selectedKey={activeType}
        onSelectionChange={(k) => setActiveType(k as string)}
        className="mb-4"
      >
        {CONTRACT_TABS.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>
       <div className="flex items-center gap-2">
         <Button
          color="primary"
          onPress={handleDownload}
          isDisabled={generating || loading}
          startContent={<Download className="w-4 h-4" />}
        >
          {generating ? `Đang tạo PDF... ${progress}%` : "Tải xuống PDF"}
        </Button>
        {/* <Button
          color="success"
          variant="flat"
          onPress={handleUploadToDrive}
          isDisabled={generating || loading || !driveFolderId}
          startContent={<CloudUpload className="w-4 h-4" />}
        >
          {generating ? `Đang xử lý... ${progress}%` : "Lưu lên Drive"}
        </Button> */}
       </div>
        </div>
      </div>

      {generating && (
        <div className="mb-4">
          <Progress value={progress} size="sm" color="primary" />
        </div>
      )}

      <div className="flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-10 w-10 rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : contractData ? (
          <div style={{ display: "block", width: "fit-content" }}>
            {activeType === CONTRACT_TYPE.ASSET_PLEDGE && (
              <AssetPledgeContractView
                data={contractData as TAssetPledgeContractData}
              />
            )}
            {activeType === CONTRACT_TYPE.ASSET_LEASE && (
              <AssetLeaseContractView
                data={contractData as TAssetLeaseContractData}
              />
            )}
            {activeType === CONTRACT_TYPE.FULL_PAYMENT && (
              <FullPaymentConfirmationView
                data={contractData as TFullPaymentConfirmationData}
              />
            )}
            {activeType === CONTRACT_TYPE.ASSET_DISPOSAL && (
              <AssetDisposalAuthorizationView
                data={contractData as TAssetDisposalAuthorizationData}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
