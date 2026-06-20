import { commonGetService } from "@/services/common.service.js";
import { GroupDTO, GroupResponse } from "@/types/master/group.js";
import { customOmit, toIdValue } from "av6-utils";

export const toGroupDto = async (input: GroupResponse[]): Promise<GroupDTO[]> => {
  const allGroups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const response: GroupDTO[] = input.map((group) => {
    return {
      ...customOmit(group, [
        "company",
        "companyId",
        "parentId",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "deletedBy",
        "isActive",
      ]).rest,
      company: toIdValue(group.company, "name"),
      parent: group.parentId
        ? toIdValue(
            allGroups.find((g) => g.id === group.parentId),
            "name"
          )
        : null,
    };
  });

  return response;
};
