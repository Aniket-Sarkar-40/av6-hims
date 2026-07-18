import { getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateVoucherUINConfigRequest } from "@/types/master/voucherUinConfig.js";
import { validIdCheck } from "@/validations/global.validation.js";
import dayjs from "dayjs";
import { validateIdVoucherType } from "./voucherType.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { VoucherUINConfig } from "@repo/db/generated/prisma/client";

export const validateIdVoucherUINConfig = async (
  voucherUINConfigId: number,
) => {
  logger.info("entering::validateIdUinConfig::service::validation");

  validIdCheck(voucherUINConfigId);

  const voucherUINConfig = await await getByUnique({
    model: "VoucherUINConfig",
    where: {
      id: voucherUINConfigId,
      isActive: true,
    },
  });

  if (!voucherUINConfig) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Voucher UIN Config"),
    );
  }
  logger.info("exiting::validateIdUinConfig::service::validation");

  return voucherUINConfig;
};

export const createOrUpdateVoucherUINConfigServiceValidation = async (
  body: CreateOrUpdateVoucherUINConfigRequest,
) => {
  logger.info(
    "entering::createOrUpdateVoucherUINConfigServiceValidation::service::validation",
  );
  let existingVoucherUINConfig: VoucherUINConfig | null = null;
  if (body.id) {
    existingVoucherUINConfig = await validateIdVoucherUINConfig(body.id);
  }

  const voucherType = await validateIdVoucherType(body.voucherTypeId);
  if (voucherType.numberingMode !== "CUSTOM_AUTO") {
    throw new ErrorHandler(
      400,
      "You can only create voucher UIN Config for CUSTOM_AUTO numbering mode",
    );
  }

  // Set seqResetDate (end date) based on seqResetPolicy
  // type UIN_RESET_POLICY = "daily" | "weekly" | "monthly" | "yearly" | "no";
  if (body.seqStartDate && body.seqResetPolicy) {
    const startDate = dayjs(body.seqStartDate);

    let calculatedSeqResetDate: Date = dayjs(body.seqStartDate).toDate();

    switch (body.seqResetPolicy) {
      case "daily":
        calculatedSeqResetDate = startDate.add(1, "day").toDate();
        break;
      case "weekly":
        calculatedSeqResetDate = startDate.add(1, "week").toDate();
        break;
      case "monthly":
        calculatedSeqResetDate = startDate.add(1, "month").toDate();
        break;
      case "yearly":
        calculatedSeqResetDate = startDate.add(1, "year").toDate();
        break;
      case "no":
      default:
        break;
    }

    body.seqResetDate = calculatedSeqResetDate;

    // Check for date range overlap with existing VoucherUINConfig for the same voucherTypeId
    const overlapConfig = await getByUnique({
      model: "VoucherUINConfig",
      useActiveFlag: true,
      where: {
        voucherTypeId: body.voucherTypeId,
        NOT: body.id ? { id: body.id } : undefined,
        seqStartDate: { lt: body.seqResetDate },
        seqResetDate: { gt: body.seqStartDate },
      },
    });

    if (overlapConfig) {
      throw new ErrorHandler(
        400,
        "Date range overlaps with an existing Voucher UIN Config for the same voucher type",
      );
    }
  }
  logger.info(
    "exiting::createOrUpdateVoucherUINConfigServiceValidation::service::validation",
  );
  return existingVoucherUINConfig;
};
