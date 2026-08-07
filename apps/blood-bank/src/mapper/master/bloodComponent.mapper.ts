import { commonService } from "@/services/common.service.js";
import { BloodComponentDTO } from "@/types/master/bloodComponent.js";
import { BloodComponent } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodComponentDTO = async (
  data: BloodComponent[],
): Promise<BloodComponentDTO[]> => {
  const allBloodBankCenters =
    await commonService.getAllElements<"BloodBankCenter">({
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    });

  return data.map((bloodComponent) => {
    const omittedBloodComponent = customOmit<
      BloodComponent,
      BaseModelAttrWoCancel | "bloodBankCenterId"
    >(bloodComponent, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodComponent.bloodBankCenterId,
    );
    return {
      ...omittedBloodComponent.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
    };
  });
};
