import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  ConDetailDTO,
  ConsumptionDTO,
  ConsumptionResponse,
} from "@/types/consumption/consumption.js";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { customOmit } from "av6-utils";
import { toIdValue } from "av6-utils";
import { ConsumptionDetails } from "@repo/db/generated/prisma/client";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";

export const toConsumptionDTO = async (
  consumption: ConsumptionResponse[]
): Promise<ConsumptionDTO[]> => {
  const items = await itemMasterService.getAllItemMaster(true);

  return Promise.all(
    consumption.map(async (consumption) => {
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
      const approver = await employeeService.getEmployeeByIdFrmCacheOrDb(
        consumption.approvalFrom,
        true
      );
      const requester = await employeeService.getEmployeeByIdFrmCacheOrDb(
        consumption.requestedBy,
        true
      );
      const createdBy = consumption.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.createdBy,
            true
          )
        : null;
      const updatedBy = consumption.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.updatedBy,
            true
          )
        : null;
      const approvedBy = consumption.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.approvedBy,
            true
          )
        : null;
      const rejectedBy = consumption.rejectedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.rejectedBy,
            true
          )
        : null;
      const deletedBy = consumption.deletedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.deletedBy,
            true
          )
        : null;
      const consumptionDetails = await Promise.all(
        consumption.consumptionDetails.map(async (detail) => {
          const omittedDetail = customOmit<
            ConsumptionDetails,
            | "itemId"
            | "createdBy"
            | "updatedBy"
            | "isActive"
            | "deletedAt"
            | "deletedBy"
            | "createdAt"
            | "updatedAt"
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
          const item = items.find((itm) => itm.id === detail.itemId);
          const createdBy = detail.createdBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.createdBy
              )
            : null;
          const updatedBy = detail.updatedBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.updatedBy
              )
            : null;
          return {
            ...omittedDetail.rest,
            item: item ? await itemMasterToDto(item) : null,
            createdBy,
            updatedBy,
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
    })
  );
};

export const toConDetailDTO = async (
  consumptionDetail: ConsumptionDetails[]
): Promise<ConDetailDTO[]> => {
  return Promise.all(
    consumptionDetail.map(async (detail) => {
      const omittedData = customOmit<
        ConsumptionDetails,
        "itemId" | "createdBy" | "updatedBy"
      >(detail, ["itemId", "createdBy", "updatedBy"]);
      const item = await itemMasterService.getItemMasterById(
        { itemId: detail.itemId },
        true
      );
      const createdBy = detail.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.createdBy)
        : null;
      const updatedBy = detail.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.updatedBy)
        : null;
      return {
        ...omittedData.rest,
        item: item ? await itemMasterToDto(item) : null,
        createdBy,
        updatedBy,
      };
    })
  );
};
