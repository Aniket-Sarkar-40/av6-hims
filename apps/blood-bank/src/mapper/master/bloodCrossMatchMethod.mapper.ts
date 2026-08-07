import { commonService } from "@/services/common.service.js";
import { BloodCrossMatchMethodDTO } from "@/types/master/bloodCrossMatchMethod.js";
import { BloodCrossMatchMethod } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodCrossMatchMethodDTO = async (
  data: BloodCrossMatchMethod[],
): Promise<BloodCrossMatchMethodDTO[]> => {
  const allBloodBankCenters =
    await commonService.getAllElements<"BloodBankCenter">({
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    });

  return data.map((bloodCrossMatchMethod) => {
    const omittedBloodCrossMatchMethod = customOmit<
      BloodCrossMatchMethod,
      BaseModelAttrWoCancel | "bloodBankCenterId"
    >(bloodCrossMatchMethod, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodCrossMatchMethod.bloodBankCenterId,
    );
    return {
      ...omittedBloodCrossMatchMethod.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
    };
  });
};
