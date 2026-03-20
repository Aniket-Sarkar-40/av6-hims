import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  PatientProcedureCreateInput,
  PatientProcedureDetailsInput,
  PatientProcedureResponse,
  PatientProcedureResponseWithDetails,
  PatientProcedureReturnInput,
  PatientProcedureUpdateInput,
} from "@/types/appointment/patientProcedure.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  CoPaymentSource,
  PatientProcedureDetails,
  PatientProcedureStatus,
  OpdUinShortCode,
} from "@repo/db/generated/prisma/client";

export const createPatientProcedureInDb = async (
  input: PatientProcedureCreateInput,
): Promise<PatientProcedureResponse> => {
  logger.info("entering::createPatientProcedureInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const refNo = await uinServiceFactory.generateUIN(OpdUinShortCode.PROID);
  const billNo = await uinServiceFactory.generateUIN(OpdUinShortCode.INV);

  const omittedInput = customOmit<
    PatientProcedureCreateInput,
    "patientProcedureDetails"
  >(input, ["patientProcedureDetails"]);

  return await db.$transaction(async (tx) => {
    const createdResponse = await tx.patientProcedure.create({
      data: {
        ...omittedInput.rest,
        patientProcedureRefNo: refNo,
        billNumber: billNo,
        createdBy: currentUser,
        patientProcedureDetails: {
          create: omittedInput.omitted.patientProcedureDetails.map((d) => {
            return {
              ...d,
              coPaymentSource: d.coPaymentMode
                ? CoPaymentSource.SETTINGS
                : CoPaymentSource.MANUAL,
              createdBy: currentUser,
            };
          }),
        },
      },
      include: {
        patientProcedureDetails: {
          where: {
            isActive: true,
            isReturned: false,
          },
        },
      },
    });

    await tx.appointment.update({
      where: {
        id: input.appointmentId,
      },
      data: {
        procedureStatus: "BOOKED",
      },
    });

    return createdResponse;
  });
};

export const updatePatientProcedureInDb = async (
  input: PatientProcedureUpdateInput,
): Promise<PatientProcedureResponse> => {
  logger.info("entering::updatePatientProcedureInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedInput = customOmit<
    PatientProcedureUpdateInput,
    "id" | "patientProcedureDetails" | "existing"
  >(input, ["id", "patientProcedureDetails", "existing"]);
  const { id, patientProcedureDetails, existing } = omittedInput.omitted;

  const toUpdate = patientProcedureDetails.filter(
    (d) => typeof d.id === "number",
  );
  const toCreate = patientProcedureDetails.filter(
    (d) => typeof d.id !== "number",
  );
  const toDelete = existing.patientProcedureDetails.filter(
    (d) => !patientProcedureDetails.some((item) => item.id === d.id),
  );

  return await db.$transaction(async (tx) => {
    const updatedResponse = await tx.patientProcedure.update({
      where: {
        id,
      },
      data: {
        ...omittedInput.rest,
        updatedBy: currentUser,
        patientProcedureDetails: {
          create: toCreate.map((d) => {
            return {
              ...d,
              coPaymentSource: d.coPaymentMode
                ? CoPaymentSource.SETTINGS
                : CoPaymentSource.MANUAL,
              createdBy: currentUser,
            };
          }),
          update: toUpdate.map((d) => {
            const omittedInput = customOmit<PatientProcedureDetailsInput, "id">(
              d,
              ["id"],
            );
            return {
              where: {
                id: d.id,
              },
              data: {
                ...omittedInput.rest,
                updatedBy: currentUser,
              },
            };
          }),
          updateMany: {
            where: {
              id: {
                in: toDelete.map((d) => d.id),
              },
            },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
        },
      },
      include: {
        patientProcedureDetails: {
          where: {
            isActive: true,
            isReturned: false,
          },
        },
      },
    });

    await tx.appointment.update({
      where: {
        id: input.appointmentId,
      },
      data: {
        procedureStatus: "BOOKED",
      },
    });
    return updatedResponse;
  });
};

export const getPatientProcedureByIdFromDb = async (
  id: number,
): Promise<PatientProcedureResponse | null> => {
  logger.info("entering::getPatientProcedureByIdFromDb::repository");
  return await db.patientProcedure.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      patientProcedureDetails: {
        where: {
          isActive: true,
          isReturned: false,
        },
      },
    },
  });
};
export const getPatientProcedureByIdFromDbWithDetails = async (
  id: number,
): Promise<PatientProcedureResponseWithDetails | null> => {
  logger.info("entering::getPatientProcedureByIdFromDb::repository");
  return await db.patientProcedure.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      patientProcedureDetails: {
        where: {
          isActive: true,
          isReturned: false,
        },
      },
      appointment: {
        include: {
          doctor: true,
        },
      },
      patient: true,
      patientInsurance: {
        include: {
          insurance: true,
        },
      },
      collectionCenter: true,
      client: true,
    },
  });
};
export const getPatientProcedureDetailsByIdFromDb = async (
  id: number,
): Promise<PatientProcedureDetails | null> => {
  logger.info("entering::getPatientProcedureDetailsByIdFromDb::repository");
  return await db.patientProcedureDetails.findFirst({
    where: {
      id,
      isActive: true,
      isReturned: false,
    },
  });
};

export const returnPatientProcedureInDb = async (
  input: PatientProcedureReturnInput,
): Promise<PatientProcedureResponse> => {
  logger.info("entering::returnPatientProcedureInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, detailId, existing } = input;

  const omittedExisting = customOmit(existing, ["patientProcedureDetails"]);

  return await db.$transaction(async (tx) => {
    const updatedResponse = await tx.patientProcedure.update({
      where: {
        id,
      },
      data: {
        ...omittedExisting.rest,
        updatedBy: currentUser,
        patientProcedureDetails: {
          update: detailId.map((id) => {
            return {
              where: {
                id,
              },
              data: {
                isReturned: true,
                updatedBy: currentUser,
              },
            };
          }),
        },
      },
      include: {
        patientProcedureDetails: {
          where: {
            isActive: true,
            isReturned: false,
          },
        },
      },
    });

    await tx.appointment.update({
      where: {
        id: updatedResponse.appointmentId,
      },
      data: {
        procedureStatus:
          updatedResponse.status === PatientProcedureStatus.CANCELLED
            ? "CANCELLED"
            : updatedResponse.status === PatientProcedureStatus.PARTIAL
              ? "PARTIALLY_CANCELLED"
              : "BOOKED",
      },
    });
    return updatedResponse;
  });
};
