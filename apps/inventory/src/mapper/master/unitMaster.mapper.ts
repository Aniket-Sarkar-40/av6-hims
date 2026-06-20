import { defaultUnitMasterService } from "@/services/master/defaultUnitMaster.service.js";
import { UnitMasterDTO } from "@/types/master/unitMaster.js";
import { InvUnitMaster } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancelWoActive } from "@repo/shared/types/global.js";
import { customOmit } from "av6-core-v2";
import { toIdValue } from "av6-utils";

export const toUnitMasterDto = async (
  data: InvUnitMaster[]
): Promise<UnitMasterDTO[]> => {
  const defaultUnitMaster =
    await defaultUnitMasterService.getAllDefaultUnitMaster(true);

  const unitMasterDTO = await Promise.all(
    data.map(async (item) => {
      const omittedItemStore = customOmit<
        InvUnitMaster,
        BaseModelAttrWoCancelWoActive | "defaultUnitMasterId"
      >(item, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "defaultUnitMasterId",
      ]);

      const defaultUnitMasterData = defaultUnitMaster.find(
        (defaultUnit) => defaultUnit.id === item.defaultUnitMasterId
      );

      return {
        ...omittedItemStore.rest,
        defaultUnitMaster: defaultUnitMasterData
          ? toIdValue(defaultUnitMasterData, "name")
          : null,
      };
    })
  );

  return unitMasterDTO;
};
