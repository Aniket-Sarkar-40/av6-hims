import { collectionCenterService } from "@/services/master/collectionCenter.service.js";
import { PathologyMasterDTO } from "@/types/pathology/pathology.js";
import { customOmit, toIdValue } from "av6-utils";
import { PathologyMaster } from "@repo/db/generated/prisma/client";

export const toPathologyMasterDTO = async (
  input: PathologyMaster,
): Promise<PathologyMasterDTO> => {
  const omittedInput = customOmit<
    PathologyMaster,
    "ccId" | "isActive" | "orderable"
  >(input, ["ccId", "isActive", "orderable"]);

  const cc = await collectionCenterService.getCollectionCenterById(
    input.ccId,
    true,
  );
  return {
    ...omittedInput.rest,
    collectionCenter: cc ? toIdValue(cc, "colName") : null,
  };
};
