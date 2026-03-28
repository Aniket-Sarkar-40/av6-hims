import { getBranchCategoryMapByBranchIdFromDb } from "@/repository/master/branch.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { cityService } from "@/services/master/city.service.js";
import { collectionCenterService } from "@/services/master/collectionCenter.service.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { BranchDropDown, BranchDTO } from "@/types/master/branch.js";
import { IdValue } from "@repo/shared/types/global.js";
import { toIdValue } from "av6-utils";
import { PmsBranch } from "@repo/db/generated/prisma/client";

export const toBranchDTO = async (branch: PmsBranch): Promise<BranchDTO> => {
  const cityDTO =
    branch.cityId !== null
      ? await cityService.getCityById(branch.cityId, true)
      : null;
  const collectionCenter =
    await collectionCenterService.getCollectionCenterById(branch.id, true);
  const branchCategoryMap = await getBranchCategoryMapByBranchIdFromDb(
    branch.id,
  );
  let IdValues: IdValue[] = [];
  if (branchCategoryMap.length !== 0) {
    const categories = await Promise.all(
      branchCategoryMap.map((cat) =>
        medCategoryService.getMedCategoryById(cat, true),
      ),
    ).then((cats) => cats.filter((cat) => cat !== null));

    IdValues = categories
      .map((category) => toIdValue(category, "name"))
      .filter((idValue) => idValue !== null);
  }
  return {
    id: branch.id,
    name: branch.name,
    vatNo: branch.vatNo,
    tinNo: branch.tinNo,
    businessSubline: branch.businessSubline,
    pharmacistName: branch.pharmacistName,
    countryCode: branch.countryCode,
    phone: branch.phone,
    email: branch.email,
    address: branch.address,
    area: branch.area,
    pinCode: branch.pinCode,
    location: cityDTO,
    collectionCenter,
    latitudeLongitude: branch.latitudeLongitude,
    isMain: branch.isMain,
    isActive: branch.isActive,
    createdBy: branch.createdBy,
    updatedBy: branch.updatedBy,
    categoryMapping: IdValues,
    isAutonomous: branch.isAutonomous,
  };
};

export const toItemBranchMapBranchDTO = async (
  branchId: number,
): Promise<BranchDropDown> => {
  const branch = await branchService.getBranchByIdWoDTO(branchId, true);

  return {
    id: branchId,
    name: branch?.name ? branch?.name : null,
  };
};
