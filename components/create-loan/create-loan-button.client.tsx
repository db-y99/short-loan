"use client";

import { Button } from "@heroui/button";
import { Plus } from "lucide-react";

type TProps = {
  className?: string;
  onPress: () => void;
};

const CreateContractButton = ({ className, onPress }: TProps) => {
  return (
    <Button
      className={className}
      color="primary"
      startContent={<Plus size={16} />}
      variant="solid"
      onPress={onPress}
    >
      Tạo đơn vay
    </Button>
  );
};

export default CreateContractButton;
