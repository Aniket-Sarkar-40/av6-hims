import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { BranchDTO, BranchDTOLocation } from "@/types/master/branch.js";
import {
  WarehouseDTO,
  WarehouseDTOLocation,
} from "@/types/master/warehouse.js";
import { validateIdBranch } from "@/validations/service/master/branch.service.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { settingsService } from "@/services/master/settings.service.js";
export const getBranchOrWarehouse = async (
  ccId: number,
): Promise<BranchDTO | WarehouseDTO | null> => {
  const branch = await branchService.getBranchById(ccId, true);
  const warehouse = await warehouseService.getWarehouseById(ccId, true);

  const cc = branch ? branch : warehouse;
  return cc;
};
export const validateBranchOrWarehouse = async (ccId: number) => {
  const settings = await settingsService.getSettings(true);
  const warehouseMode = settings?.warehouseMode;
  let cc: BranchDTO | WarehouseDTO | null;
  if (!warehouseMode) {
    cc = await validateIdBranch(ccId);
  } else {
    cc = await getBranchOrWarehouse(ccId);
    if (!cc) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Collection Center"),
      );
    }
  }
  return cc;
};

export const getAllBranchAndWarehouse = async (): Promise<
  (BranchDTO | WarehouseDTO)[]
> => {
  const warehouse = await warehouseService.getAllWarehouse(true);
  const branch = await branchService.getAllBranch(true);

  const collectionCenters: (BranchDTO | WarehouseDTO)[] = [
    ...warehouse,
    ...branch,
  ];

  return collectionCenters;
};

export async function getBranchAndWarehouseByCcIds(ccIds: number | number[]) {
  const ids = Array.isArray(ccIds) ? ccIds : [ccIds];
  if (!ids.length) return {};

  const [branches, warehouses] = await Promise.all([
    branchService.getBranchesByCcIdsAsLocation(ids),
    warehouseService.getWarehousesByCcIdsAsLocation(ids),
  ]);

  const result: Record<
    number,
    { branch: BranchDTOLocation | null; warehouse: WarehouseDTOLocation | null }
  > = {};

  branches.forEach((b) => (result[b.id] = { branch: b, warehouse: null }));
  warehouses.forEach((w) => {
    if (result[w.id]) result[w.id].warehouse = w;
    else result[w.id] = { branch: null, warehouse: w };
  });

  return result;
}

// export const validateBranchOrWarehouse = async (ccId: number) => {
//   const wareHouseMode = requestStorage.getStore()?.settings?.warehouseMode;
//   if (wareHouseMode) {
//     const warehouse = await warehouseService.getWarehouseById(ccId, true);
//     if (!warehouse) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Warehouse"));
//   } else {
//     const branch = await branchService.getBranchById(ccId, true);
//     if (!branch) {
//       throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Branch"));
//     }
//   }
// };
