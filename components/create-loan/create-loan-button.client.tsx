"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { Plus } from "lucide-react";
import CreateContractModal from "@/components/create-loan/create-loan-modal.client";

type TProps = {
  className?: string;
};

const CreateContractButton = ({ className }: TProps) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        />
      )}
    </>
  );
};

export default CreateContractButton;
