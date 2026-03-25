import {
  CreateItemSearch,
  GetItemReq,
  GetItemReqStock,
  ItemMasterReq,
  ItemMasterUpdateReq,
} from "@/types/master/itemMaster.js";
import {
  boolOptional,
  idOptional,
  idRequired,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

// Define the schema for item master creation
export const itemMasterSchema = Joi.object<ItemMasterReq | ItemMasterUpdateReq>(
  {
    item: strRequired("Item Name", 3),

    itemCode: strOptional("Item Code"),

    itemCategoryId: idRequired("Item Category ID"),
    storageId: idOptional("Storage Id"),

    unitId: idRequired("Unit Id"),

    basePrice: priceRequired("BasePrice"),

    reOrderLevel: idOptional("Re-Order Level"),

    taxDetailsId: idOptional("Tax Details ID"),

    itemDescription: strOptional("Item Description"),

    isBatchNumber: boolOptional("Is Batch Number"),

    isExpireDate: boolOptional("Is Expire Date"),

    isReturnable: boolOptional("Is Returnable"),

    isLock: boolOptional("Is Lock"),

    frontImage: strOptional("Front Image"),
    backImage: strOptional("Back Image"),
    leftSideImage: strOptional("Left Image"),
    rightSideImage: strOptional("Right Image"),
  },
);

const multipleDocsAttr = [
  { key: "frontImage", path: "frontImage" },
  { key: "backImage", path: "backImage" },
  { key: "leftSideImage", path: "leftSideImage" },
  { key: "rightSideImage", path: "rightSideImage" },
];

// Validate for create operation
export const validateItemMasterCreate = validationHandler({
  schema: itemMasterSchema,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr,
});

export const itemMasterSchemaUpdate = itemMasterSchema.keys({
  id: idRequired("Item Id"),
});

// Validate for update operation

export const validateItemMasterUpdate = validationHandler({
  schema: itemMasterSchemaUpdate,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr,
});

export const createItemSearchSchema = Joi.object<CreateItemSearch>({
  searchText: strRequired("Search text", 2),

  unitId: idOptional("Medicine Unit Id"),

  itemCategoryId: idOptional("Medicine Category Id"),
});

export const validateItemSearch = validationHandler({
  schema: createItemSearchSchema,
});

export const getItemPriceSchema = Joi.object<GetItemReq>({
  ccId: idOptional("CC Id"),
  itemId: idRequired("Item Id"),
  supplierId: idOptional("Supplier Id"),
  userId: idOptional("User Id"),
});

export const validateGetItem = validationHandler({
  schema: getItemPriceSchema,
});

export const getItemStockReqSchema = Joi.object<GetItemReqStock>({
  id: idOptional("Id"),
  userId: idOptional("User Id"),
  isZeroQty: boolOptional("Is zero quantity"),
  ccId: idOptional("Cc Id"),
})
  .xor("userId", "ccId")
  .messages({
    "object.missing": "Either User Id or Cc Id is required",
    "object.xor": "Only one of User Id or Cc Id can be provided at a time",
  });

export const validateItemStock = validationHandler({
  schema: getItemStockReqSchema,
});
