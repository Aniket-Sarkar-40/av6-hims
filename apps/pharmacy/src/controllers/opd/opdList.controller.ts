import { TryCatch } from "@repo/platform";
import { opdListService } from "@/services/opd/opdList.service.js";
import { printService } from "@/services/print/print.service.js";
import {
  OpdBillReq,
  SearchRequestOpd,
  SearchWithDate,
} from "@/types/opd/opdList.js";
import { PrinterResponse } from "@/types/sell/sell.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const getPendingMedicineAppointments = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPendingMedicineAppointments::controller");

    const input = req.body as SearchRequestOpd;

    const result = await opdListService.opdList(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage(
          "FETCHED",
          "pending medicine appointments",
        ),
      },
      result,
    );

    logger.info("exiting::getPendingMedicineAppointments::controller");
    return res.status(200).json(response);
  },
);

export const getOpdByAppointment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getOpdByAppointment::controller");

    const input = req.body as OpdBillReq;

    const result = await opdListService.getOpdByAppointment(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage(
          "FETCHED",
          "pending medicine appointments",
        ),
      },
      result,
    );

    logger.info("exiting::getOpdByAppointment::controller");
    return res.status(200).json(response);
  },
);

export const getMedicineInstByAppointment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMedicineInstByAppointment::controller");

    const aptId = req.query.aptId as string;

    validIdCheck(Number(aptId));

    const result = await opdListService.getMedicineInstruction(Number(aptId));

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine instruction"),
      },
      result,
    );

    logger.info("exiting::getMedicineInstByAppointment::controller");
    return res.status(200).json(response);
  },
);

export const printInstructionByAppointmentId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::printInstructionByAppointmentId::controller");

    const input = req.query.id as string;

    const result = await opdListService.getOpdByAppointmentWithoutDto(
      Number(input),
    );

    if (!result) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Opd Instruction"),
      );
    }

    const instructions: PrinterResponse[] = [];

    for (let i = 0; i < result.medicine.length; i++) {
      // await printService.printInstructionZpl(result, i);
      const instruction = await printService.printInstructionZplOrTSPL(
        result,
        i,
        "XPML",
      );
      instructions.push(instruction);
    }
    logger.info("exiting::printInstructionByAppointmentId::controller");
    const response = BaseResponse.success(
      { type: "PRINTED", data: instructions },
      "Opd Instruction",
    );
    return res.status(200).json(response);
  },
);

export const getPendingMedicineAppointmentsExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getHighestSellingDrugByBranchExcel::controller");

    const input = req.body as SearchWithDate;

    const wb: Workbook = await opdListService.buildAppointmentsWorkbook(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="opd_pending_appointment.xlsx"',
    );

    logger.info("exiting::getHighestSellingDrugByBranchExcel::controller");
    await wb.xlsx.write(res);
    res.end();
  },
);

export const getCorporateClientByCcId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCorporateClientByCcId::controller");

    const ccId = req.query.ccId as string;

    validIdCheck(Number(ccId));

    const result = await opdListService.getCorporateClientByCcId(Number(ccId));

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Corporate Client"),
      },
      result,
    );

    logger.info("exiting::getCorporateClientByCcId::controller");
    return res.status(200).json(response);
  },
);

export const getLastAppointments = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCorporateClientByCcId::controller");

    const patientId = req.query.patientId as string;

    validIdCheck(Number(patientId));

    const result = await opdListService.getLastAppointments(Number(patientId));

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Appointments"),
      },
      result,
    );

    logger.info("exiting::getCorporateClientByCcId::controller");
    return res.status(200).json(response);
  },
);
