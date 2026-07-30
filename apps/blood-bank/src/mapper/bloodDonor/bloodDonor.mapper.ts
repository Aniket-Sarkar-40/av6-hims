import { commonService } from "@/services/common.service.js";
import { BloodDonorDTO } from "@/types/bloodDonor/bloodDonor.js";
import { BloodDonor } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodDonorDTO = async (
  data: BloodDonor[],
): Promise<BloodDonorDTO[]> => {
  const allBloodBankCenters =
    await commonService.getAllElements<"BloodBankCenter">({
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    });

  return data.map((bloodDonor) => {
    const omittedBloodDonor = customOmit<
      BloodDonor,
      BaseModelAttrWoCancel | "bloodBankCenterId"
    >(bloodDonor, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodDonor.bloodBankCenterId,
    );
    return {
      ...omittedBloodDonor.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
    };
  });
};
