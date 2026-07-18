import { commonGetService } from "@/services/common.service.js";
import { ChequeMasterDTO } from "@/types/master/chequeMaster.js";
import { ChequeMaster } from "@repo/db/generated/prisma/client";
import { customOmit, toIdValue } from "av6-utils";

export const toChequeMasterDto = async (
  chequeMaster: ChequeMaster[],
): Promise<ChequeMasterDTO[]> => {
  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const response: ChequeMasterDTO[] = chequeMaster.map((cm) => {
    const ledger = ledgers.find((l) => l.id === cm.bankLedgerId);
    return {
      ...customOmit(cm, [
        "isActive",
        "createdBy",
        "createdAt",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "bankLedgerId",
      ]).rest,
      bankLedger: toIdValue(ledger, "name"),
    };
  });
  return response;
};
