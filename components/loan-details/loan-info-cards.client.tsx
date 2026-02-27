"use client";

import { Card, CardBody, CardHeader, Chip, Divider, Link, Button } from "@heroui/react";
import {
  User,
  CreditCard,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Facebook,
  Building2,
  Users,
  Smartphone,
  Calendar,
  UserPlus,
} from "lucide-react";

import type { TLoanDetails } from "@/types/loan.types";
import { formatCurrencyVND } from "@/lib/format";
import AssetGallery from "@/components/loan-details/asset-gallery.client";
import SectionHeader from "@/components/section-header";
import InfoRow from "@/components/info-row";


type TProps = {
  loanDetails: TLoanDetails;
  showAssetGallery?: boolean;
  onAddReference?: () => void;
  onUpdateAssetCondition?: () => void; // Thêm callback mới
};

const LoanInfoCards = ({
  loanDetails,
  showAssetGallery = false,
  onAddReference,
  onUpdateAssetCondition,
}: TProps) => {
  return (
    <div className="gap-4 flex flex-col">
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={User} title="Khách hàng" />
        </CardHeader>
        <CardBody className="pt-0 space-y-2 gap-2 grid grid-cols-2">
          <InfoRow
            icon={CreditCard}
            label="CCCD"
            value={loanDetails.customer.cccd}
          />
          <InfoRow icon={Phone} label="SĐT" value={loanDetails.customer.phone} />

          <InfoRow
            icon={Briefcase}
            label="Công việc"
            value={loanDetails.customer.job}
          />
          <InfoRow
            icon={DollarSign}
            label="Thu nhập"
            value={formatCurrencyVND(loanDetails.customer.income)}
          />
          {loanDetails.customer.facebookUrl && (
            <InfoRow
              href={loanDetails.customer.facebookUrl}
              icon={Facebook}
              isLink
              label="Facebook"
              value="Xem Facebook"
            />
          )}


        </CardBody>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={MapPin} title="Địa chỉ" />
        </CardHeader>
        <CardBody className="pt-0 space-y-2 gap-2 grid grid-cols-2">
          <InfoRow
            icon={MapPin}
            label="Địa chỉ"
            value={loanDetails.customer.address}
            className="col-span-2"
          />
          <InfoRow
            icon={Calendar}
            label="Ngày cấp"
            value={loanDetails.customer.cccdIssueDate}
          />
          <InfoRow
            icon={Building2}
            label="Nơi cấp"
            value={loanDetails.customer.cccdIssuePlace}
          />
        </CardBody>
      </Card>
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Building2} title="Ngân hàng" />
        </CardHeader>
        <CardBody className="space-y-2 gap-2">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {loanDetails.bank.name}
              </p>

              <p className="text-sm text-default-500">
                {loanDetails.bank.accountHolder}
              </p>
            </div>
            <p className="text-lg font-mono font-semibold mt-1">
              {loanDetails.bank.accountNumber}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader className="pb-2 flex items-center justify-between">
          <SectionHeader icon={Users} title="Tham chiếu" />
          {onAddReference && (
            <Button
              color="primary"
              variant="light"
              size="sm"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onAddReference}
            >
              Thêm
            </Button>
          )}
        </CardHeader>
        <CardBody className="pt-0">
          {loanDetails.references.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200">
                    <th className="text-left py-2 px-2 font-semibold text-default-600">
                      Họ tên
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-default-600">
                      Số điện thoại
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-default-600">
                      Quan hệ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loanDetails.references.map((ref) => (
                    <tr
                      key={ref.id}
                      className="border-b border-default-100 hover:bg-default-50"
                    >
                      <td className="py-2 px-2 font-medium">{ref.full_name}</td>
                      <td className="py-2 px-2">
                        <Link href={`tel:${ref.phone}`} className="text-primary hover:underline">
                          {ref.phone}
                        </Link>
                      </td>
                      <td className="py-2 px-2">
                        <Chip size="sm" variant="flat">
                          {ref.relationship}
                        </Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-default-400 text-center py-2">
              Chưa có thông tin
            </p>
          )}
        </CardBody>
      </Card>

      <Card shadow="sm" className="col-span-2">
        <CardHeader className="pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SectionHeader icon={Smartphone} title="Tài sản" />
            <Chip size="sm" variant="flat">{loanDetails.asset.type}</Chip>
          </div>
            <Button
              color="secondary"
              variant="light"
              size="sm"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onUpdateAssetCondition}
            >
              Cập nhật tình trạng
            </Button>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="bg-default-50 rounded-lg p-2 mb-3 flex flex-col gap-1">
            <p className="font-semibold">{loanDetails.asset.name}</p>
            {loanDetails.asset.imei && (
              <p className="text-sm text-default-500">
                IMEI: {loanDetails.asset.imei}
              </p>
            )}
            {loanDetails.asset.serial && (
              <p className="text-sm text-default-500">
                Serial: {loanDetails.asset.serial}
              </p>
            )}
            {
              loanDetails.asset.chassisNumber && (
                <p className="text-sm text-default-500">
                  Chassis Number: {loanDetails.asset.chassisNumber}
                </p>
              )
            }
            {
              loanDetails.asset.engineNumber && (
                <p className="text-sm text-default-500">
                  Engine Number: {loanDetails.asset.engineNumber}
                </p>
              )
            }
            {loanDetails.assetCondition && (
              <>
                <Divider className="my-2" />
                <div className="bg-warning-50 dark:bg-warning-900/20 rounded-md p-2">
                  <p className="text-xs font-semibold text-warning-700 dark:text-warning-400 mb-1">
                    Tình trạng tài sản:
                  </p>
                  <p className="text-sm">
                    {loanDetails.assetCondition}
                  </p>
                </div>
              </>
            )}
            <Divider className="my-2" />
            <div className="flex items-center gap-2 justify-between">
              <div>Hình thức: {loanDetails.loanType}</div>
              <div className="text-sm text-success-500">
                (Kỳ đầu tiên)
              </div>
            </div>
          </div>
          {showAssetGallery && (
            <AssetGallery assetImages={loanDetails.asset.images} loanId={loanDetails.id} />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default LoanInfoCards;
