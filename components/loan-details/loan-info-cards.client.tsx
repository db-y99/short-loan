"use client";

import type { ElementType } from "react";
import { Card, CardBody, CardHeader, Chip, cn, Divider, Link } from "@heroui/react";
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
} from "lucide-react";

import type { TLoanDetails } from "@/types/loan.types";
import { formatCurrencyVND } from "@/lib/format";
import AssetGallery from "@/components/loan-details/asset-gallery.client";
import SectionHeader from "@/components/section-header";
import InfoRow from "@/components/info-row";


type TProps = {
  loanDetails: TLoanDetails;
  showAssetGallery?: boolean;
};

const LoanInfoCards = ({
  loanDetails,
  showAssetGallery = false,
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
        <CardHeader className="pb-2">
          <SectionHeader icon={Users} title="Tham chiếu" />
        </CardHeader>
        <CardBody className="pt-0">
          {loanDetails.references.length > 0 ? (
            <div className="space-y-2">
              {loanDetails.references.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-2 bg-default-50 rounded-lg"
                >
                  <p className="font-medium">{ref.full_name}</p>

                  <Link href={`tel:${ref.phone}`}>
                    {ref.phone}
                  </Link>
                  <Chip variant="flat">
                    {ref.relationship}
                  </Chip>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-default-400 text-center py-2">
              Chưa có thông tin
            </p>
          )}
        </CardBody>
      </Card>

      <Card shadow="sm" className="col-span-2">
        <CardHeader className="pb-2 flex items-center gap-2">
          <SectionHeader icon={Smartphone} title="Tài sản" />
          <Chip size="sm" variant="flat">{loanDetails.asset.type}</Chip>
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
            <Divider className="my-2" />
            <div className="flex items-center gap-2 justify-between">
              <div>Hình thức: {loanDetails.loanType}</div>
              <div className="text-sm text-success-500">
                (Kỳ đầu tiên)
              </div>
            </div>
          </div>
          {showAssetGallery && (
            <AssetGallery images={loanDetails.asset.images} />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default LoanInfoCards;
