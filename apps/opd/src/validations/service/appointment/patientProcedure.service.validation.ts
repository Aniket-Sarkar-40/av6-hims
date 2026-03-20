import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  getPatientProcedureByIdFromDb,
  getPatientProcedureDetailsByIdFromDb,
} from "@/repository/appointment/patientProcedure.repository.js";
import { procedureService } from "@/services/master/procedure.service.js";
import {
  PatientProcedureCreateInput,
  PatientProcedureReturnInput,
  PatientProcedureUpdateInput,
} from "@/types/appointment/patientProcedure.js";
import { FetchProcedureResponse } from "@/types/master/procedure.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  Appointment,
  PatientProcedureDetails,
  PatientProcedureStatus,
  PercentageOrAmount,
  ProcedurePaymentStatus,
} from "@repo/db/generated/prisma/client";
import {
  calculateBillingFromChildren,
  ChildCalcInput,
  MasterAdditionalDiscount,
} from "av6-utils";
import { validateIdProcedure } from "../master/procedure.service.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const validateIdPatientProcedure = async (id: number) => {
  logger.info("entering::validateIdPatientProcedure::service::validation");
  validIdCheck(id);
  const response = await getPatientProcedureByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Procedure"),
    );
  }
  logger.info("exiting::validateIdPatientProcedure::service::validation");
  return response;
};

export const validateIdPatientProcedureDetails = async (id: number) => {
  logger.info(
    "entering::validateIdPatientProcedureDetails::service::validation",
  );
  validIdCheck(id);
  const response = await getPatientProcedureDetailsByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Procedure Details"),
    );
  }
  logger.info(
    "exiting::validateIdPatientProcedureDetails::service::validation",
  );
  return response;
};

export const commonPatientProcedureServiceValidation = async (
  input: PatientProcedureCreateInput,
  appointment: Appointment,
) => {
  const settings = requestStorage.getStore()?.settings;
  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.defaultPrecision || 2;
  const calculationMethod = settings?.grnCalculationMethod || "STEP_WISE";

  const { patientProcedureDetails } = input;

  const childCalcInputArray: ChildCalcInput[] = [];

  //Validating patient procedure details
  for (const detail of patientProcedureDetails) {
    const { procedureId } = detail;

    //For update (validating procedure details)
    if (detail.id) {
      const procedure = await validateIdPatientProcedureDetails(detail.id);
      if (procedure.patientProcedureId !== input.id) {
        throw new ErrorHandler(
          400,
          `Patient Procedure Details with id ${detail.id} not exist for Patient Procedure with id ${input.id}`,
        );
      }
    }

    //Validating procedure
    const procedure = await validateIdProcedure(procedureId);
    detail.procedureName = procedure.procedureName;

    //Fetching co pay details
    let copayDetails: FetchProcedureResponse;

    if (
      appointment.appointmentType === "INSURANCE" &&
      appointment.insuranceId
    ) {
      input.insuranceId = appointment.insuranceId;
      copayDetails = await procedureService.fetchProcedure({
        procedureId: detail.procedureId,
        type: "INSURANCE",
        typeId: appointment.insuranceId,
      });
    } else if (
      appointment.appointmentType === "CORPORATE" &&
      appointment.clientId
    ) {
      input.clientId = appointment.clientId;
      copayDetails = await procedureService.fetchProcedure({
        procedureId: detail.procedureId,
        type: "CORPORATE",
        typeId: appointment.clientId,
      });
    } else {
      copayDetails = await procedureService.fetchProcedure({
        procedureId: detail.procedureId,
      });
    }
    const { coPaymentType, coPaymentValue } = copayDetails;
    if (coPaymentType && coPaymentValue) {
      //adding co pay details in input
      detail.coPaymentMode = coPaymentType;
      detail.coPaymentValue = coPaymentValue;
    }

    // preparing child calculation Input
    const clildCalcInput: ChildCalcInput = {
      qty: 1,
      rate: detail.subtotalAmount ?? 0,
      discountMode: detail.discountMode ?? undefined,
      discountValue: detail.discountValue,
      taxMethod: detail.taxMethod ?? undefined,
      taxValue: detail.taxValue,
      coPaymentType: coPaymentType ?? undefined,
      coPayValue: coPaymentValue ?? undefined,
    };

    childCalcInputArray.push(clildCalcInput);
  }

  //preparing master data for calculation

  const masterAdditionalCalcInput: MasterAdditionalDiscount = {
    mode: input.additionalDiscountMode ?? PercentageOrAmount.PERCENTAGE,
    value: input.additionalDiscountValue ?? 0,
    coPayMode: "PERCENTAGE-AMOUNT",
  };

  //Caluculation function
  const calcOutput = calculateBillingFromChildren(
    childCalcInputArray,
    masterAdditionalCalcInput,
    {
      calculationMethod:
        calculationMethod === "STEP_WISE" ? "STEP_WISE" : "FINAL_ONLY",
      lineRound: roundFormat,
      headerRound: roundFormat,
      precision: precision,
    },
  );

  const { master, children } = calcOutput;

  // Validating child data

  for (let i = 0; i < children.length; i++) {
    const calData = children[i];
    const inputData = patientProcedureDetails[i];

    if (inputData.subtotalAmount !== calData.subtotalAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Subtotal Amount (${inputData.subtotalAmount}) and calculated Subtotal Amount (${calData.subtotalAmount}) for Procedure ${inputData.procedureName}`,
        ),
      );
    }

    if (inputData.discountAmount !== calData.discountAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Discount Amount (${inputData.discountAmount}) and calculated Discount Amount (${calData.discountAmount}) for Procedure ${inputData.procedureName}`,
        ),
      );
    }

    if (inputData.taxAmount !== calData.taxAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Tax Amount (${inputData.taxAmount}) and calculated Tax Amount (${calData.taxAmount}) for Procedure ${inputData.procedureName}`,
        ),
      );
    }
    if (inputData.grossAmount !== calData.grossAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Gross Amount (${inputData.grossAmount}) and calculated Gross Amount (${calData.grossAmount}) for Procedure ${inputData.procedureName}`,
        ),
      );
    }

    if (inputData.netAmount !== calData.netAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Net Amount (${inputData.netAmount}) and calculated Net Amount (${calData.netAmount}) for Procedure ${inputData.procedureName}`,
        ),
      );
    }
    if (inputData.coPaymentAmount !== calData.copayAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Co-Pay Amount (${inputData.coPaymentAmount}) and calculated Co-Pay Amount (${calData.copayAmount}) for Procedure ${inputData.procedureName}`,
        ),
      );
    }
  }
  // Validating master data

  if (input.subtotalAmount !== master.subtotalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Subtotal Amount (${input.subtotalAmount}) and calculated Subtotal Amount (${master.subtotalAmount})`,
      ),
    );
  }

  if (input.discountTotalAmount !== master.discountTotalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Discount Total Amount (${input.discountTotalAmount}) and calculated Discount Total Amount (${master.discountTotalAmount})`,
      ),
    );
  }

  if (input.taxAmount !== master.taxAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Tax Amount (${input.taxAmount}) and calculated Tax Amount (${master.taxAmount})`,
      ),
    );
  }

  if (input.grossAmount !== master.grossAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Gross Amount (${input.grossAmount}) and calculated Gross Amount (${master.grossAmount})`,
      ),
    );
  }

  if (input.netAmount !== master.netAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Amount (${input.netAmount}) and calculated Net Amount (${master.netAmount})`,
      ),
    );
  }

  if (input.coPaymentAmount !== master.copayAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Co-Pay Amount (${input.coPaymentAmount}) and calculated Co-Pay Amount (${master.copayAmount})`,
      ),
    );
  }
  if (input.netAmount === 0) {
    input.paymentStatus = "SETTELED";
  }
};
export const createPatientProcedureServiceValidation = async (
  input: PatientProcedureCreateInput,
) => {
  logger.info("entering::createPatientProcedure::service::validation");

  const { ccId, appointmentId } = input;

  const appointment = await validateIdAppointment(appointmentId);
  if (ccId !== appointment.ccId) {
    throw new ErrorHandler(400, generateErrorMessage("ACCESS_FAIL"));
  }

  input.patientId = appointment.patientId;

  if (appointment.patientInsuranceId) {
    input.patientInsuranceId = appointment.patientInsuranceId;
  }

  await commonPatientProcedureServiceValidation(input, appointment);

  logger.info("exiting::createPatientProcedure::service::validation");
};

export const updatePatientProcedureServiceValidation = async (
  input: PatientProcedureUpdateInput,
) => {
  logger.info("entering::updatePatientProcedure::service::validation");
  const existing = await validateIdPatientProcedure(input.id);
  if (existing.paymentStatus !== ProcedurePaymentStatus.PENDING) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Patient Procedure"),
    );
  }
  input.existing = existing;
  if (input.ccId !== existing.ccId) {
    throw new ErrorHandler(400, generateErrorMessage("ACCESS_FAIL"));
  }
  if (existing.appointmentId !== input.appointmentId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Appointment Id"),
    );
  }
  const appointment = await validateIdAppointment(input.appointmentId);
  await commonPatientProcedureServiceValidation(input, appointment);

  logger.info("exiting::updatePatientProcedure::service::validation");
};

export const returnPatientProcedureServiceValidation = async (
  input: PatientProcedureReturnInput,
) => {
  logger.info("entering::returnPatientProcedure::service::validation");

  const settings = requestStorage.getStore()?.settings;
  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.defaultPrecision || 2;
  const calculationMethod = settings?.grnCalculationMethod || "STEP_WISE";

  const childCalcInputArray: ChildCalcInput[] = [];
  const existing = await validateIdPatientProcedure(input.id);
  input.existing = existing;
  if (input.ccId !== existing.ccId) {
    throw new ErrorHandler(400, generateErrorMessage("ACCESS_FAIL"));
  }

  const ppDetailsNotReturned: PatientProcedureDetails[] =
    existing.patientProcedureDetails.filter(
      (detail) => detail.isReturned === false,
    );
  if (input.detailId.length < ppDetailsNotReturned.length) {
    existing.status = PatientProcedureStatus.PARTIAL;
  }
  if (input.detailId.length === ppDetailsNotReturned.length) {
    existing.status = PatientProcedureStatus.CANCELLED;
  }
  for (const detail of input.detailId) {
    const procedure = await validateIdPatientProcedureDetails(detail);
    if (procedure.patientProcedureId !== input.id) {
      throw new ErrorHandler(
        400,
        `Patient Procedure Details with id ${detail} not exist for Patient Procedure with id ${input.id}`,
      );
    }

    // preparing child calculation Input
    const clildCalcInput: ChildCalcInput = {
      qty: 1,
      rate: procedure.subtotalAmount ?? 0,
      discountMode: procedure.discountMode ?? undefined,
      discountValue: procedure.discountValue,
      taxMethod: procedure.taxMethod ?? undefined,
      taxValue: procedure.taxValue,
      coPaymentType: procedure.coPaymentMode ?? undefined,
      coPayValue: procedure.coPaymentValue ?? undefined,
    };

    childCalcInputArray.push(clildCalcInput);
  }

  //preparing master data for calculation

  const masterAdditionalCalcInput: MasterAdditionalDiscount = {
    mode: existing.additionalDiscountMode ?? PercentageOrAmount.PERCENTAGE,
    value: existing.additionalDiscountValue ?? 0,
    coPayMode: "PERCENTAGE-AMOUNT",
  };

  //Caluculation function
  const calcOutput = calculateBillingFromChildren(
    childCalcInputArray,
    masterAdditionalCalcInput,
    {
      calculationMethod:
        calculationMethod === "STEP_WISE" ? "STEP_WISE" : "FINAL_ONLY",
      lineRound: roundFormat,
      headerRound: roundFormat,
      precision: precision,
    },
  );

  const { master } = calcOutput;
  existing.subtotalAmount -= master.subtotalAmount;
  existing.otherChargeAmount -= master.otherChargeAmount;
  existing.discountTotalAmount -= master.discountTotalAmount;
  existing.taxAmount -= master.taxAmount;
  existing.grossAmount -= master.grossAmount;
  existing.netAmount -= master.netAmount;
  existing.coPaymentAmount -= master.copayAmount;

  const actlCustomerPayAmt = existing.paidAmount - existing.refundedAmount;
  const diff = existing.netAmount - actlCustomerPayAmt;

  if (diff > 0) {
    if (actlCustomerPayAmt > 0) {
      existing.paymentStatus = ProcedurePaymentStatus.PARTIAL;
    } else {
      existing.paymentStatus = ProcedurePaymentStatus.PENDING;
    }
  } else if (diff < 0) {
    existing.refundAmount = Math.abs(diff);
    existing.paymentStatus = ProcedurePaymentStatus.REFUND;
  } else {
    existing.paymentStatus = ProcedurePaymentStatus.SETTELED;
  }
  logger.info("exiting::returnPatientProcedure::service::validation");
};
