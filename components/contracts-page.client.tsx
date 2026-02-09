"use client";

import { useCallback, useState } from "react";

import ContractsTable from "@/components/contracts-table.client";
import ContractDetailsModal from "@/components/contract-details/contract-details-modal.client";

import type { TContract, TContractDetails } from "@/types/contracts.types";
import { SAMPLE_CONTRACT_DETAILS } from "@/constants/sample-contract-details";

type TProps = {
  contracts: TContract[];
};

// TODO: Khi có database, hàm này sẽ gọi API để lấy chi tiết hợp đồng
const getContractDetails = (contractId: string): TContractDetails | null => {
  // Hiện tại trả về mock data cho tất cả contracts
  // Sau này sẽ fetch từ server dựa trên contractId
  return {
    ...SAMPLE_CONTRACT_DETAILS,
    id: contractId,
  };
};

const ContractsPageClient = ({ contracts }: TProps) => {
  const [selectedContract, setSelectedContract] =
    useState<TContractDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = useCallback((contract: TContract) => {
    const details = getContractDetails(contract.id);

    if (details) {
      // Merge thông tin cơ bản từ contract vào details
      setSelectedContract({
        ...details,
        code: contract.code,
        loanAmount: contract.amount,
        status: contract.status,
      });
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedContract(null);
  }, []);

  const handleRefresh = useCallback(() => {
    // TODO: Refresh data khi có database
    // eslint-disable-next-line no-console
    console.log("Refresh contracts");
  }, []);

  return (
    <>
      <ContractsTable
        contracts={contracts}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
      />

      {isModalOpen && (
        <ContractDetailsModal
          contract={selectedContract}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ContractsPageClient;
