import { WarehouseDTO, WarehouseResponse, WarehouseDTOLocation } from "@/types/master/warehouse";
import { customOmit } from "@/utils/helper.utils";
import { toIdValue } from "@/utils/idValue.utils";

export const toWarehouseDTO = async (warehouse: WarehouseResponse): Promise<WarehouseDTO> => {
  const omittedWarehouse = customOmit<
    WarehouseResponse,
    "createdBy" | "updatedBy" | "isActive" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
  >(warehouse, ["createdAt", "updatedBy", "isActive", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);
  return {
    ...omittedWarehouse.rest,
    collectionCenter: toIdValue(warehouse.collectionCenter, "colName"),
  };
};

export const toWarehouseDTOLocation = async (warehouse: WarehouseResponse): Promise<WarehouseDTOLocation> => {
  const omittedWarehouse = customOmit<
    WarehouseResponse,
    "createdBy" | "updatedBy" | "isActive" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
  >(warehouse, ["createdAt", "updatedBy", "isActive", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);
  return {
    ...omittedWarehouse.rest,
    collectionCenter: warehouse.collectionCenter,
  };
};
