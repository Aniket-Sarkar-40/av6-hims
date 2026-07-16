import { commonGetService } from "@/services/common.service.js";
import {
  CreateOrUpdateGroupExcelInput,
  CreateOrUpdateGroupInput,
  GroupDTO,
  GroupExcelRow,
  GroupResponse,
} from "@/types/master/group.js";
import { customOmit, toIdValue } from "av6-utils";
import {
  parseOptionalString,
  parseOptionalBoolean,
  parseEnum,
} from "@/utils/groupAndLedgerExcelImport.utils.js";
import {
  PRIMARY_CATEGORIES,
  REPORT_TYPES,
  NATURES,
} from "@/utils/groupAndLedgerExcelImport.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  generateErrorMessage,
  generateValidationErrorMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import {
  AccountingNature,
  AccountingPrimaryCategory,
  AccountingReportType,
} from "@repo/db/generated/prisma/enums.js";

export const mapRowToGroupExcelCreateInput = (
  row: GroupExcelRow,
  rowNo: number
): CreateOrUpdateGroupExcelInput => {
  const name = parseOptionalString(row.Name);
  if (!name) {
    throw new ErrorHandler(400, generateErrorMessage("FIELD_REQUIRED", "Name"));
  }
  if (name.length < 3) {
    throw new ErrorHandler(
      400,
      generateValidationErrorMessage("STRING_MIN", "Name", "3")
    );
  }

  const parentGroupName = parseOptionalString(row["Parent Group Name"]);
  const isPrimaryGroupFromExcel = parseOptionalBoolean(row["Is Primary Group"]);
  const isPrimaryGroup = isPrimaryGroupFromExcel ?? false;

  return {
    rowNo,
    name,
    alias: parseOptionalString(row.Alias),
    isPrimaryGroup,
    parentGroupName,
    primaryCategory: parseEnum<AccountingPrimaryCategory>(
      row["Primary Category"],
      PRIMARY_CATEGORIES,
      "Primary Category"
    ),
    reportType: parseEnum<AccountingReportType>(
      row["Report Type"],
      REPORT_TYPES,
      "Report Type"
    ),
    nature: parseEnum<AccountingNature>(row.Nature, NATURES, "Nature"),
    affectsGrossProfit: parseOptionalBoolean(row["Affects Gross Profit"]),
  };
};

export const buildGroupInputFromExcel = async (params: {
  item: GroupExcelRow;
  companyId: number;
}): Promise<CreateOrUpdateGroupInput> => {
  const { item, companyId } = params;

  const allGroups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });
  const existingGroup = allGroups.find(
    (g) => g.name === item.name && g.companyId === companyId
  );
  if (existingGroup) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Group")
    );
  }
  let parentId: number | null = null;
  let primaryCategory: AccountingPrimaryCategory | null = null;
  let reportType: AccountingReportType | null = null;
  let nature: AccountingNature | null = null;
  if (item.isPrimaryGroup) {
    primaryCategory = item.primaryCategory;
    reportType = item.reportType;
    nature = item.nature;
  } else {
    if (!item.parentGroupName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Parent Group Name")
      );
    }
    const parentGroup = allGroups.find(
      (g) => g.name === item.parentGroupName && g.companyId === companyId
    );
    if (!parentGroup) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Parent Group")
      );
    }
    parentId = parentGroup.id;
    primaryCategory = parentGroup.primaryCategory;
    reportType = parentGroup.reportType;
    nature = parentGroup.nature;
  }
  const allowedPryCat: AccountingPrimaryCategory[] = ["EXPENSE", "INCOME"];
  if (
    allowedPryCat.includes(item.primaryCategory as AccountingPrimaryCategory)
  ) {
    if (
      item.affectsGrossProfit === null ||
      item.affectsGrossProfit === undefined
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Affects Gross Profit")
      );
    }
  }
  if (
    !allowedPryCat.includes(item.primaryCategory as AccountingPrimaryCategory)
  ) {
    if (item.affectsGrossProfit) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_NOT_ALLOWED", "Affects Gross Profit")
      );
    }
  }
  return {
    companyId,
    name: item.name,
    alias: item.alias,
    isPrimaryGroup: item.isPrimaryGroup,
    parentId: parentId,
    primaryCategory: primaryCategory as AccountingPrimaryCategory,
    reportType: reportType as AccountingReportType,
    nature: nature as AccountingNature,
    affectsGrossProfit: item.affectsGrossProfit ?? undefined,
  };
};

export const toGroupDto = async (
  input: GroupResponse[]
): Promise<GroupDTO[]> => {
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
