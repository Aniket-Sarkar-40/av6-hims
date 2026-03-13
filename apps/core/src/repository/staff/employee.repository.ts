import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateOrUpdateEmployee,
  StaffResponse,
} from "@/types/staff/employee.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Staff } from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";
import { CreateStaffInput } from "@/types/staff/doctor.js";

export async function createEmployeeInDb(
  input: CreateStaffInput,
  emplInput: CreateOrUpdateEmployee
): Promise<Staff> {
  const store = requestStorage.getStore();
  const createdBy = store?.user?.id;

  return await db.$transaction(async (tx) => {
    const staffRecord = await tx.staff.create({
      data: input,
    });
    await tx.staffMapping.create({
      data: omitUndefined({
        staffId: staffRecord.id,
        departmentId: emplInput.departmentId,
        designationId: emplInput.designationId,
        createdBy,
      }),
    });
    return staffRecord;
  });
}

export async function updateEmployeeInDb(
  id: number,
  input: CreateStaffInput,
  emplInput: CreateOrUpdateEmployee
): Promise<Staff> {
  const store = requestStorage.getStore();
  const updatedBy = store?.user?.id ?? null;

  return await db.$transaction(async (tx) => {
    const staffRecord = await tx.staff.update({
      where: { id },
      data: input,
    });
    await tx.staffMapping.update({
      where: { staffId: id },
      data: omitUndefined({
        staffId: staffRecord.id,
        departmentId: emplInput.departmentId,
        designationId: emplInput.designationId,
        updatedBy,
      }),
    });
    return staffRecord;
  });
}

export const getAllEmployeesFromDb = async () => {
  logger.info("entering::getAllEmployeesFromDb::repository");
  return db.staff.findMany({
    where: { isActive: 1 },
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

export const getEmployeeByIdFromDb = async (id: number) => {
  logger.info("entering::getEmployeeByIdFromDb::repository");
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

export const getEmployeeByEmployeeEmailFromDb = async (
  email: string
): Promise<Staff | null> => {
  logger.info("entering::getEmployeeByEmployeeEmailFromDb::repository");
  return db.staff.findFirst({
    where: { email, isActive: 1 },
  });
};
export const getEmployeeByEmployeeIdFromDb = async (
  employeeId: string
): Promise<Staff | null> => {
  logger.info("entering::getEmployeeByEmployeeIdFromDb::repository");
  return db.staff.findFirst({
    where: { employeeId, isActive: 1 },
  });
};

export const deleteEmployeeInDb = async (id: number): Promise<void> => {
  logger.info("entering::deleteEmployeeInDb::repository");

  await db.$transaction(async (tx) => {
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
  });
};

export const checkForeignKeyForEmployee = async (
  id: number,
  siteId: number,
  departmentId: number,
  locationId: number
) => {
  logger.info("entering::checkForeignKeyForEmployee::repository");

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

export const updateActiveEmployeeInDb = async (id: number): Promise<Staff> => {
  logger.info("entering::updateActiveEmployeeInDb::repository");
  return db.staff.update({
    where: { id },
    data: { isActive: 1 },
  });
};

export const getStaffDetailsByIdFromDb = async (
  id: number
): Promise<StaffResponse | null> => {
  logger.info("entering::getStaffDetailsByIdFromDb::repository");
  return db.staff.findFirst({
    where: { id, isActive: 1 },
    select: {
      id: true,
      name: true,
      surname: true,
      designation: true,
      employeeId: true,
      department: true,
      email: true,
    },
  });
};
