import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { generalBillItemService } from "@/services/master/generalBillItem.service.js";
import {
  GeneralBillPricingDTO,
  GeneralBillPricingExcelRow,
  GeneralBillPricingResponse,
  GeneralBillPricingWithItemDTO,
} from "@/types/master/generalBillPricing.js";
import { customOmit, toIdValue } from "av6-utils";
import { GeneralBillPricing, Prisma } from "@repo/db/generated/prisma/client";

export const toGeneralBillPricingDTO = async (
  generalBillPricing: GeneralBillPricingResponse,
): Promise<GeneralBillPricingDTO> => {
  const omittedGeneralBillPricing = customOmit<
    GeneralBillPricingResponse,
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "deletedAt"
    | "collectionCenter"
  >(generalBillPricing, [
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
    "collectionCenter",
  ]);

  const createdBy = generalBillPricing.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        generalBillPricing.createdBy,
        true,
      )
    : null;
  const updatedBy = generalBillPricing.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        generalBillPricing.updatedBy,
        true,
      )
    : null;

  const generalBillItem = await generalBillItemService.getGeneralBillItemById(
    generalBillPricing.generalBillItemId,
    true,
  );

  return {
    ...omittedGeneralBillPricing.rest,
    cc: toIdValue(generalBillPricing.collectionCenter, "colName"),
    generalBillItem: toIdValue(generalBillItem, "name"),
    createdBy: createdBy ? toIdValue(createdBy, "name") : null,
    updatedBy: updatedBy ? toIdValue(updatedBy, "name") : null,
  };
};

export function mapRowToGeneralBillPricingExcelCreateInput(
  row: GeneralBillPricingExcelRow,
  ccId: number,
): Omit<Prisma.GeneralBillPricingExcelUncheckedCreateInput, "batchJobId"> {
  const mappedData: Omit<
    Prisma.GeneralBillPricingExcelUncheckedCreateInput,
    "batchJobId"
  > = {
    ccId,
    generalBillItemId: Number(row["General Bill Item ID"]),
    generalBillItemName: row["General Bill Item Name"] ?? "",
    price: Number(row["Price"]),
    description: row["Description"] ?? "",
  };

  return mappedData;
}

export const toGeneralBillPricingWithItemDTO = async (
  rows: GeneralBillPricing[],
): Promise<GeneralBillPricingWithItemDTO[]> => {
  const allItems = await generalBillItemService.getAllGeneralBillItemWoDto();

  return rows.map((row) => {
    const omitted = customOmit<
      GeneralBillPricing,
      | "isActive"
      | "createdBy"
      | "updatedBy"
      | "deletedBy"
      | "deletedAt"
      | "createdAt"
      | "updatedAt"
      | "description"
    >(row, [
      "isActive",
      "createdBy",
      "updatedBy",
      "deletedBy",
      "deletedAt",
      "createdAt",
      "updatedAt",
      "description",
    ]);

    const generalBillItem = allItems.find(
      (e) => e.id === row.generalBillItemId,
    );

    return {
      ...omitted.rest,
      itemName: generalBillItem?.name ?? "",
      itemDescription: generalBillItem?.description ?? null,
    };
  });
};
