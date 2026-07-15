"use client";

import type {
  TLoan,
  TLoanDetails,
  TCreateLoanForm,
  TReuseLoanOptions,
  TUploadFiles,
} from "@/types/loan.types";
import type { TBranch } from "@/types/branch.types";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@heroui/modal";

import LoansTable from "@/components/loan-table.client";
import { getLoanDetailsAction } from "@/features/loans/actions/get-loan-details.action";
import CreateContractModal from "@/components/create-loan/create-loan-modal.client";
import {
  mapLoanDetailsToCreateForm,
  mapLoanAssetImagesToAttachments,
} from "@/lib/loan-form-mapper";
import { useAuth } from "@/lib/contexts/auth-context";
import { ROLES } from "@/constants/roles";

const LoanDetailsModal = dynamic(
  () => import("@/components/loan-details/loan-details-modal.client"),
  {
    loading: () => null,
  },
);

const preloadLoanDetailsModal = () => {
  void import("@/components/loan-details/loan-details-modal.client");
};

type TProps = {
  loans: TLoan[];
  branches?: TBranch[];
  selectedBranch?: string;
};

const LoansPageClient = ({
  loans,
  branches = [],
  selectedBranch = "",
}: TProps) => {
  const router = useRouter();
  const { profile } = useAuth();
  const isAdmin = profile?.role === ROLES.ADMIN;

  const [selectedLoan, setSelectedLoan] = useState<TLoanDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const {
    isOpen: isCreateOpen,
    onOpen: onOpenCreate,
    onClose: onCloseCreate,
  } = useDisclosure();

  const [createInitialForm, setCreateInitialForm] =
    useState<TCreateLoanForm | null>(null);
  const [createInitialBranchId, setCreateInitialBranchId] = useState<
    string | null
  >(null);
  const [createSourceLoanCode, setCreateSourceLoanCode] = useState<
    string | null
  >(null);
  const [createInitialAssetImages, setCreateInitialAssetImages] = useState<
    TUploadFiles[] | null
  >(null);
  const [createKeepAssetImages, setCreateKeepAssetImages] = useState(false);

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

  const handleRefreshLoanDetails = useCallback(async () => {
    if (!selectedLoan) return;

    setIsLoadingDetails(true);
    const result = await getLoanDetailsAction(selectedLoan.id);

    setIsLoadingDetails(false);

    if (result.success) {
      setSelectedLoan(result.data);
    }
  }, [selectedLoan]);

  const handleOpenCreateBlank = useCallback(() => {
    setCreateInitialForm(null);
    setCreateInitialBranchId(null);
    setCreateSourceLoanCode(null);
    setCreateInitialAssetImages(null);
    setCreateKeepAssetImages(false);
    onOpenCreate();
  }, [onOpenCreate]);

  const handleReuseLoan = useCallback(
    (loanDetails: TLoanDetails, options: TReuseLoanOptions) => {
      setCreateInitialForm(mapLoanDetailsToCreateForm(loanDetails));
      setCreateInitialBranchId(loanDetails.branchId ?? null);
      setCreateSourceLoanCode(loanDetails.code);
      setCreateKeepAssetImages(options.keepAssetImages);
      setCreateInitialAssetImages(
        options.keepAssetImages
          ? mapLoanAssetImagesToAttachments(loanDetails)
          : null,
      );
      handleCloseModal();
      onOpenCreate();
    },
    [handleCloseModal, onOpenCreate],
  );

  const handleCloseCreate = useCallback(() => {
    onCloseCreate();
    setCreateInitialForm(null);
    setCreateInitialBranchId(null);
    setCreateSourceLoanCode(null);
    setCreateInitialAssetImages(null);
    setCreateKeepAssetImages(false);
  }, [onCloseCreate]);

  const handleCreateSuccess = useCallback(() => {
    handleCloseCreate();
    router.refresh();
  }, [handleCloseCreate, router]);

  return (
    <>
      <LoansTable
        branches={branches}
        loans={loans}
        selectedBranch={selectedBranch}
        onCreateLoan={handleOpenCreateBlank}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
        onRowHover={preloadLoanDetailsModal}
      />

      {isModalOpen && (
        <LoanDetailsModal
          error={detailsError}
          isLoading={isLoadingDetails}
          isOpen={isModalOpen}
          loanDetails={selectedLoan}
          onClose={handleCloseModal}
          onRefresh={handleRefreshLoanDetails}
          onReuseLoan={handleReuseLoan}
        />
      )}

      {isCreateOpen && (
        <CreateContractModal
          branches={branches}
          initialAssetImages={createInitialAssetImages}
          initialBranchId={createInitialBranchId}
          initialForm={createInitialForm}
          isAdmin={isAdmin}
          isOpen={isCreateOpen}
          keepAssetImages={createKeepAssetImages}
          sourceLoanCode={createSourceLoanCode}
          userBranchName={profile?.branch_name ?? null}
          onClose={handleCloseCreate}
          onSuccess={handleCreateSuccess}
        />
      )}
    </>
  );
};

export default LoansPageClient;
