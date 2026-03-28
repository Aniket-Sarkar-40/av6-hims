import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateOrUpdateDoctor,
  CreateStaffInput,
} from "@/types/staff/doctor.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Staff } from "@repo/db/generated/prisma/client";

export async function createDoctorInDb(
  input: CreateStaffInput,
  docInput: CreateOrUpdateDoctor,
) {
  const store = requestStorage.getStore();
  const createdBy = store?.user?.id;

  await db.$transaction(
    async (tx) => {
      const staffRecord = await tx.staff.create({
        data: input,
      });
      await tx.staffMapping.create({
        data: {
          staffId: staffRecord.id,
          departmentId: docInput.departmentId,
          designationId: docInput.designationId,
          createdBy,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );
}

export async function updateDoctorInDb(
  input: CreateStaffInput,
  docInput: CreateOrUpdateDoctor,
) {
  const store = requestStorage.getStore();
  const updatedBy = store?.user?.id;

  await db.$transaction(
    async (tx) => {
      const staffRecord = await tx.staff.update({
        where: { id: docInput.id },
        data: input,
      });
      await tx.staffMapping.update({
        where: { staffId: docInput.id },
        data: {
          staffId: staffRecord.id,
          departmentId: docInput.departmentId,
          designationId: docInput.designationId,
          updatedBy,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );
}

export const getAllDoctorsFromDb = async (designationId: number) => {
  logger.info("entering::getAllDoctorsFromDb::repository");
  return db.staff.findMany({
    where: {
      isActive: 1,
      employee: {
        isActive: true,
        designationId,
      },
    },
    include: {
      employee: {
        where: {
          isActive: true,
        },
        include: {
          Department: true,
        },
      },
    },
  });
};

export const getDoctorByIdFromDb = async (id: number) => {
  logger.info("entering::getDoctorByIdFromDb::repository");
  return db.staff.findUnique({
    where: { id, isActive: 1 },
    include: {
      employee: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getStaffByIdFromDb = async (id: number) => {
  logger.info("entering::getStaffByIdFromDb::repository");
  return db.staff.findUnique({
    where: { id, isActive: 1 },
  });
};

export const getDoctorByDoctorEmailFromDb = async (
  email: string,
): Promise<Staff | null> => {
  logger.info("entering::getDoctorByDoctorEmailFromDb::repository");
  return db.staff.findFirst({
    where: { email, isActive: 1 },
  });
};
export const getDoctorByDoctorIdFromDb = async (
  employeeId: string,
): Promise<Staff | null> => {
  logger.info("entering::getDoctorByDoctorIdFromDb::repository");
  return db.staff.findFirst({
    where: { employeeId, isActive: 1 },
  });
};

export const deleteDoctorInDb = async (id: number): Promise<void> => {
  logger.info("entering::deleteDoctorInDb::repository");

  await db.$transaction(
    async (tx) => {
      await tx.staff.update({
        where: { id },
        data: { isActive: 0 },
      });
      await tx.staffMapping.update({
        where: {
          staffId: id,
        },
        data: {
          isActive: false,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const checkForeignKeyForDoctor = async (
  id: number,
  siteId: number,
  departmentId: number,
  locationId: number,
) => {
  logger.info("entering::checkForeignKeyForDoctor::repository");

  return db.staff.findUnique({
    where: {
      id,
      isActive: 1,
      department: {
        equals: String(departmentId),
      },
      location: {
        equals: String(locationId),
      },
    },
  });
};

export const updateActiveDoctorInDb = async (id: number): Promise<Staff> => {
  logger.info("entering::updateActiveDoctorInDb::repository");
  return db.staff.update({
    where: { id },
    data: { isActive: 1 },
  });
};
