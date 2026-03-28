import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";
import { InvItemStock } from "@repo/db/generated/prisma/client";
import { ItemStockDTO } from "@/types/stock/stock.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { itemMasterToDto } from "../master/itemMaster.mapper.js";

export const toStockDTO = async (
  data: InvItemStock[],
): Promise<ItemStockDTO[]> => {
  const items = await itemMasterService.getAllItemMaster(true);

  return Promise.all(
    data.map(async (stock) => {
      const omittedStock = customOmit<
        InvItemStock,
        BaseModelAttrWoCancel | "ccId" | "userId" | "itemId"
      >(stock, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "ccId",
        "userId",
        "itemId",
      ]);
      const user = stock.userId
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(stock.userId, true)
        : null;
      const item = items.find((item) => item.id === stock.itemId) ?? null;
      return {
        ...omittedStock.rest,
        item: item ? await itemMasterToDto(item) : null,
        user: toIdValue(user, "name"),
      };
    }),
  );
};
