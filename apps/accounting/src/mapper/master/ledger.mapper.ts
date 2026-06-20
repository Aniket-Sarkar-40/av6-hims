import { commonGetService } from "@/services/common.service.js";
import {
  LedgerDTO,
  LedgerDTOForTrialBalance,
  LedgerResponse,
} from "@/types/master/ledger.js";
import { Ledger } from "@repo/db/generated/prisma/client";
import { customOmit, toIdValue } from "av6-utils";

export const toLedgerDto = async (
  input: LedgerResponse[]
): Promise<LedgerDTO[]> => {
  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const response: LedgerDTO[] = input.map((ledger) => {
    return {
      ...customOmit(ledger, [
        "company",
        "companyId",
        "groupId",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "deletedBy",
        "isActive",
      ]).rest,
      company: toIdValue(ledger.company, "name"),
      group: toIdValue(
        groups.find((g) => g.id === ledger.groupId),
        "name"
      ),
    };
  });
  return response;
};

export const toLedgerDtoForTrialBalance = async (
  input: Ledger[]
): Promise<LedgerDTOForTrialBalance[]> => {
  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const response: LedgerDTOForTrialBalance[] = input.map((ledger) => {
    const group = groups.find((g) => g.id === ledger.groupId);

    return {
      ...customOmit(ledger, [
        "companyId",
        "groupId",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "deletedBy",
        "isActive",
      ]).rest,

      group: toIdValue(group, "name"),
      parentGroup: toIdValue(
        groups.find((g) => g.id === group?.parentId),
        "name"
      ),
    };
  });
  return response;
};
