import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreatePatientTestInput,
  CreateTestCategoriesInput,
  CreateTestsInput,
  PatientTestResponse,
  RawSearchTestResult,
  UpdatePatientTestInput,
  UpdateTestCategoriesInput,
  UpdateTestsInput,
} from "@/types/appointment/investigation.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  PatientTest,
  TestCategories,
  Tests,
} from "@repo/db/generated/prisma/client";

export const searchTestFromDb = async (
  searchText: string,
): Promise<RawSearchTestResult[]> => {
  logger.info("entering::searchTestFromDb::repository");
  const likeSearch = `%${searchText}%`;

  const results = await db.$queryRaw<RawSearchTestResult[]>`
    SELECT
        id,
        analytecode AS testCode,
        analyte_name AS testName,
        standard_charge AS rate,
        department_name AS department,
        is_comment_required AS isCommentRequired
    FROM pathology_master
    WHERE standard_charge != '0'
      AND is_active = 'Yes'
      AND orderable = 'Yes'
      AND (
        analyte_name LIKE ${likeSearch}
        OR analyteid LIKE ${likeSearch}
        OR analytecode LIKE ${likeSearch}
      )
    GROUP BY analytecode
  `;

  logger.info("exiting::searchTestFromDb::repository");
  return results;
};

export const createTestCategoriesInDb = async (
  input: CreateTestCategoriesInput,
): Promise<TestCategories> => {
  logger.info("entering::createTestCategoriesInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.testCategories.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateTestCategoriesInDb = async (
  input: UpdateTestCategoriesInput,
): Promise<TestCategories> => {
  logger.info("entering::createTestCategoriesInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, ...rest } = input;
  return await db.testCategories.update({
    where: {
      id,
    },
    data: {
      ...rest,
      updatedBy: currentUser,
    },
  });
};

export const getTestCategoriesByIdFromDb = async (
  id: number,
): Promise<TestCategories | null> => {
  logger.info("entering::getTestCategoriesByIdFromDb::repository");
  return await db.testCategories.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getTestCategoriesByDoctorIdFromDb = async (
  doctorId: number,
): Promise<TestCategories[]> => {
  logger.info("entering::getTestCategoriesByDoctorIdFromDb::repository");
  return await db.testCategories.findMany({
    where: {
      doctorId,
      isActive: true,
    },
  });
};

export const deleteTestCategoriesByIdFromDb = async (id: number) => {
  logger.info("entering::deleteTestCategoriesByIdFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  await db.testCategories.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: currentUser,
      tests: {
        updateMany: {
          where: {
            testCategoryId: id,
          },
          data: {
            isActive: false,
            deletedAt: new Date(),
            deletedBy: currentUser,
          },
        },
      },
    },
  });
};

export const createTestsInDb = async (
  input: CreateTestsInput,
): Promise<Tests[]> => {
  logger.info("entering::createTestsInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { testCategoryId, data } = input;
  const createdTests = Promise.all(
    data.map((test) => {
      return db.tests.create({
        data: {
          ...test,
          testCategoryId,
          createdBy: currentUser,
        },
      });
    }),
  );
  return createdTests;
};

export const updateTestsInDb = async (
  input: UpdateTestsInput,
): Promise<Tests[]> => {
  logger.info("entering::updateTestsInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { testCategoryId, data, existingTests } = input;
  // To create, update, delete
  const toUpdate = data.filter((d) => typeof d.id === "number");
  const toCreate = data.filter((d) => typeof d.id !== "number");
  const toDelete = existingTests.filter(
    (d) => !data.some((item) => item.id === d.id),
  );
  const toDeleteIds = toDelete.map((d) => d.id);

  return await db.$transaction(async (tx) => {
    const updated = await Promise.all(
      toUpdate.map(async (test) => {
        const { id, ...rest } = test;
        return tx.tests.update({
          where: {
            id,
          },
          data: {
            ...rest,
            updatedBy: currentUser,
          },
        });
      }),
    );

    const created = await Promise.all(
      toCreate.map((test) => {
        const omittedTest = customOmit(test, ["id"]);
        return tx.tests.create({
          data: {
            ...omittedTest.rest,
            testCategoryId,
            createdBy: currentUser,
          },
        });
      }),
    );

    if (toDeleteIds.length > 0) {
      await tx.tests.updateMany({
        where: {
          id: { in: toDeleteIds },
        },
        data: {
          isActive: false,
          deletedBy: currentUser,
          deletedAt: new Date(),
        },
      });
    }

    return [...updated, ...created];
  });
};

export const getTestsByTestCategoryIdFromDb = async (
  testCategoryId: number,
): Promise<Tests[]> => {
  logger.info("entering::getTestsByTestCategoryIdFromDb::repository");
  return await db.tests.findMany({
    where: {
      testCategoryId,
      isActive: true,
    },
  });
};

export const getTestsByIdFromDb = async (id: number): Promise<Tests | null> => {
  logger.info("entering::getTestsByIdFromDb::repository");
  return await db.tests.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

/*-------------------------Investigation/Precedure Repository----------------------*/
export const createPatientTestInDb = async (
  input: CreatePatientTestInput,
): Promise<PatientTestResponse[]> => {
  logger.info("entering::createPatientTestInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { appointmentId, patientId, data } = input;

  return await db.$transaction(async (tx) => {
    const createdPatientTests = Promise.all(
      data.map((test) => {
        return tx.patientTest.create({
          data: {
            ...test,
            appointmentId,
            patientId,
            createdBy: currentUser,
          },
          include: {
            appointment: true,
            collectionCenter: true,
          },
        });
      }),
    );
    return createdPatientTests;
  });
};

export const updatePatientTestInDb = async (
  input: UpdatePatientTestInput,
): Promise<PatientTestResponse[]> => {
  logger.info("entering::updatePatientTestInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { appointmentId, patientId, data, existing } = input;
  // To create, update, delete
  const toUpdate = data.filter((d) => typeof d.id === "number");
  const toCreate = data.filter((d) => typeof d.id !== "number");
  const toDelete = existing.filter(
    (d) => !data.some((item) => item.id === d.id),
  );
  const toDeleteIds = toDelete.map((d) => d.id);

  return await db.$transaction(async (tx) => {
    const updated = await Promise.all(
      toUpdate.map(async (test) => {
        const { id, ...rest } = test;
        return tx.patientTest.update({
          where: {
            id,
          },
          data: {
            ...rest,
            updatedBy: currentUser,
          },
          include: {
            appointment: true,
            collectionCenter: true,
          },
        });
      }),
    );

    const created = await Promise.all(
      toCreate.map((test) => {
        const omittedTest = customOmit(test, ["id"]);
        return tx.patientTest.create({
          data: {
            ...omittedTest.rest,
            appointmentId,
            patientId,
            createdBy: currentUser,
          },
          include: {
            appointment: true,
            collectionCenter: true,
          },
        });
      }),
    );

    if (toDeleteIds.length > 0) {
      await tx.patientTest.updateMany({
        where: {
          id: { in: toDeleteIds },
        },
        data: {
          isActive: false,
          deletedBy: currentUser,
          deletedAt: new Date(),
        },
      });
    }

    return [...updated, ...created];
  });
};

export const getPatientTestByIdFromDb = async (
  id: number,
): Promise<PatientTestResponse | null> => {
  logger.info("entering::getPatientTestByIdFromDb::repository");
  return await db.patientTest.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      appointment: true,
      collectionCenter: true,
    },
  });
};

export const getPatientTestByAppointmentIdFromDb = async (
  appointmentId: number,
): Promise<PatientTest[]> => {
  logger.info("entering::getPatientTestByAppointmentIdFromDb::repository");
  return await db.patientTest.findMany({
    where: {
      appointmentId,
      isActive: true,
    },
  });
};
