import { commonService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import {
  WarehouseDTO,
  WarehouseResponse,
  WarehouseDTOLocation,
} from "@/types/master/warehouse.js";
import { customOmit } from "av6-utils";

export const toWarehouseDTO = async (
  data: WarehouseResponse[]
): Promise<WarehouseDTO[]> => {
  const allCollectionCenters =
    await commonService.getAllElements<"CollectionCenter">({
      cacheCode: "COLLECTION_CENTER",
      canNullReturnable: true,
      modelName: "CollectionCenter",
      shortCode: "COLLECTION_CENTER",
      useActiveFlag: true,
    });

  return data.map((warehouse) => {
    const omittedWarehouse = customOmit<
      WarehouseResponse,
      BaseModelAttrWoCancel
    >(warehouse, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ]);

    const singleCollectionCenter =
      allCollectionCenters.find((cc) => cc.id === warehouse.id) ?? null;
    return {
      ...omittedWarehouse.rest,
      collectionCenter: singleCollectionCenter,
    };
  });
};

export const toWarehouseDTOLocation = async (
  warehouse: WarehouseResponse
): Promise<WarehouseDTOLocation> => {
  const omittedWarehouse = customOmit<
    WarehouseResponse,
    | "createdBy"
    | "updatedBy"
    | "isActive"
    | "deletedAt"
    | "deletedBy"
    | "createdAt"
    | "updatedAt"
  >(warehouse, [
    "createdAt",
    "updatedBy",
    "isActive",
    "deletedAt",
    "deletedBy",
    "createdAt",
    "updatedAt",
  ]);
  return {
    ...omittedWarehouse.rest,
    collectionCenter: warehouse.collectionCenter,
  };
};
