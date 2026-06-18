import {
  getEmailFromDb,
  getItemSupplierByNameFromDb,
  getItemSupplierBySupplierCodeFromDb,
  getPhoneNumberFromDb,
} from "@/repository/master/itemSupplier.repository.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import {
  ItemSupplierCreateInput,
  ItemSupplierUpdateInput,
} from "@/types/master/itemSupplier.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdItemSupplier = async (itemSupplierId: number) => {
  logger.info("entering::validateIdItemSupplier::service::validation");

  validIdCheck(itemSupplierId);

  const itemSupplier = await itemSupplierService.getItemSupplierById(
    itemSupplierId,
    true
  );
  if (!itemSupplier) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Item Supplier")
    );
  }
  logger.info("exiting::validateIdItemSupplier::service::validation");

  return itemSupplier;
};

export const createItemSupplierServiceValidation = async (
  input: ItemSupplierCreateInput
): Promise<void> => {
  logger.info("entering::createItemSupplier::service::validation");

  if (input.supplierCode) {
    const code = await getItemSupplierBySupplierCodeFromDb(input.supplierCode);
    if (code) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Code")
      );
    }
  }
  const name = await getItemSupplierByNameFromDb(input.vendorCompanyName);
  if (name) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Name")
    );
  }

  if (input.phone) {
    const phone = await getPhoneNumberFromDb(input.phone);
    if (phone) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Phone Number")
      );
    }
  }
  if (input.email) {
    const email = await getEmailFromDb(input.email);
    if (email) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Email")
      );
    }
  }

  logger.info("exiting::createItemSupplier::service::validation");
};

export const updateItemSupplierServiceValidation = async (
  input: ItemSupplierUpdateInput
) => {
  logger.info("entering::updateItemSupplier::service::validation");

  const store = requestStorage.getStore();
  //const isAccounting = !!store?.settings?.isAccounting;

  await validateIdItemSupplier(input.id);

  input.isLedgerMappingExists = false;

  // if (isAccounting) {
  //   try {
  //     const result = await accountingExternalService.getClientLedgerMapping({
  //       clientType: "INV_ITEM_SUPPLIER",
  //       clientId: input.id,
  //     });

  //     input.isLedgerMappingExists = !!result.data;
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (error) {
  //     input.isLedgerMappingExists = false;
  //   }

  //   if (!input.isLedgerMappingExists && !input.ledgerId) {
  //     throw new ErrorHandler(
  //       400,
  //       generateErrorMessage("REQUIRED_FIELD", "Ledger ID")
  //     );
  //   }
  // } else {
  //   input.isLedgerMappingExists = false;

  //   if (input.ledgerId) {
  //     throw new ErrorHandler(
  //       400,
  //       generateErrorMessage("INVALID_FIELD", "Ledger ID")
  //     );
  //   }
  // }

  if (input.supplierCode) {
    const code = await getItemSupplierBySupplierCodeFromDb(input.supplierCode);

    if (code && code.id !== input.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Code")
      );
    }
  }

  const name = await getItemSupplierByNameFromDb(input.vendorCompanyName);

  if (name && name.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Name")
    );
  }

  if (input.phone) {
    const phone = await getPhoneNumberFromDb(input.phone);

    if (phone && phone.id !== input.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Phone Number")
      );
    }
  }

  if (input.email) {
    const email = await getEmailFromDb(input.email);

    if (email && email.id !== input.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Email")
      );
    }
  }

  logger.info("exiting::updateItemSupplier::service::validation");
};

export const deleteItemSupplierServiceValidation = async (
  id: number
): Promise<void> => {
  logger.info("entering::deleteItemSupplier::service::validation");
  await validateIdItemSupplier(id);
  logger.info("exiting::deleteItemSupplier::service::validation");
};
