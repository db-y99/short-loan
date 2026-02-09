"use client";

import { useCallback, useState } from "react";

import LoansTable from "@/components/loan-table.client";
import ContractDetailsModal from "@/components/loan-details/loan-details-modal.client";

import type { TLoan, TLoanDetails } from "@/types/loan.types";
import { SAMPLE_LOAN_DETAILS } from "@/constants/sample-loan-details";

type TProps = {
  loans: TLoan[];
};

// TODO: Khi có database, hàm này sẽ gọi API để lấy chi tiết khoản vay
const getLoanDetails = (loanId: string): TLoanDetails | null => {
  // Hiện tại trả về mock data cho tất cả loans
  // Sau này sẽ fetch từ server dựa trên loanId
  return {
    ...SAMPLE_LOAN_DETAILS,
    id: loanId,
  };
};

const LoansPageClient = ({ loans }: TProps) => {
  const [selectedLoan, setSelectedLoan] = useState<TLoanDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = useCallback((loan: TLoan) => {
    const details = getLoanDetails(loan.id);

    if (details) {
      // Merge thông tin cơ bản từ loan vào details
      setSelectedLoan({
        ...details,
        code: loan.code,
        loanAmount: loan.amount,
        status: loan.status,
      });
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLoan(null);
  }, []);

  const handleRefresh = useCallback(() => {
    // TODO: Refresh data khi có database (loans)
    // eslint-disable-next-line no-console
    console.log("Refresh contracts");
  }, []);

  return (
    <>
      <LoansTable
        loans={loans}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
      />

      {isModalOpen && (
        <ContractDetailsModal
          contract={selectedLoan}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default LoansPageClient;
