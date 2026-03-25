import { branchService } from "@/services/master/branch.service";
import { BranchDTO, BranchDTOLocation, BranchResponse } from "@/types/master/branch";
import { customOmit } from "@/utils/helper.utils";

export const toBranchDTO = async (branch: BranchResponse): Promise<BranchDTO> => {
  const omittedBranch = customOmit<
    BranchResponse,
    "createdBy" | "updatedBy" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
  >(branch, ["createdAt", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);
  const cc = await branchService.getCollectionCenterById(branch.id, true);
  return {
    ...omittedBranch.rest,
    collectionCenter: cc,
  };
};

export const toBranchDTOLocation = async (branch: BranchResponse): Promise<BranchDTOLocation> => {
  const omittedBranch = customOmit<
    BranchResponse,
    "createdBy" | "updatedBy" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
  >(branch, ["createdAt", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);
  return {
    ...omittedBranch.rest,
    collectionCenter: branch.collectionCenter,
  };
};
