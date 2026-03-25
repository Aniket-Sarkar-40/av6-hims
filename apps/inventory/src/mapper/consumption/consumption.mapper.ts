import { coreRequests } from "@/client/core/request";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { ConsumptionDTO, ConsumptionResponse } from "@/types/consumption/consumption";
import { itemMasterToDto } from "@/utils/commonResponse.utils";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils";
import { customOmit } from "@/utils/helper.utils";
import { toIdValue } from "@/utils/idValue.utils";
import { ConsumptionDetails } from "@prisma/client";

export const toConsumptionDTO = async (consumption: ConsumptionResponse): Promise<ConsumptionDTO> => {
  const omittedConsumption = customOmit<
    ConsumptionResponse,
    | "consumptionDetails"
    | "ccId"
    | "approvalFrom"
    | "requestedBy"
    | "createdBy"
    | "updatedBy"
    | "rejectedBy"
    | "approvedBy"
    | "isActive"
    | "deletedBy"
  >(consumption, [
    "consumptionDetails",
    "ccId",
    "approvalFrom",
    "requestedBy",
    "createdBy",
    "updatedBy",
    "rejectedBy",
    "approvedBy",
    "isActive",
    "deletedBy",
  ]);
  const cc = await getBranchOrWarehouse(consumption.ccId);
  const approver = await coreRequests.getEmployeeCache(consumption.approvalFrom);
  const requester = await coreRequests.getEmployeeCache(consumption.requestedBy);
  const createdBy = consumption.createdBy ? await coreRequests.getEmployeeCache(consumption.createdBy) : null;
  const updatedBy = consumption.updatedBy ? await coreRequests.getEmployeeCache(consumption.updatedBy) : null;
  const approvedBy = consumption.approvedBy ? await coreRequests.getEmployeeCache(consumption.approvedBy) : null;
  const rejectedBy = consumption.rejectedBy ? await coreRequests.getEmployeeCache(consumption.rejectedBy) : null;
  const deletedBy = consumption.deletedBy ? await coreRequests.getEmployeeCache(consumption.deletedBy) : null;
  const consumptionDetails = await Promise.all(
    consumption.consumptionDetails.map(async (detail) => {
      const omittedDetail = customOmit<
        ConsumptionDetails,
        "itemId" | "createdBy" | "updatedBy" | "isActive" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
      >(detail, [
        "itemId",
        "createdBy",
        "createdAt",
        "updatedBy",
        "isActive",
        "deletedAt",
        "deletedBy",
        "createdAt",
        "updatedAt",
      ]);
      const item = await itemMasterService.getItemMasterById({ itemId: detail.itemId });
      return {
        ...omittedDetail.rest,
        item: item ? await itemMasterToDto(item) : null,
      };
    })
  );

  return {
    ...omittedConsumption.rest,
    approvalFrom: toIdValue(approver, "name"),
    requestedBy: requester,
    createdBy: createdBy,
    updatedBy: updatedBy,
    approvedBy: approvedBy,
    rejectedBy: rejectedBy,
    deletedBy: deletedBy,
    consumptionDetails: consumptionDetails,
    collectionCenter: cc ? toIdValue(cc, "name") : null,
  };
};
