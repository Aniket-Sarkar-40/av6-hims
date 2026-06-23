import { commonService } from "@/services/common.service.js";
import { BloodBankCenterDTO } from "@/types/master/bloodBankCenter.js";
import { BloodBankCenter } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodBankCenterDTO = async (
  data: BloodBankCenter[]
): Promise<BloodBankCenterDTO[]> => {
  const allHospitals = await commonService.getAllElements<"Hospital">({
    cacheCode: "HOSPITAL",
    canNullReturnable: true,
    modelName: "Hospital",
    shortCode: "HOSPITAL",
    useActiveFlag: true,
  });

  return data.map((bloodBankCenter) => {
    const omittedBloodBankCenter = customOmit<
      BloodBankCenter,
      BaseModelAttrWoCancel | "hospitalId"
    >(bloodBankCenter, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "hospitalId",
    ]);

    const hospital = allHospitals.find(
      (h) => h.id === bloodBankCenter.hospitalId
    );
    return {
      ...omittedBloodBankCenter.rest,
      hospital: toIdValue(hospital, "name") ?? null,
    };
  });
};
