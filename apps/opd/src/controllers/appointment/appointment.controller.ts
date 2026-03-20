import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { appointmentService } from "@/services/appointment/appointment.service.js";
import {
  CreateAppointmentsTableInput,
  GetAppointmentFeesInput,
  RescheduleAppointmentInput,
  UpgradeAppointmentReq,
} from "@/types/appointment/appointment.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { Request, Response } from "express";

export const createAppointment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createAppointment::controller");
    const input = req.body as CreateAppointmentsTableInput;
    const appointment = await appointmentService.createAppointment(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Appointment"),
      },
      appointment,
    );
    logger.info("exiting::createAppointment::controller");
    return res.status(201).json(response);
  },
);

export const updateAppointment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateAppointment::controller");

    const input = req.body as CreateAppointmentsTableInput;

    const updated = await appointmentService.updateAppointment(input);

    logger.info("exiting::updateAppointment::controller");

    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Appointment"),
        },
        updated,
      ),
    );
  },
);

export const getAllAppointment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllAppointment::controller");
    const appointment = await appointmentService.getAllAppointments();
    logger.info("exiting::getAllAppointment::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Appointment"),
        },
        appointment,
      ),
    );
  },
);

export const getAppointmentById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAppointmentById::controller");
    const { appointmentId } = req.query as { appointmentId: string };

    const appointment = await appointmentService.getAppointmentById(
      Number(appointmentId),
    );

    if (!appointment) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "Appointment not found",
        }),
      );
    }

    logger.info("exiting::getAppointmentById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Appointment"),
        },
        appointment,
      ),
    );
  },
);

export const cancelAppointment = TryCatch(async (req, res) => {
  logger.info("entering::cancelAppointment::controller");
  const { id } = req.query as { id: string };
  validIdCheck(Number(id));

  await appointmentService.cancelAppointment(Number(id));

  logger.info("exiting::cancelAppointment::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("CANCELLED", "Appointment"),
  });
});

export const rescheduleAppointment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::rescheduleAppointment::controller");

    const input = req.body as RescheduleAppointmentInput;

    await appointmentService.rescheduleAppointment(input);

    logger.info("exiting::rescheduleAppointment::controller");

    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("RESCHEDULED", "Appointment"),
      }),
    );
  },
);

export const upgradeAppointment = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::upgradeAppointment::controller");

    const input = req.body as UpgradeAppointmentReq;
    await appointmentService.upgradeAppointment(input);

    const response = new BaseResponse({
      success: true,
      message: generateSuccessMessage("UPGRADED", "Appointment"),
    });

    logger.info("exiting::upgradeAppointment::controller");
    return res.status(200).json(response);
  },
);
export const getAppointmentFees = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAppointmentFees::controller");

    const input = req.body as GetAppointmentFeesInput;
    const fees = await appointmentService.getAppointmentFees(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Appointment Fees"),
      },
      fees,
    );

    logger.info("exiting::getAppointmentFees::controller");
    return res.status(200).json(response);
  },
);
