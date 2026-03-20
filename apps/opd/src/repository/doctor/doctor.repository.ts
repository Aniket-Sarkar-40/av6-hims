import { DOC_DESG_ID, DOC_ROLE_ID } from "@repo/shared/config/index.js";
import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateDoctorInput,
  DoctorResponse,
  UpdateDoctorInput,
} from "@/types/doctor/doctor.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  BinaryFlag,
  DoctorSchedule,
  StaffDesignation,
  OpdUinShortCode,
} from "@repo/db/generated/prisma/client";
import dayjs from "dayjs";
import { encryptPassword } from "@repo/shared/utils/passwordHash.utils.js";

export const createDoctorInDb = async (
  input: CreateDoctorInput,
): Promise<DoctorResponse> => {
  logger.info("entering::createDoctorInDb::repository");
  const omittedDoctorInput = customOmit<
    CreateDoctorInput,
    "doctorScheduleDetails"
  >(input, ["doctorScheduleDetails"]);
  const {
    name,
    gender,
    contactNo,
    email,
    doctorRegistrationNo,
    address,
    collectionCenterIds,
    checkUpTime,
    opdPrimaryDepartmentId,
    opdDepartmentPrefixId,
    licenseType,
  } = omittedDoctorInput.rest;

  const { doctorScheduleDetails } = omittedDoctorInput.omitted;

  const empNo = await uinServiceFactory.generateUIN(OpdUinShortCode.HRMS);
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(async (tx) => {
    // Create Doctor
    const createdDoctor = await tx.staff.create({
      data: {
        employeeId: empNo,
        name: "Dr. " + name, // for Dr. prefix need clearification
        designation: DOC_DESG_ID,
        gender: gender,
        contactNo: contactNo,
        email: email,
        dob: new Date(),
        dateOfJoining: new Date(),
        doctorRegistrationNo: doctorRegistrationNo,
        localAddress: address,
        opdDepartmentId: opdPrimaryDepartmentId,
        prefixId: opdDepartmentPrefixId,
        licenseName: licenseType,
        isActive: 1,
        password: await encryptPassword("abc@123"),
        isOpdConsultant: true,

        doctorSchedule: {
          create: doctorScheduleDetails.map((schedule) => {
            const start = dayjs(schedule.startTime, "HH:mm");
            const end = dayjs(schedule.endTime, "HH:mm");
            const minutes = end.diff(start, "minute");
            return {
              ...schedule,
              maxPatient: Math.floor(minutes / checkUpTime),
              timeTaken: checkUpTime,
              createdBy: currentUser,
            };
          }),
        },

        staffCollectionCenter: {
          create: collectionCenterIds.map((ccId) => {
            return {
              isMainLab: ccId === 1 ? "Y" : "N",
              isActive: BinaryFlag.true,
              collectionCenterId: ccId,
            };
          }),
        },
      },

      include: {
        doctorSchedule: {
          where: {
            isActive: true,
          },
        },
        staffCollectionCenter: {
          where: {
            isActive: BinaryFlag.true,
          },
        },
      },
    });
    //add role to doctor
    await db.$executeRaw`
    INSERT INTO staff_roles(role_id, staff_id, is_active)
    VALUES (${DOC_ROLE_ID}, ${createdDoctor.id}, 1); `;

    return createdDoctor;
  });
};

export const updateDoctorInDb = async (
  input: UpdateDoctorInput,
): Promise<DoctorResponse> => {
  logger.info("entering::updateDoctorInDb::repository");
  const omittedDoctorInput = customOmit<
    UpdateDoctorInput,
    "doctorScheduleDetails" | "existingDoctor"
  >(input, ["doctorScheduleDetails", "existingDoctor"]);
  const {
    id,
    name,
    gender,
    contactNo,
    email,
    doctorRegistrationNo,
    address,
    collectionCenterIds,
    checkUpTime,
    opdPrimaryDepartmentId,
    opdDepartmentPrefixId,
    licenseType,
  } = omittedDoctorInput.rest;

  const { doctorScheduleDetails, existingDoctor } = omittedDoctorInput.omitted;

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  // Schedules to create, update, delete
  const toUpdateSchedule = doctorScheduleDetails.filter(
    (d) => typeof d.id === "number",
  );
  const toCreateSchedule = doctorScheduleDetails.filter(
    (d) => typeof d.id !== "number",
  );
  const toDeleteSchedule = existingDoctor.doctorSchedule.filter(
    (d) => !doctorScheduleDetails.some((item) => item.id === d.id),
  );

  // Staff Collection Center Mapping to create, keep, delete
  const toCreateStaffCcMapping = collectionCenterIds.filter(
    (ccId) =>
      !existingDoctor.staffCollectionCenter.some(
        (d) => d.collectionCenterId === ccId,
      ),
  );
  const toDeleteStaffCcMapping = existingDoctor.staffCollectionCenter.filter(
    (d) => !collectionCenterIds.includes(d.collectionCenterId),
  );

  return await db.$transaction(async (tx) => {
    // Create Doctor
    const createdDoctor = await tx.staff.update({
      where: { id },
      data: {
        name: name.startsWith("Dr.") ? name : "Dr. " + name, // for Dr. prefix need clearification
        gender: gender,
        contactNo: contactNo,
        email: email,
        doctorRegistrationNo: doctorRegistrationNo,
        localAddress: address,
        opdDepartmentId: opdPrimaryDepartmentId,
        prefixId: opdDepartmentPrefixId,
        licenseName: licenseType,

        // Doctor Schedule Management
        doctorSchedule: {
          create: toCreateSchedule.map((schedule) => {
            const start = dayjs(schedule.startTime, "HH:mm");
            const end = dayjs(schedule.endTime, "HH:mm");
            const minutes = end.diff(start, "minute");
            return {
              ...schedule,
              maxPatient: Math.floor(minutes / checkUpTime),
              timeTaken: checkUpTime,
              createdBy: currentUser,
            };
          }),
          update: toUpdateSchedule.map((schedule) => {
            const start = dayjs(schedule.startTime, "HH:mm");
            const end = dayjs(schedule.endTime, "HH:mm");
            const minutes = end.diff(start, "minute");
            return {
              where: {
                id: schedule.id,
              },
              data: {
                ...schedule,
                maxPatient: Math.floor(minutes / checkUpTime),
                timeTaken: checkUpTime,
                updatedBy: currentUser,
                updatedAt: new Date(),
              },
            };
          }),
          updateMany: {
            where: {
              id: {
                in: toDeleteSchedule.map((d) => d.id),
              },
            },
            data: {
              isActive: false,
              deletedAt: new Date(),
              deletedBy: currentUser,
            },
          },
        },

        // Staff Collection Center Mapping Management
        staffCollectionCenter: {
          create: toCreateStaffCcMapping.map((ccId) => {
            return {
              isMainLab: ccId === 1 ? "Y" : "N",
              isActive: BinaryFlag.true,
              collectionCenterId: ccId,
            };
          }),
          updateMany: {
            where: {
              id: {
                in: toDeleteStaffCcMapping.map((d) => d.id),
              },
            },
            data: {
              isActive: BinaryFlag.false,
              modifiedOn: new Date(),
            },
          },
        },
      },

      include: {
        doctorSchedule: {
          where: {
            isActive: true,
          },
        },
        staffCollectionCenter: {
          where: {
            isActive: BinaryFlag.true,
          },
        },
      },
    });
    return createdDoctor;
  });
};

export const getDoctorByIdFromDb = async (
  id: number,
): Promise<DoctorResponse | null> => {
  logger.info("entering::getDoctorByIdFromDb::repository");
  return await db.staff.findFirst({
    where: {
      id,
      designation: DOC_DESG_ID,
      isOpdConsultant: true,
      isActive: 1,
    },
    include: {
      doctorSchedule: {
        where: {
          isActive: true,
        },
      },
      staffCollectionCenter: {
        where: {
          isActive: BinaryFlag.true,
        },
      },
    },
  });
};

export const getDoctorByRegNOFromDb = async (
  regNo: string,
): Promise<DoctorResponse | null> => {
  logger.info("entering::getDoctorByRegNOFromDb::repository");
  return await db.staff.findFirst({
    where: {
      designation: DOC_DESG_ID,
      doctorRegistrationNo: regNo,
      isOpdConsultant: true,
      isActive: 1,
    },
    include: {
      doctorSchedule: {
        where: {
          isActive: true,
        },
      },
      staffCollectionCenter: {
        where: {
          isActive: BinaryFlag.true,
        },
      },
    },
  });
};
export const getDoctorByEmailFromDb = async (
  email: string,
): Promise<DoctorResponse | null> => {
  logger.info("entering::getDoctorByEmailFromDb::repository");
  return await db.staff.findFirst({
    where: {
      email: email,
      isActive: 1,
    },
    include: {
      doctorSchedule: {
        where: {
          isActive: true,
        },
      },
      staffCollectionCenter: {
        where: {
          isActive: BinaryFlag.true,
        },
      },
    },
  });
};

export const getDoctorScheduleByIdFromDb = async (
  id: number,
): Promise<DoctorSchedule | null> => {
  logger.info("entering::getDoctorScheduleByIdFromDb::repository");
  return await db.doctorSchedule.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getDoctorScheduleByDocCCIdFromDb = async (
  docId: number,
  ccId: number,
  weekId: number,
): Promise<DoctorSchedule[]> => {
  logger.info("entering::getDoctorScheduleByDocCCIdFromDb::repository");
  return await db.doctorSchedule.findMany({
    where: {
      docId,
      ccId,
      weekId,
      isActive: true,
    },
  });
};

export const getDoctorScheduleWeekIdFromDb = async (
  docId: number,
  ccId: number,
): Promise<number[]> => {
  logger.info("entering::getDoctorScheduleByDocCCIdFromDb::repository");
  const schedules = await db.doctorSchedule.findMany({
    where: {
      docId,
      ccId,
      isActive: true,
    },
    select: {
      weekId: true,
    },
  });
  return schedules.map((schedule) => schedule.weekId);
};

export const getStaffDesignationByDesignationIdFromDB = async (
  id: number,
): Promise<StaffDesignation | null> => {
  logger.info("entering::getStaffDesignationByDesignationIdFromDB::repository");
  return await db.staffDesignation.findFirst({
    where: {
      id,
      isActive: "yes",
    },
  });
};
