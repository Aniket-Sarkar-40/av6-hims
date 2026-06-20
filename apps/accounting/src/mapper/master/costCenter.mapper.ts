import { commonGetService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import { CostCenterDTO, CostCenterResponse } from "@/types/master/costCenter.js";
import { customOmit, toIdValue } from "av6-utils";

export const toCostCenterDto = async (input: CostCenterResponse[]): Promise<CostCenterDTO[]> => {
  const costCenters = await commonGetService.getAllElements<"CostCenter">({
    cacheCode: "COST_CENTER",
    canNullReturnable: true,
    modelName: "CostCenter",
    shortCode: "COST_CENTER",
    useActiveFlag: true,
  });

  const response = input.map((costCenter) => {
    const omittedData = customOmit<CostCenterResponse, BaseModelAttrWoCancel | "company" | "companyId" | "parentId">(
      costCenter,
      ["isActive", "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedBy", "deletedAt"]
    );

    return {
      ...omittedData.rest,
      company: toIdValue(costCenter.company, "name"),
      parent: costCenter.parentId
        ? toIdValue(
            costCenters.find((c) => c.id === costCenter.parentId),
            "name"
          )
        : null,
    };
  });

  return response;
};
