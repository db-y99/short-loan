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

import type { TContractDetails } from "@/types/contracts.types";
import { formatCurrencyVND } from "@/lib/format";
import AssetGallery from "@/components/contract-details/asset-gallery.client";

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-2">
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="font-semibold">{title}</h3>
  </div>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
  isLink = false,
  href,
  className,
}: {
  icon: ElementType;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
  className?: string;
}) => (
  <div className={cn("flex items-start gap-2 py-1.5", className)}>
    <Icon className="w-4 h-4 text-default-400 mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-default-400">{label}</p>
      {isLink && href ? (
        <Link isExternal className="text-sm" href={href}>
          {value}
        </Link>
      ) : (
        <p className="text-sm font-medium break-words">{value}</p>
      )}
    </div>
  </div>
);

type TProps = {
  contract: TContractDetails;
  showAssetGallery?: boolean;
};

const ContractInfoCards = ({
  contract,
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
            value={contract.customer.cccd}
          />
          <InfoRow icon={Phone} label="SĐT" value={contract.customer.phone} />

          <InfoRow
            icon={Briefcase}
            label="Công việc"
            value={contract.customer.job}
          />
          <InfoRow
            icon={DollarSign}
            label="Thu nhập"
            value={formatCurrencyVND(contract.customer.income)}
          />
          {contract.customer.facebookUrl && (
            <InfoRow
              href={contract.customer.facebookUrl}
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
            value={contract.customer.address}
            className="col-span-2"
          />
          <InfoRow
            icon={Calendar}
            label="Ngày cấp"
            value={contract.customer.cccdIssueDate}
          />
          <InfoRow
            icon={Building2}
            label="Nơi cấp"
            value={contract.customer.cccdIssuePlace}
          />
        </CardBody>
      </Card>
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Building2} title="Ngân hàng" />
        </CardHeader>
        <CardBody className="pt-0 space-y-2 gap-2">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {contract.bank.name}
              </p>

              <p className="text-sm text-default-500">
                {contract.bank.accountHolder}
              </p>
            </div>
            <p className="text-lg font-mono font-semibold mt-1">
              {contract.bank.accountNumber}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Users} title="Tham chiếu" />
        </CardHeader>
        <CardBody className="pt-0">
          {contract.references.length > 0 ? (
            <div className="space-y-2">
              {contract.references.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-2 bg-default-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{ref.full_name}</p>
                    <Link className="text-xs" href={`tel:${ref.phone}`}>
                      {ref.phone}
                    </Link>
                  </div>
                  <Chip size="sm" variant="flat">
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
          <Chip size="sm" variant="flat">{contract.asset.type}</Chip>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="bg-default-50 rounded-lg p-2 mb-3 flex flex-col gap-1">
            <p className="font-semibold">{contract.asset.name}</p>
            {contract.asset.imei && (
              <p className="text-sm text-default-500">
                IMEI: {contract.asset.imei}
              </p>
            )}
            {contract.asset.serial && (
              <p className="text-sm text-default-500">
                Serial: {contract.asset.serial}
              </p>
            )}
            <Divider className="my-2" />
            <div className="flex items-center gap-2 justify-between">
              <div>Hình thức: {contract.loanType}</div>
              <div className="text-sm text-success-500">
                (Kỳ đầu tiên)
              </div>
            </div>
          </div>
          {showAssetGallery && (
            <AssetGallery images={contract.asset.images} />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ContractInfoCards;
