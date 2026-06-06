import { ItemMasterToDto } from "@/types/grn/grn.js";
import {
  ItemMasterDto,
  ItemMasterDtoStock,
} from "@/types/master/itemMaster.js";
import { toPickFields } from "@repo/shared/utils/idValue.utils.js";

export async function itemMasterToDto(
  item: ItemMasterDto | ItemMasterDtoStock
) {
  return toPickFields(item, [
    "id",
    "item",
    "itemCode",
    "itemDescription",
    "reOrderLevel",
    "unitMaster",
    "itemCategory",
    "isBatchNumber",
    "isExpireDate",
    "isUserReturnable",
    "isVendorReturnable",
    "isLock",
  ]) as ItemMasterToDto | null;
}
