import { cityService } from "@/services/master/city.service.js";
import { collectionCenterService } from "@/services/master/collectionCenter.service.js";
import { WarehouseDTO } from "@/types/master/warehouse.js";

import { PmsWarehouse } from "@repo/db/generated/prisma/client";

export const toWarehouseDTO = async (
  warehouse: PmsWarehouse,
): Promise<WarehouseDTO> => {
  const cityDTO =
    warehouse.cityId !== null
      ? await cityService.getCityById(warehouse.cityId, true)
      : null;
  const collectionCenter =
    await collectionCenterService.getCollectionCenterById(warehouse.id, true);
  return {
    id: warehouse.id,
    name: warehouse.name,
    vatNo: warehouse.vatNo,
    tinNo: warehouse.tinNo,
    businessSubline: warehouse.businessSubline,
    contactPerson: warehouse.contactPerson,
    countryCode: warehouse.countryCode,
    phone: warehouse.phone,
    email: warehouse.email,
    address: warehouse.address,
    area: warehouse.area,
    pinCode: warehouse.pinCode,
    location: cityDTO,
    collectionCenter,
    latitudeLongitude: warehouse.latitudeLongitude,
    isMain: warehouse.isMain,
    isActive: warehouse.isActive,
    createdBy: warehouse.createdBy,
    updatedBy: warehouse.updatedBy,
  };
};
