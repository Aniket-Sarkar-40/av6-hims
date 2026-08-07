import { commonService } from "@/services/common.service.js";
import { BloodExternalCenterDTO } from "@/types/master/bloodExternalCenter.js";
import { BloodExternalCenter } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodExternalCenterDTO = async (
  data: BloodExternalCenter[],
): Promise<BloodExternalCenterDTO[]> => {
  const allBloodBankCenters =
    await commonService.getAllElements<"BloodBankCenter">({
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    });

  return data.map((bloodExternalCenter) => {
    const omittedBloodExternalCenter = customOmit<
      BloodExternalCenter,
      BaseModelAttrWoCancel | "bloodBankCenterId"
    >(bloodExternalCenter, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodExternalCenter.bloodBankCenterId,
    );
    return {
      ...omittedBloodExternalCenter.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
    };
  });
};
