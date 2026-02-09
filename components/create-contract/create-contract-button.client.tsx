"use client";

import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { Plus } from "lucide-react";

import CreateContractModal from "./create-contract-modal.client";

type TProps = {
  className?: string;
};

const CreateContractButton = ({ className }: TProps) => {
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
        Tạo hợp đồng
      </Button>
      {
        isOpen && <CreateContractModal isOpen={isOpen} onClose={onClose} />
      }
    </>
  );
};

export default CreateContractButton;
