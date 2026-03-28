import {
  getItemByIdFromDb,
  getItemFromDbByName,
} from "@/repository/item/item.repository.js";
import {
  getItemInstructionMapByIdFromDb,
  getItemInstructionMapByItemAndInstructionIdFromDb,
} from "@/repository/item/itemInstructionMap.repository.js";
import { UpdateItemInput } from "@/types/item/item.js";
import { CreateItemInstructionMap } from "@/types/item/itemDosageMap.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdMedicineInstruction } from "../master/medInstruction.service.validation.js";
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

export const validateIdItemInstructionMap = async (id: number) => {
  logger.info("entering::validateIdItemInstructionMap service::validation");
  validIdCheck(id);
  const itemInstructionMap = await getItemInstructionMapByIdFromDb(id);
  if (!itemInstructionMap) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "item instruction"),
    );
  }
  logger.info("exiting::validateIdItemInstructionMap::service::validation");

  return itemInstructionMap;
};

export const createItemInstructionMapServiceValidation = async (
  body: CreateItemInstructionMap,
) => {
  logger.info(
    "entering::createItemInstructionMapServiceValidation::serviceVal::validation",
  );

  await validateIdItem(body.itemId);
  await validateIdMedicineInstruction(body.instructionId);
  const existing = await getItemInstructionMapByItemAndInstructionIdFromDb(
    body.itemId,
    body.instructionId,
  );

  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item and instruction mapping"),
    );
  }

  logger.info(
    "exiting::createItemInstructionMapServiceValidation::service::validation",
  );
};

export const updateItemInstructionMapServiceValidation = async (
  body: CreateItemInstructionMap,
) => {
  logger.info(
    "entering::updateItemInstructionMapServiceValidation::serviceVal::validation",
  );
  if (!body.id)
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Item instruction mapping "),
    );

  await validateIdItemInstructionMap(body.id);

  const existing = await getItemInstructionMapByItemAndInstructionIdFromDb(
    body.itemId,
    body.instructionId,
  );

  if (existing && existing.id !== Number(body.id)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item and instruction mapping"),
    );
  }

  await validateIdItem(body.itemId);
  await validateIdMedicineInstruction(body.instructionId);

  logger.info(
    "exiting::updateItemInstructionMapServiceValidation::service::validation",
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

  const existingMed = await getItemFromDbByName(body.medicineName);

  if (existingMed && existingMed.id !== Number(body.id)) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item"));
  }

  logger.info("exiting::updateIdItemServiceValidation::service::validation");

  return item;
};
