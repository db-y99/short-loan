import type { TContractType } from "@/types/contract.types";

import { z } from "zod";

import { GENERATABLE_CONTRACT_TYPES } from "@/constants/contracts";

const contractTypeSchema = z.enum(
  GENERATABLE_CONTRACT_TYPES as [TContractType, ...TContractType[]],
);

export const GenerateContractsSchema = z.object({
  loanId: z.string().uuid("ID khoản vay không hợp lệ"),
  contractTypes: z
    .array(contractTypeSchema)
    .min(1, "Vui lòng chọn ít nhất một loại hợp đồng"),
});

export type TGenerateContractsInput = z.infer<typeof GenerateContractsSchema>;
