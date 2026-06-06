import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  ItemBatchStockCacheDTO,
  ItemBatchStockDTO,
  ItemBatchStockLookupInput,
} from "@/types/stock/stock.js";
import { InvItemStock } from "@repo/db/generated/prisma/client";

export const toItemBatchStockCacheDTO = async (
  data: InvItemStock
): Promise<ItemBatchStockCacheDTO> => {
  const [dto] = await toItemBatchStockCacheDTOList([data]);
  return dto;
};

export const toItemBatchStockCacheDTOList = async (
  data: InvItemStock[]
): Promise<ItemBatchStockCacheDTO[]> => {
  if (data.length === 0) return [];

  const items = await itemMasterService.getAllItemMaster(true);
  const itemMap = new Map(items.map((item) => [item.id, item]));
  return data.map((stock) => {
    const item = itemMap.get(stock.itemId) ?? null;
    return {
      id: stock.id,
      itemId: stock.itemId,
      batchNo: stock.batchNo,
      itemName: item?.item ?? "",
    };
  });
};

export const toAvailableItemBatchStockDTOList = (
  data: ItemBatchStockCacheDTO[],
  input: ItemBatchStockLookupInput
): ItemBatchStockDTO[] => {
  const searchBatchNo = input.batchNo.trim().toLowerCase();
  const seen = new Set<string>();
  const result: ItemBatchStockDTO[] = [];

  for (const stock of data) {
    if (!stock.batchNo) continue;
    if (stock.itemId === input.itemId) continue;
    if (!stock.batchNo.toLowerCase().includes(searchBatchNo)) continue;

    const key = `${stock.itemName}:${stock.batchNo}`;
    if (seen.has(key)) continue;
    seen.add(key);

    result.push({
      itemId: stock.itemId,
      itemName: stock.itemName,
      batchNo: stock.batchNo,
    });
  }

  return result;
};
