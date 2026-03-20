import { toAppointmentDto } from "@/mapper/appointment/appointment.mapper.js";
import {
  cancelAppointmentFromDb,
  createAppointmentInDb,
  getAllAppointmentsFromDb,
  getAppointmentFees,
  getAppointmentsByIdFromDb,
  rescheduleAppointmentInDb,
  updateAppointmentInDb,
  upgradeAppointmentInDb,
} from "@/repository/appointment/appointment.repository.js";
import {
  AppointmentDto,
  AppointmentResponse,
  CreateAppointmentsTableInput,
  GetAppointmentFeesInput,
  RescheduleAppointmentInput,
  UpgradeAppointmentReq,
} from "@/types/appointment/appointment.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  cancelAppointmentServiceValidation,
  createAppointmentServiceValidation,
  getAppointmentFeesServiceValidation,
  rescheduleServiceValidation,
  updateAppointmentServiceValidation,
  upgradeAppointmentServiceValidation,
} from "@/validations/service/appointment/appointment.service.validation.js";

export const appointmentService = {
  async createAppointment(input: CreateAppointmentsTableInput) {
    logger.info("entering::createAppointment::service");
    await createAppointmentServiceValidation(input);
    const createAppointments = await createAppointmentInDb(input);
    const appointmentRes = await toAppointmentDto(createAppointments);
    logger.info("exiting::createAppointment::service");
    return appointmentRes;
  },

  async updateAppointment(input: CreateAppointmentsTableInput) {
    logger.info("entering::updateAppointments::service");

    await updateAppointmentServiceValidation(input);

    const updatedPO = await updateAppointmentInDb(input);
    const appointmentRes = await toAppointmentDto(updatedPO);

    logger.info("exiting::updateAppointments::service");
    return appointmentRes;
  },

  async getAllAppointments(): Promise<AppointmentDto[]> {
    logger.info("entering::getAllAppointments::service");

    const records = await getAllAppointmentsFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Appointment"),
      );
    }

    const appointmentRes = await Promise.all(
      records.map((r) => toAppointmentDto(r)),
    );
    logger.info("exiting::getAllAppointments::service");
    return appointmentRes;
  },

  async getAppointmentById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<AppointmentDto | null> {
    logger.info("entering::getAppointmentsById::service id=" + id);

    validIdCheck(id);

    const appointments = await getAppointmentsByIdFromDb(id);

    if (!appointments) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "appointments"),
        );
      } else {
        logger.warn(
          `appointments with id=${id} not found, returning null as requested.`,
        );
        return null;
      }
    }

    const dto = await toAppointmentDto(appointments, true);

    logger.info("exiting::getAppointmentsById::service id=" + id);
    return dto;
  },

  async getAppointmentByIdWoDto(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<AppointmentResponse | null> {
    logger.info("entering::getAppointmentByIdWoDto::service id=" + id);

    validIdCheck(id);

    const appointment = await getAppointmentsByIdFromDb(id);

    if (!appointment) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Appointments"),
        );
      } else {
        return null;
      }
    }

    logger.info("exiting::getAppointmentByIdWoDto::service id=" + id);
    return appointment;
  },

  async cancelAppointment(id: number): Promise<void> {
    logger.info("entering::cancelAppointment::service id=" + id);
    const input = { id };
    await cancelAppointmentServiceValidation(input);

    await cancelAppointmentFromDb(input);
    logger.info("exiting::cancelAppointment::service id=" + id);
  },

  async rescheduleAppointment(input: RescheduleAppointmentInput) {
    logger.info("entering::rescheduleAppointment::service");

    await rescheduleServiceValidation(input);

    await rescheduleAppointmentInDb(input);

    logger.info("exiting::rescheduleAppointment::service");
  },
  async upgradeAppointment(input: UpgradeAppointmentReq) {
    logger.info("entering::getLastAppointments::service");
    const charges = await upgradeAppointmentServiceValidation(input);
    await upgradeAppointmentInDb(input, charges);
    logger.info("exiting::getLastAppointments::service");
  },

  async getAppointmentFees(input: GetAppointmentFeesInput) {
    logger.info("entering::getAppointmentFees::service");
    await getAppointmentFeesServiceValidation(input);
    const fees = await getAppointmentFees(input);
    logger.info("exiting::getAppointmentFees::service");
    return fees;
  },
};
