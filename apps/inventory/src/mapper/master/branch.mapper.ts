import { commonService } from "@/services/common.service.js";
import {
  BranchDTO,
  BranchDTOLocation,
  BranchResponse,
} from "@/types/master/branch.js";
import { customOmit } from "av6-utils";

export const toBranchDTO = async (
  data: BranchResponse[],
): Promise<BranchDTO[]> => {
  const allCollectionCenters =
    await commonService.getAllElements<"CollectionCenter">({
      cacheCode: "COLLECTION_CENTER",
      canNullReturnable: true,
      modelName: "CollectionCenter",
      shortCode: "COLLECTION_CENTER",
      useActiveFlag: true,
    });

  return data.map((branch) => {
    const omittedBranch = customOmit<
      BranchResponse,
      | "createdBy"
      | "updatedBy"
      | "deletedBy"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
    >(branch, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ]);

    const singleCollectionCenter =
      allCollectionCenters.find((cc) => cc.id === branch.id) ?? null;
    return {
      ...omittedBranch.rest,
      collectionCenter: singleCollectionCenter,
    };
  });
};

export const toBranchDTOLocation = async (
  branch: BranchResponse,
): Promise<BranchDTOLocation> => {
  const omittedBranch = customOmit<
    BranchResponse,
    | "createdBy"
    | "updatedBy"
    | "deletedAt"
    | "deletedBy"
    | "createdAt"
    | "updatedAt"
  >(branch, [
    "createdAt",
    "updatedBy",
    "deletedAt",
    "deletedBy",
    "createdAt",
    "updatedAt",
  ]);
  return {
    ...omittedBranch.rest,
    collectionCenter: branch.collectionCenter,
  };
};
