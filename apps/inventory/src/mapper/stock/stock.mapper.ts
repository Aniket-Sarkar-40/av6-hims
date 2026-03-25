import { coreRequests } from "@/client/core/request";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { ItemStockDTO } from "@/types/stock/stock";
import { itemMasterToDto } from "@/utils/commonResponse.utils";
import { toIdValue } from "@/utils/idValue.utils";
import { ItemStock } from "@prisma/client";

export const toStockDTO = async (stock: ItemStock): Promise<ItemStockDTO> => {
  const user = stock.userId ? await coreRequests.getEmployeeCache(stock.userId) : null;
  const item = await itemMasterService.getItemMasterById({ itemId: stock.itemId }, true);

  return {
    ...stock,
    item: item ? await itemMasterToDto(item) : null,
    user: toIdValue(user, "name"),
  };
};
