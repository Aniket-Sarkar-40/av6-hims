import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  ConsumptionDTO,
  ConsumptionResponse,
} from "@/types/consumption/consumption.js";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { customOmit } from "av6-utils";
import { toIdValue } from "av6-utils";
import { ConsumptionDetails } from "@repo/db/generated/prisma/client";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { itemMasterToDto } from "../master/itemMaster.mapper.js";

export const toConsumptionDTO = async (
  consumption: ConsumptionResponse[],
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
        true,
      );
      const requester = await employeeService.getEmployeeByIdFrmCacheOrDb(
        consumption.requestedBy,
        true,
      );
      const createdBy = consumption.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.createdBy,
            true,
          )
        : null;
      const updatedBy = consumption.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.updatedBy,
            true,
          )
        : null;
      const approvedBy = consumption.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.approvedBy,
            true,
          )
        : null;
      const rejectedBy = consumption.rejectedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.rejectedBy,
            true,
          )
        : null;
      const deletedBy = consumption.deletedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            consumption.deletedBy,
            true,
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
          return {
            ...omittedDetail.rest,
            item: item ? await itemMasterToDto(item) : null,
          };
        }),
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
    }),
  );
};
