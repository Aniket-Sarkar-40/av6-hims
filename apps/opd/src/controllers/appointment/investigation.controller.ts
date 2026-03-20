import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { investigationService } from "@/services/appointment/investigation.service.js";
import {
  CreatePatientTestInput,
  CreateTestCategoriesInput,
  CreateTestsInput,
  SearchTestInput,
  UpdatePatientTestInput,
  UpdateTestCategoriesInput,
  UpdateTestsInput,
} from "@/types/appointment/investigation.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const getTests = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getTests::controller");
  const input = req.body as SearchTestInput;
  const tests = await investigationService.getTests(input);
  const response = BaseResponse.success(
    { type: "FETCHED", data: tests },
    "Pathology Tests",
  );
  logger.info("exiting::getTests::controller");
  return res.status(200).json(response);
});

export const createTestCategories = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createTestCategories::controller");
    const input = req.body as CreateTestCategoriesInput;
    const testCategory = await investigationService.createTestCategories(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: testCategory },
      "Test Category",
    );
    logger.info("exiting::createTestCategories::controller");
    return res.status(201).json(response);
  },
);

export const updateTestCategories = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateTestCategories::controller");
    const input = req.body as UpdateTestCategoriesInput;
    const testCategory = await investigationService.updateTestCategories(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: testCategory },
      "Test Category",
    );
    logger.info("exiting::updateTestCategories::controller");
    return res.status(200).json(response);
  },
);

export const getTestCategoriesById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getTestCategoriesById::controller");
    const { testCategoryId } = req.query as { testCategoryId: string };
    const testCategory = await investigationService.getTestCategoriesById(
      Number(testCategoryId),
    );
    const response = BaseResponse.success(
      { type: "FETCHED", data: testCategory },
      "Test Category",
    );
    logger.info("exiting::getTestCategoriesById::controller");
    return res.status(200).json(response);
  },
);

export const deleteTestCategoriesById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteTestCategoriesById::controller");
    const { testCategoryId } = req.query as { testCategoryId: string };
    await investigationService.deleteTestCategoriesById(Number(testCategoryId));
    const response = BaseResponse.success(
      { type: "DELETED" },
      "Test Categories",
    );
    logger.info("exiting::deleteTestCategoriesById::controller");
    return res.status(200).json(response);
  },
);

export const createTests = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createTests::controller");
  const input = req.body as CreateTestsInput;
  const tests = await investigationService.createTests(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: tests },
    "Tests",
  );
  logger.info("exiting::createTests::controller");
  return res.status(201).json(response);
});

export const updateTests = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateTests::controller");
  const input = req.body as UpdateTestsInput;
  const tests = await investigationService.updateTests(input);
  const response = BaseResponse.success(
    { type: "UPDATED", data: tests },
    "Tests",
  );
  logger.info("exiting::updateTests::controller");
  return res.status(200).json(response);
});

export const getTestsByTestCategoryId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getTestsByTestCategoryId::controller");
    const { testCategoryId } = req.query as { testCategoryId: string };
    const tests = await investigationService.getTestsByTestCategoryId(
      Number(testCategoryId),
    );
    const response = BaseResponse.success(
      { type: "FETCHED", data: tests },
      "Tests",
    );
    logger.info("exiting::getTestsByTestCategoryId::controller");
    return res.status(200).json(response);
  },
);

export const getTestsById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getTestsById::controller");
  const { testId } = req.query as { testId: string };
  const tests = await investigationService.getTestsById(Number(testId));
  const response = BaseResponse.success(
    { type: "FETCHED", data: tests },
    "Test",
  );
  logger.info("exiting::getTestsById::controller");
  return res.status(200).json(response);
});

/*-------------------------Investigation/Precedure Controller----------------------*/
export const createPatientTest = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPatientTest::controller");
    const input = req.body as CreatePatientTestInput;
    const patientTests = await investigationService.createPatientTest(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: patientTests },
      "Patient Test",
    );
    logger.info("exiting::createPatientTest::controller");
    return res.status(201).json(response);
  },
);

export const updatePatientTest = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePatientTest::controller");
    const input = req.body as UpdatePatientTestInput;
    const patientTests = await investigationService.updatePatientTest(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: patientTests },
      "Patient Test",
    );
    logger.info("exiting::updatePatientTest::controller");
    return res.status(200).json(response);
  },
);

export const getPatientTestById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPatientTestById::controller");
    const { patientTestId } = req.query as { patientTestId: string };
    const patientTests = await investigationService.getPatientTestById(
      Number(patientTestId),
    );
    const response = BaseResponse.success(
      { type: "FETCHED", data: patientTests },
      "Patient Test",
    );
    logger.info("exiting::getPatientTestById::controller");
    return res.status(200).json(response);
  },
);
