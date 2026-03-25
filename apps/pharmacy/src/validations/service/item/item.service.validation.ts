import {
  getItemByIdFromDb,
  getItemFromDbByName,
  getItemNumberFromDb,
} from "@/repository/item/item.repository.js";
import { CreateItemInput, UpdateItemInput } from "@/types/item/item.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdMedCategory } from "../master/medCategory.service.validation.js";
import { validateIdMedicineComposition } from "../master/medComposition.service.validation.js";
import { validateIdMedicineDrug } from "../master/medDrug.service.validation.js";
import { validateIdMedicinePackage } from "../master/medPackage.service.validation.js";
import { validateIdMedType } from "../master/medType.service.validation.js";
import { validateIdMedicineUnit } from "../master/medUnit.service.validation.js";
import {
  getItemDosageMapByIdFromDb,
  getItemDosageMapByItemAndDosageIdFromDb,
} from "@/repository/item/itemDosageMap.repository.js";
import { CreateItemDosageMap } from "@/types/item/itemDosageMap.js";
import { validateIdMedicineDosage } from "../master/medDosage.service.validation.js";
import { validateIdBoxSize } from "../master/boxSize.service.validation.js";
import { PmsItem } from "@repo/db/generated/prisma/client";

export const validateIdItem = async (id: number) => {
  logger.info("entering::validateIdItem service::validation");
  validIdCheck(id);
  const item = await getItemByIdFromDb(id);
  if (!item) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "item "));
  }
  logger.info("exiting::validateIdItem::service::validation");

  return item;
};

export const validateIdItemDosageMap = async (id: number) => {
  logger.info("entering::validateIdItemDosageMap service::validation");
  validIdCheck(id);
  const itemDosageMap = await getItemDosageMapByIdFromDb(id);
  if (!itemDosageMap) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "item dosage"),
    );
  }
  logger.info("exiting::validateIdItemDosageMap::service::validation");

  return itemDosageMap;
};

export const createItemServiceValidation = async (body: CreateItemInput) => {
  logger.info("entering::createItemServiceValidation::serviceVal::validation");

  await validateIdMedicineComposition(body.medCompId);
  await validateIdMedicineDrug(body.drugTypeId);
  await validateIdMedicinePackage(body.packSizeId);
  await validateIdMedicineUnit(body.medUnitId);
  await validateIdMedType(body.medTypeId);
  if (body.boxSizeId) {
    await validateIdBoxSize(body.boxSizeId);
  }

  const category = await validateIdMedCategory(body.medCategoryId);
  const existingMed = await getItemFromDbByName(body.medicineName);
  if (body.itemNumber) {
    const existingItemNumber = await getItemNumberFromDb(body.itemNumber);
    if (existingItemNumber) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Number"),
      );
    }
  }

  if (existingMed) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item"));
  }
  if (category.minMarginB2CPercentage > body.insurancePercentage) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Insurance Percentage"),
    );
  }
  if (category.minMarginB2CPercentage > body.walkInPercentage) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Walk In Percentage"),
    );
  }

  logger.info("exiting::createItemServiceValidation::service::validation");
  //   return item;
};

export const createItemDosageMapServiceValidation = async (
  body: CreateItemDosageMap,
) => {
  logger.info(
    "entering::createItemDosageMapServiceValidation::serviceVal::validation",
  );

  await validateIdItem(body.itemId);
  await validateIdMedicineDosage(body.dosageId);
  const existing = await getItemDosageMapByItemAndDosageIdFromDb(
    body.itemId,
    body.dosageId,
  );

  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item and dosage mapping"),
    );
  }

  logger.info(
    "exiting::createItemDosageMapServiceValidation::service::validation",
  );
};

export const updateItemDosageMapServiceValidation = async (
  body: CreateItemDosageMap,
) => {
  logger.info(
    "entering::updateItemDosageMapServiceValidation::serviceVal::validation",
  );

  if (!body.id)
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Item dosage mapping "),
    );

  await validateIdItemDosageMap(body.id);

  const existing = await getItemDosageMapByItemAndDosageIdFromDb(
    body.itemId,
    body.dosageId,
  );

  if (existing && existing.id !== Number(body.id)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item and dosage mapping"),
    );
  }

  await validateIdItem(body.itemId);
  await validateIdMedicineDosage(body.dosageId);

  logger.info(
    "exiting::updateItemDosageMapServiceValidation::service::validation",
  );
};

export const updateIdItemServiceValidation = async (
  body: UpdateItemInput,
): Promise<PmsItem> => {
  logger.info("entering::updateIdItemServiceValidation::service::validation");

  if (!body.id) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_ID", "Item "));
  }

  const item = await validateIdItem(Number(body.id));

  await validateIdMedicineComposition(body.medCompId);
  await validateIdMedicineDrug(body.drugTypeId);
  await validateIdMedicinePackage(body.packSizeId);
  await validateIdMedicineUnit(body.medUnitId);
  await validateIdMedType(body.medTypeId);
  if (body.boxSizeId) {
    await validateIdBoxSize(body.boxSizeId);
  }
  const category = await validateIdMedCategory(body.medCategoryId);

  const existingMed = await getItemFromDbByName(body.medicineName);

  if (body.itemNumber) {
    const itemNumber = await getItemNumberFromDb(body.itemNumber);

    if (itemNumber && itemNumber.id !== Number(body.id)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Number"),
      );
    }
  }

  if (existingMed && existingMed.id !== Number(body.id)) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item"));
  }
  if (category.minMarginB2CPercentage > body.insurancePercentage) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Insurance Percentage"),
    );
  }
  if (category.minMarginB2CPercentage > body.walkInPercentage) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Walk In Percentage"),
    );
  }
  logger.info("exiting::updateIdItemServiceValidation::service::validation");

  return item;
};
