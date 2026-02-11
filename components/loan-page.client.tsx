"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import LoansTable from "@/components/loan-table.client";
import { getLoanDetailsAction } from "@/features/loans/actions/get-loan-details.action";

import type { TLoan, TLoanDetails } from "@/types/loan.types";
import LoanDetailsModal from "@/components/loan-details/loan-details-modal.client";

type TProps = {
  loans: TLoan[];
};

const LoansPageClient = ({ loans }: TProps) => {
  const router = useRouter();
  const [selectedLoan, setSelectedLoan] = useState<TLoanDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleRowClick = useCallback(async (loan: TLoan) => {
    setDetailsError(null);
    setIsLoadingDetails(true);
    setIsModalOpen(true);
    setSelectedLoan(null);

    const result = await getLoanDetailsAction(loan.id);

    setIsLoadingDetails(false);

    if (result.success) {
      setSelectedLoan(result.data);
    } else {
      setDetailsError(result.error);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLoan(null);
    setDetailsError(null);
  }, []);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <>
      <LoansTable
        loans={loans}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
      />

      {isModalOpen && (
        <LoanDetailsModal
          loanDetails={selectedLoan}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isLoading={isLoadingDetails}
          error={detailsError}
        />
      )}
    </>
  );
};

export default LoansPageClient;
