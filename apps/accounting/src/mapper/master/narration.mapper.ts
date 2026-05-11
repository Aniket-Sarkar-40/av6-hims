import { commonGetService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import { NarrationDTO } from "@/types/master/narration.js";
import { Narration } from "@repo/db/generated/prisma/client";
import { customOmit, toIdValue } from "av6-utils";

export const toNarrationDto = async (
  input: Narration[]
): Promise<NarrationDTO[]> => {
  const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    canNullReturnable: true,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
  });

  const response: NarrationDTO[] = input.map((narration) => {
    const omittedData = customOmit<
      Narration,
      BaseModelAttrWoCancel | "voucherTypeId"
    >(narration, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "deletedBy",
      "deletedAt",
    ]);
    const voucherType = voucherTypes.find(
      (vt) => vt.id === narration.voucherTypeId
    );
    return {
      ...omittedData.rest,
      voucherType: toIdValue(voucherType, "name"),
    };
  });
  return response;
};
