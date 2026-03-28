import { BankHeadDTO } from "@/types/master/bankHead.js";
import { CashNBankHead } from "@repo/db/generated/prisma/client";

export const toBankHeadDTO = (input: CashNBankHead): BankHeadDTO => {
  return {
    id: input.id,
    name: input.name,
    bankNo: input.bankNo ? String(input.bankNo) : null,
    headCode: input.headCode,
  };
};
