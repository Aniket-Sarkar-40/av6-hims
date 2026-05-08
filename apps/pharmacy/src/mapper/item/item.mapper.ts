import { getInsurancePricing } from "@/repository/insurance/insurancePaymentSettings.repository.js";
import { getItemBranchMapByItemAndBranchIdFromDb } from "@/repository/item/itemBranchMap.repository.js";
import { getCorporateClientPaymentSettings } from "@/repository/opd/corporate.repository.js";
import { getItemStockQtyByLocation } from "@/repository/stock/stock.repository.js";
import { itemService } from "@/services/item/item.service.js";
import { boxSizeService } from "@/services/master/boxSize.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { manufactureService } from "@/services/master/manufacture.service.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { medCompositionService } from "@/services/master/medComposition.service.js";
import { medDosageService } from "@/services/master/medDosage.service.js";
import { medDrugService } from "@/services/master/medDrug.service.js";
import { medInstructionService } from "@/services/master/medInstruction.service.js";
import { medPackageService } from "@/services/master/medPackage.service.js";
import { medTypeService } from "@/services/master/medType.service.js";
import { medUnitService } from "@/services/master/medUnit.service.js";
import { storageService } from "@/services/master/storage.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  CreateItemInput,
  CreateItemReq,
  GetItemReq,
  ItemAppointmentDTO,
  ItemDTO,
  ItemForSearch,
  ItemImageFiles,
  ItemSearchDTO,
  ItemSearchInput,
  ItemStockDTO,
  SlowMovingItem,
  SlowMovingItemDTO,
  StorageDTO,
  UpdateItemInput,
  UpdateItemReq,
} from "@/types/item/item.js";
import { ItemBranchMapDTO } from "@/types/item/itemBranchMap.js";
import {
  ItemDosageMapDTO,
  ItemInstructionMapDTO,
} from "@/types/item/itemDosageMap.js";
import { ItemStockBatchWiseDTO } from "@/types/stock/stock.js";
import {
  toPublicImageUrl,
  toRelativeImagePath,
} from "@repo/shared/utils/helper.utils.js";
import {
  BranchItemMap,
  IMAGE_NAME,
  InsurerPaymentSettings,
  ItemImages,
  ItemInstructionMap,
  ItemMedicineDosageMap,
  PmsItemStock,
  PharmacyClientPaymentSettings,
  PmsItem,
} from "@repo/db/generated/prisma/client";
import { DecimalToNumber } from "@repo/platform/types/common.js";
import { toNumberDeep } from "@/utils/commonCalculation.utils.js";
import { customOmit } from "av6-core-v2";

export const toItemEntity = (
  item: CreateItemReq,
  images: ItemImageFiles | undefined
): CreateItemInput => {
  const imagesData: { name: IMAGE_NAME; url: string; isPrimary: boolean }[] =
    [];

  if (images?.frontImage?.[0].path) {
    imagesData.push({
      name: IMAGE_NAME.Front,
      url: images.frontImage?.[0].path
        ? toRelativeImagePath(images.frontImage?.[0].path)
        : "",
      isPrimary: true,
    });
  }
  if (images?.backImage?.[0].path) {
    imagesData.push({
      name: IMAGE_NAME.Back,
      url: images.backImage?.[0].path
        ? toRelativeImagePath(images.backImage?.[0].path)
        : "",
      isPrimary: false,
    });
  }
  if (images?.leftSideImage?.[0].path) {
    imagesData.push({
      name: IMAGE_NAME.Left,
      url: images.leftSideImage?.[0].path
        ? toRelativeImagePath(images.leftSideImage?.[0].path)
        : "",
      isPrimary: false,
    });
  }

  if (images?.rightSideImage?.[0].path) {
    imagesData.push({
      name: IMAGE_NAME.Right,
      url: images.rightSideImage?.[0].path
        ? toRelativeImagePath(images.rightSideImage?.[0].path)
        : "",
      isPrimary: false,
    });
  }

  // console.log(imagesData);

  return {
    images: imagesData,
    ...item,
    itemNumber: item.itemNumber,
    barcode: images?.barcode?.[0].path
      ? toRelativeImagePath(images.barcode?.[0].path)
      : undefined,
    onHoldSale: item.onHoldSale ? new Date(item.onHoldSale) : undefined,
    drugTypeId: Number(item.drugTypeId),
    storageId: Number(item.storageId) || null,
    medCompId: Number(item.medCompId),
    medTypeId: Number(item.medTypeId),
    medUnitId: Number(item.medUnitId),
    packSizeId: Number(item.packSizeId),
    boxSizeId: Number(item.boxSizeId) || null,
    medCategoryId: Number(item.medCategoryId),
    medManufacturerId: Number(item.medManufacturerId),
    purchaseAmount: Number(item.purchaseAmount),
    saleAmount: Number(item.saleAmount),
    defaultDiscount: Number(item.defaultDiscount),
    defaultB2BDiscount: Number(item.defaultB2BDiscount),
    minStock: Number(item.minStock),
    maxStock: Number(item.maxStock),
    tax: Number(item.tax),
    isAllowLooseSale: item.isAllowLooseSale === "true",
    isLockDiscount: item.isLockDiscount === "true",
    isLockB2BDiscount: item.isLockB2BDiscount === "true",
    acceptOnlineOrder: item.acceptOnlineOrder === "true",
    isReturnable: item.isReturnable === "true",
    isSuggestionLock: item.isSuggestionLock === "true",
    insurancePercentage: Number(item.insurancePercentage),
    walkInPercentage: Number(item.walkInPercentage),
  };
};
export const toItemUpdateEntity = (
  item: UpdateItemReq,
  images: ItemImageFiles | undefined
): UpdateItemInput => {
  return {
    ...toItemEntity(item, images),
    id: item.id,
  };
};

export const toItemDto = async (
  item: PmsItem & { itemImages: ItemImages[] },
  itemReq?: GetItemReq
): Promise<ItemDTO> => {
  const drugDto = await medDrugService.getMedDrugById(item.drugTypeId, true);
  const compDto = await medCompositionService.getCMedCompoById(
    item.medCompId,
    true
  );
  const typeDto = await medTypeService.getMedTypeById(item.medTypeId, true);
  const unitDto = await medUnitService.getMedUnitById(item.medUnitId, true);
  const packDto = await medPackageService.getMedPackageById(
    item.packSizeId,
    true
  );
  const categoryDto = await medCategoryService.getMedCategoryByIdWODto(
    item.medCategoryId,
    true
  );
  const manufacture = await manufactureService.getManufactureById(
    item.manufacturerId,
    true
  );
  const boxSize = item.boxSizeId
    ? await boxSizeService.getBoxSizeById(item.boxSizeId, true)
    : null;
  const rawStorage = item.storageId
    ? await storageService.getStorageById(item.storageId, true)
    : null;

  const storage: StorageDTO | null = rawStorage
    ? { id: rawStorage.id, name: rawStorage.name }
    : null;
  let itemBranchPricing: BranchItemMap | null = null;
  let insurancePricing: InsurerPaymentSettings | null = null;
  let corporateClientPricing: PharmacyClientPaymentSettings | null = null;

  const {
    warehouseId,
    branchId,
    insuranceId,
    isCustomPricing,
    corporateClientId,
  } = itemReq ?? {};

  if (isCustomPricing && branchId) {
    itemBranchPricing = await getItemBranchMapByItemAndBranchIdFromDb({
      branchId,
      itemId: item.id,
    });
  }
  if (isCustomPricing && insuranceId && branchId) {
    insurancePricing = await getInsurancePricing(
      insuranceId,
      branchId,
      item.id
    );
  }
  if (isCustomPricing && corporateClientId && branchId) {
    corporateClientPricing = await getCorporateClientPaymentSettings(
      corporateClientId,
      branchId,
      item.id
    );
  }

  let warehouseStock = null;
  let branchStock = null;

  if (warehouseId) {
    warehouseStock = await getItemStockQtyByLocation(item.id, { warehouseId });
  }
  if (branchId) {
    branchStock = await getItemStockQtyByLocation(item.id, { branchId });
  }

  const images = item.itemImages.reduce(
    (acc, img) => {
      switch (img.name) {
        case IMAGE_NAME.Front:
          acc.frontImage = toPublicImageUrl(img.url);
          break;
        case IMAGE_NAME.Back:
          acc.backImage = toPublicImageUrl(img.url);
          break;
        case IMAGE_NAME.Left:
          acc.leftImage = toPublicImageUrl(img.url);
          break;
        case IMAGE_NAME.Right:
          acc.rightImage = toPublicImageUrl(img.url);
          break;
      }
      return acc;
    },
    {
      frontImage: null,
      backImage: null,
      leftImage: null,
      rightImage: null,
    } as Record<
      "frontImage" | "backImage" | "leftImage" | "rightImage",
      string | null
    >
  );

  let saleAmount = Number(item.saleAmount);
  let insurancePercentage = Number(item.insurancePercentage);

  if (insurancePricing) {
    saleAmount = Number(insurancePricing.mrp);
    insurancePercentage = Number(insurancePricing.insurancePercentage);
  } else if (itemBranchPricing) {
    saleAmount = itemBranchPricing?.saleAmount
      ? itemBranchPricing.saleAmount.toNumber()
      : Number(item.saleAmount);
    insurancePercentage = itemBranchPricing?.insurancePercentage
      ? itemBranchPricing.insurancePercentage.toNumber()
      : Number(item.insurancePercentage);
  }

  let coPayAmount = null;
  let patientPayAmount = null;

  if (insurancePricing) {
    coPayAmount = Number(insurancePricing.coPay);
    patientPayAmount = Number(insurancePricing.patientPay);
  }

  return {
    id: item.id,
    itemNumber: item.itemNumber,
    medicineName: item.medicineName,
    minOrderDetails: item.minOrderDetails,
    rackLocation: item.rackLocation,
    defaultDiscount: itemBranchPricing?.defaultDiscount
      ? itemBranchPricing.defaultDiscount.toNumber()
      : Number(item.defaultDiscount),
    defaultB2BDiscount: itemBranchPricing?.defaultB2BDiscount
      ? itemBranchPricing.defaultB2BDiscount.toNumber()
      : Number(item.defaultB2BDiscount),
    minStock: item.minStock,
    maxStock: item.maxStock,
    tax: itemBranchPricing?.tax
      ? itemBranchPricing.tax.toNumber()
      : Number(item.tax),
    isAllowLooseSale: item.isAllowLooseSale,
    taxMethod: itemBranchPricing?.taxMethod
      ? itemBranchPricing.taxMethod
      : item.taxMethod,
    status: item.status,
    purchaseAmount: itemBranchPricing?.purchaseAmount
      ? itemBranchPricing.purchaseAmount.toNumber()
      : Number(item.purchaseAmount),
    saleAmount: saleAmount,
    remark: item.remark,
    onHoldSale: itemBranchPricing?.onHoldSale
      ? itemBranchPricing.onHoldSale
      : item.onHoldSale,
    medPackingType: item.medPackingType,
    isLockB2BDiscount: item.isLockB2BDiscount,
    isLockDiscount: item.isLockDiscount,
    isReturnable: item.isReturnable,
    isSuggestionLock: item.isSuggestionLock,
    acceptOnlineOrder: item.acceptOnlineOrder,
    cess: item.cess,
    hsnCode: item.hsnCode,
    itemAlias: item.itemAlias,
    tags: item.tags,
    insurancePercentage: insurancePercentage,
    walkInPercentage: itemBranchPricing?.walkInPercentage
      ? itemBranchPricing.walkInPercentage.toNumber()
      : Number(item.walkInPercentage),
    branchInHandStock: branchStock,
    warehouseInHandStock: warehouseStock,
    insuredCoPay: coPayAmount,
    insuredPatientPay: patientPayAmount,
    corporateClientPaymentMode: corporateClientPricing?.paymentMode ?? null,

    barcode: toPublicImageUrl(item.barcode),
    ...images,
    medCategory: categoryDto,
    medType: typeDto,
    medComp: compDto,
    medUnit: unitDto,
    packSize: packDto,
    drugType: drugDto,
    medManufacturer: manufacture,
    boxSize: boxSize,
    storage: storage,
    isActive: item.isActive,
  };
};

export const toItemWoDto = async (
  item: DecimalToNumber<PmsItem>,
  branchId?: number
): Promise<DecimalToNumber<PmsItem>> => {
  let itemBranchPricing: BranchItemMap | null = null;
  let itemBranchPricingNumber: DecimalToNumber<BranchItemMap> | null = null;

  if (branchId) {
    itemBranchPricing = await getItemBranchMapByItemAndBranchIdFromDb({
      branchId,
      itemId: item.id,
    });
  }

  if (itemBranchPricing) {
    itemBranchPricingNumber = toNumberDeep(itemBranchPricing);
  }

  return {
    ...item,
    defaultDiscount: itemBranchPricingNumber?.defaultDiscount
      ? itemBranchPricingNumber.defaultDiscount
      : item.defaultDiscount,
    defaultB2BDiscount: itemBranchPricingNumber?.defaultB2BDiscount
      ? itemBranchPricingNumber?.defaultB2BDiscount
      : item.defaultB2BDiscount,
    tax: itemBranchPricingNumber?.tax ? itemBranchPricingNumber.tax : item.tax,
    taxMethod: itemBranchPricingNumber?.taxMethod
      ? itemBranchPricingNumber.taxMethod
      : item.taxMethod,
    purchaseAmount: itemBranchPricingNumber?.purchaseAmount
      ? itemBranchPricingNumber.purchaseAmount
      : item.purchaseAmount,
    saleAmount: itemBranchPricingNumber?.saleAmount
      ? itemBranchPricingNumber.saleAmount
      : item.saleAmount,
    onHoldSale: itemBranchPricingNumber?.onHoldSale
      ? itemBranchPricingNumber.onHoldSale
      : item.onHoldSale,
    insurancePercentage: itemBranchPricingNumber?.insurancePercentage
      ? itemBranchPricingNumber.insurancePercentage
      : item.insurancePercentage,
    walkInPercentage: itemBranchPricingNumber?.walkInPercentage
      ? itemBranchPricingNumber.walkInPercentage
      : item.walkInPercentage,
  };
};

export const toItemSearch = (item: PmsItem): ItemForSearch => {
  return {
    hsnCode: item.hsnCode,
    id: item.id,
    itemNumber: item.itemNumber,
    itemAlias: item.itemAlias,
    medicineName: item.medicineName,
    status: item.status,
    purchaseAmount: Number(item.purchaseAmount),
    saleAmount: Number(item.saleAmount),

    drugType: item.drugTypeId,
    medCategoryId: item.medCategoryId,
    medCompId: item.medCompId,
    medManufacturer: item.manufacturerId,
    medTypeId: item.medTypeId,
    medUnitId: item.medUnitId,
    packSize: item.packSizeId,
  };
};

export const toItemSearchDTO = async (
  input: ItemSearchInput
): Promise<ItemSearchDTO> => {
  const item = input.item;
  // const drugDto =
  //   item.drugType !== null
  //     ? await medDrugService.getMedDrugById(item.drugType, true)
  //     : null;
  // const compDto =
  //   item.medCompId !== null
  //     ? await medCompositionService.getCMedCompoById(item.medCompId, true)
  //     : null;
  // const typeDto = item.medTypeId
  //   ? await medTypeService.getMedTypeById(item.medTypeId, true)
  //   : null;
  // const unitDto = item.medUnitId
  //   ? await medUnitService.getMedUnitById(item.medUnitId, true)
  //   : null;
  // const packDto = item.packSize
  //   ? await medPackageService.getMedPackageById(item.packSize, true)
  //   : null;
  // const categoryDto = item.medCategoryId
  //   ? await medCategoryService.getMedCategoryByIdWODto(item.medCategoryId, true)
  //   : null;
  // const manufacture = item.medManufacturer
  //   ? await manufactureService.getManufactureById(item.medManufacturer, true)
  //   : null;

  const manufacturer =
    input.manufacturer?.find((man) => man.id === item.medManufacturer) || null;

  const unit = input.units?.find((data) => data.id === item.medUnitId) || null;

  const category =
    input.categories?.find((cat) => cat.id === item.medCategoryId) || null;

  return {
    id: item.id,
    itemNumber: item.itemNumber,
    medicineName: item.medicineName,

    status: item.status,
    purchaseAmount: item.purchaseAmount,
    saleAmount: item.saleAmount,

    medCategory: category
      ? {
          id: category.id,
          name: category.name,
        }
      : null,

    medManufacturer: manufacturer
      ? {
          id: manufacturer.id,
          name: manufacturer.name,
        }
      : null,

    medUnit: unit
      ? {
          id: unit.id,
          name: unit.name,
        }
      : null,

    // drugType: drugDto,
    // medCategory: categoryDto,
    // medComp: compDto,
    // medManufacturer: manufacture,
    // medType: typeDto,
    // medUnit: unitDto,
    // packSize: packDto,
  };
};

export const toItemStockDTO = async (
  stock: PmsItemStock
): Promise<ItemStockDTO> => {
  const item = await itemService.getItemByIdWoDTO(
    stock.itemId,
    true,
    stock.branchId ? stock.branchId : undefined
  );
  const warehouseDTO = stock.warehouseId
    ? await warehouseService.getWarehouseByIdWoDTO(stock.warehouseId, true)
    : null;

  const branchDTO = stock.branchId
    ? await branchService.getBranchByIdWoDTO(stock.branchId, true)
    : null;

  return {
    ...stock,
    item: item,
    warehouse: warehouseDTO,
    branch: branchDTO,
  };
};

export const toItemStockBatchDTO = async (
  stocks: PmsItemStock[]
): Promise<ItemStockBatchWiseDTO[]> => {
  const map = new Map<string, ItemStockBatchWiseDTO>();
  const getAllItems = await itemService.getAllItemWoDto();
  const getAllBranch = await branchService.getAllBranchWoDTO();
  const getAllWarehouse = await warehouseService.getAllWarehouseWoDTO();

  for (const stock of stocks) {
    const key = [
      `item-${stock.itemId}`,
      stock.batchNo ?? "NO_BATCH",
      stock.expiryDate?.toISOString() ?? "NO_EXPIRY",
    ].join("|");
    const omittedStock = customOmit(stock, ["branchId", "warehouseId"]);
    const branch = getAllBranch.find((br) => br.id === stock.branchId) ?? null;
    const warehouse =
      getAllWarehouse.find((wh) => wh.id === stock.warehouseId) ?? null;

    if (!map.has(key)) {
      map.set(key, {
        id: stock.id,
        batchNo: stock.batchNo ?? null,
        expiryDate: stock.expiryDate ?? null,
        quantity: stock.quantity,
        item: getAllItems.find((it) => it.id === stock.itemId) ?? null,
        stockDetails: [{ ...omittedStock.rest, branch, warehouse }],
      });
    } else {
      const existing = map.get(key)!;
      existing.quantity += stock.quantity;
      existing.stockDetails.push({ ...omittedStock.rest, branch, warehouse });
    }
  }

  return Array.from(map.values());
};

export const toSlowMovingItemDTO = async (
  item: SlowMovingItem
): Promise<SlowMovingItemDTO> => {
  const drugDto = await medDrugService.getMedDrugById(item.drug_type_id, true);
  const compDto = await medCompositionService.getCMedCompoById(
    item.medicine_composition_id,
    true
  );
  const typeDto = await medTypeService.getMedTypeById(
    item.medicine_type_id,
    true
  );
  const unitDto = await medUnitService.getMedUnitById(
    item.medicine_unit_id,
    true
  );
  const packDto = await medPackageService.getMedPackageById(
    item.pack_size_id,
    true
  );
  const categoryDto = await medCategoryService.getMedCategoryByIdWODto(
    item.medicine_category_id,
    true
  );
  const manufacture = await manufactureService.getManufactureById(
    item.manufacturer_id,
    true
  );
  const boxSizeDto = await boxSizeService.getBoxSizeById(
    item.box_size_id,
    true
  );

  return {
    id: item.id,
    itemNumber: item.item_number,
    medicineName: item.medicine_name,
    minOrderDetails: item.min_order_details,
    rackLocation: item.rack_location,
    defaultDiscount: item.default_disc,
    defaultB2BDiscount: item.default_b2b_disc,
    minStock: item.min_stock,
    maxStock: item.max_stock,
    tax: item.tax,
    isAllowLooseSale: item.is_allow_loose_sale,
    taxMethod: item.tax_method,
    status: item.status,
    purchaseAmount: item.purchase_amount,
    saleAmount: item.sale_amount,
    remark: item.remark,
    onHoldSale: item.onHoldSale,
    medPackingType: item.medicine_pack_type,
    barcode: item.barcode,
    isLockDiscount: item.is_lock_disc,
    isLockB2BDiscount: item.is_lock_b2b_disc,
    acceptOnlineOrder: item.accept_online_order,
    isReturnable: item.is_returnable,
    isSuggestionLock: item.is_suggestion_lock,
    cess: item.cess,
    hsnCode: item.hsn_code,
    itemAlias: item.item_alias,
    tags: item.tags,
    insurancePercentage: item.insurance_percentage,
    walkInPercentage: item.walk_in_percentage,
    lastSoldDate: item.last_sold_date,
    drugType: drugDto,
    medCategory: categoryDto,
    medComp: compDto,
    medManufacturer: manufacture,
    medType: typeDto,
    medUnit: unitDto,
    packSize: packDto,
    boxSize: boxSizeDto,
  };
};
export const toItemBranchPriceDTO = async (
  itemBranch: BranchItemMap
): Promise<ItemBranchMapDTO> => {
  const item = await itemService.getItemByIdWoDTO(itemBranch.itemId, true);

  const branchDTO = itemBranch.branchId
    ? await branchService.getBranchByIdWoDTO(itemBranch.branchId, true)
    : null;

  const omitted = customOmit<BranchItemMap, "itemId" | "branchId">(itemBranch, [
    "branchId",
    "itemId",
  ]);

  return {
    ...omitted.rest,
    item: item,
    branch: branchDTO,
  };
};

export const toItemDosageMapDTO = async (
  itemDosageMap: ItemMedicineDosageMap
): Promise<ItemDosageMapDTO> => {
  const item = await itemService.getItemByIdWoDTO(itemDosageMap.itemId, true);

  const dosage = await medDosageService.getMedDosageById(
    itemDosageMap.dosageId,
    true
  );

  return {
    id: itemDosageMap.id,
    qty: itemDosageMap.qty,
    dosage,
    item,
  };
};

export const toItemInstructionMapDTO = async (
  itemInstMap: ItemInstructionMap
): Promise<ItemInstructionMapDTO> => {
  const item = await itemService.getItemByIdWoDTO(itemInstMap.itemId, true);

  const instruction = await medInstructionService.getMedInstructionById(
    itemInstMap.instructionId,
    true
  );

  return {
    id: itemInstMap.id,
    instruction,
    item,
  };
};

export const toItemAppointmentDto = async (
  item: PmsItem
): Promise<ItemAppointmentDTO> => {
  const typeDto = await medTypeService.getMedTypeById(item.medTypeId, true);

  return {
    id: item.id,
    itemNumber: item.itemNumber,
    medicineName: item.medicineName,
    medPackingType: item.medPackingType,
    medType: typeDto,
  };
};
