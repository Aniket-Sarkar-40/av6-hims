import {
  toPatientTestDTO,
  toSearchTestDTO,
} from "@/mapper/appointment/investigation.mapper.js";
import {
  createPatientTestInDb,
  createTestCategoriesInDb,
  createTestsInDb,
  deleteTestCategoriesByIdFromDb,
  getPatientTestByIdFromDb,
  getTestCategoriesByIdFromDb,
  getTestsByIdFromDb,
  getTestsByTestCategoryIdFromDb,
  searchTestFromDb,
  updatePatientTestInDb,
  updateTestCategoriesInDb,
  updateTestsInDb,
} from "@/repository/appointment/investigation.repository.js";
import {
  CreatePatientTestInput,
  CreateTestCategoriesInput,
  CreateTestsInput,
  PatientTestDTO,
  SearchTestInput,
  UpdatePatientTestInput,
  UpdateTestCategoriesInput,
  UpdateTestsInput,
} from "@/types/appointment/investigation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createPatientTestServiceValidation,
  createTestCategoriesServiceValidation,
  createTestsServiceValidation,
  getTestsByTestCategoryIdServiceValidation,
  updatePatientTestServiceValidation,
  updateTestCategoriesServiceValidation,
  updateTestsServiceValidation,
  validateIdTestCategories,
} from "@/validations/service/appointment/investigation.service.validation.js";
import { TestCategories, Tests } from "@repo/db/generated/prisma/client";

export const investigationService = {
  async getTests(input: SearchTestInput) {
    logger.info("entering::getTests::service");
    const results = await searchTestFromDb(input.text);
    logger.info("exiting::getTests::service");
    return results.map((result) => toSearchTestDTO(result));
  },

  async createTestCategories(
    input: CreateTestCategoriesInput,
  ): Promise<TestCategories> {
    logger.info("entering::createTestCategories::service");
    await createTestCategoriesServiceValidation(input);
    const testCategories = await createTestCategoriesInDb(input);
    logger.info("exiting::createTestCategories::service");
    return testCategories;
  },

  async updateTestCategories(
    input: UpdateTestCategoriesInput,
  ): Promise<TestCategories> {
    logger.info("entering::updateTestCategories::service");
    await updateTestCategoriesServiceValidation(input);
    const testCategories = await updateTestCategoriesInDb(input);
    logger.info("exiting::updateTestCategories::service");
    return testCategories;
  },

  async getTestCategoriesById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<TestCategories | null> {
    logger.info("entering::getTestCategoriesById::service");
    validIdCheck(id);
    const testCategories = await getTestCategoriesByIdFromDb(id);
    logger.info("exiting::getTestCategoriesById::service");
    if (!testCategories) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Test Categories"),
        );
      else return null;
    }
    return testCategories;
  },

  async deleteTestCategoriesById(testCategoryId: number): Promise<void> {
    logger.info("entering::deleteTestCategoriesById::service");
    await validateIdTestCategories(testCategoryId);
    await deleteTestCategoriesByIdFromDb(testCategoryId);
    logger.info("exiting::deleteTestCategoriesById::service");
  },

  async createTests(input: CreateTestsInput): Promise<Tests[]> {
    logger.info("entering::createTests::service");
    await createTestsServiceValidation(input);
    const tests = await createTestsInDb(input);
    logger.info("exiting::createTests::service");
    return tests;
  },

  async updateTests(input: UpdateTestsInput): Promise<Tests[]> {
    logger.info("entering::updateTests::service");
    await updateTestsServiceValidation(input);
    const tests = await updateTestsInDb(input);
    logger.info("exiting::updateTests::service");
    return tests;
  },

  async getTestsByTestCategoryId(testCategoryId: number): Promise<Tests[]> {
    logger.info("entering::getTestsByTestCategoryId::service");
    await getTestsByTestCategoryIdServiceValidation(testCategoryId);
    const tests = await getTestsByTestCategoryIdFromDb(testCategoryId);
    logger.info("exiting::getTestsByTestCategoryId::service");
    return tests;
  },

  async getTestsById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<Tests | null> {
    logger.info("entering::getTestsById::service");
    validIdCheck(id);
    const tests = await getTestsByIdFromDb(id);
    logger.info("exiting::getTestsById::service");
    if (!tests) {
      if (!canNullReturnable)
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Tests"));
      else return null;
    }
    return tests;
  },
  /*-------------------------Investigation/Precedure Service----------------------*/
  async createPatientTest(
    input: CreatePatientTestInput,
  ): Promise<PatientTestDTO[]> {
    logger.info("entering::createPatientTest::service");
    await createPatientTestServiceValidation(input);
    const patientTests = await createPatientTestInDb(input);
    logger.info("exiting::createPatientTest::service");
    return Promise.all(
      patientTests.map((patientTest) => toPatientTestDTO(patientTest)),
    );
  },
  async updatePatientTest(
    input: UpdatePatientTestInput,
  ): Promise<PatientTestDTO[]> {
    logger.info("entering::updatePatientTest::service");
    await updatePatientTestServiceValidation(input);
    const patientTests = await updatePatientTestInDb(input);
    logger.info("exiting::updatePatientTest::service");
    return Promise.all(
      patientTests.map((patientTest) => toPatientTestDTO(patientTest)),
    );
  },
  async getPatientTestById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<PatientTestDTO | null> {
    logger.info("entering::getPatientTestById::service");
    validIdCheck(id);
    const patientTests = await getPatientTestByIdFromDb(id);
    logger.info("exiting::getPatientTestById::service");
    if (!patientTests) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Patient Test"),
        );
      else return null;
    }
    return toPatientTestDTO(patientTests);
  },
};
