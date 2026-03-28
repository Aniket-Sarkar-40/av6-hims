import { MobileMoneyMethodDTO } from "@/types/master/mobileMoney.js";
import { MobileMoneyMethod } from "@repo/db/generated/prisma/client";

export const toMobileMoneyMethodDTO = (
  input: MobileMoneyMethod,
): MobileMoneyMethodDTO => {
  return {
    id: input.id,
    name: input.name,
  };
};
