"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CreateContractModal from "@/components/create-loan/create-loan-modal.client";
import { useAuth } from "@/lib/contexts/auth-context";
import { ROLES } from "@/constants/roles";
import type { TBranch } from "@/types/branch.types";

type TProps = {
  className?: string;
};

const CreateContractButton = ({ className }: TProps) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { profile } = useAuth();
  const [branches, setBranches] = useState<TBranch[]>([]);

  const isAdmin = profile?.role === ROLES.ADMIN;

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/branches")
      .then((r) => r.json())
      .then((res) => { if (res.success) setBranches(res.data); })
      .catch(() => {});
  }, [isOpen]);

  return (
    <>
      <Button
        className={className}
        color="primary"
        startContent={<Plus size={16} />}
        variant="solid"
        onPress={onOpen}
      >
        Tạo đơn vay
      </Button>
      {isOpen && (
        <CreateContractModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={() => router.refresh()}
          branches={branches}
          isAdmin={isAdmin}
          userBranchName={profile?.branch_name ?? null}
        />
      )}
    </>
  );
};

export default CreateContractButton;
