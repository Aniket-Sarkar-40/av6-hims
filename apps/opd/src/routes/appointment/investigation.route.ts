import {
  createPatientTest,
  createTestCategories,
  createTests,
  deleteTestCategoriesById,
  getPatientTestById,
  getTestCategoriesById,
  getTests,
  getTestsById,
  getTestsByTestCategoryId,
  updatePatientTest,
  updateTestCategories,
  updateTests,
} from "@/controllers/appointment/investigation.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreatePatientTest,
  validateCreateTestCategories,
  validateCreateTests,
  validateSearchTest,
  validateUpdatePatientTest,
  validateUpdateTestCategories,
  validateUpdateTests,
} from "@/validations/request/appointment/investigation.validation.js";
import { Router } from "express";

export const investigationRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Investigation
 *   description: Investigation management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment/investigation:
 *   get:
 *     summary: Get Pathology Tests
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/searchTestSchema'
 */
investigationRouter.post(
  "/search-tests",
  verifyToken,
  authorize(getPermission("OPD", "PATHOLOGY_MASTER", "VIEW")),
  validateSearchTest,
  getTests,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/test-categories:
 *   post:
 *     summary: Create Test Category
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createTestCategoriesSchema'
 */
investigationRouter.post(
  "/test-categories",
  verifyToken,
  authorize(getPermission("OPD", "TEST_CATEGORIES", "CREATE")),
  validateCreateTestCategories,
  createTestCategories,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/test-categories:
 *   put:
 *     summary: Update Test Category
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateTestCategoriesSchema'
 */
investigationRouter.put(
  "/test-categories",
  verifyToken,
  authorize(
    getPermission("OPD", "TEST_CATEGORIES", "VIEW"),
    getPermission("OPD", "TEST_CATEGORIES", "UPDATE"),
  ),
  validateUpdateTestCategories,
  updateTestCategories,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/test-categories/id:
 *   get:
 *     summary: Retrieve a single test category
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the test category to get
 */
investigationRouter.get(
  "/test-categories/id",
  verifyToken,
  authorize(getPermission("OPD", "TEST_CATEGORIES", "VIEW")),
  getTestCategoriesById,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/test-categories:
 *   delete:
 *     summary: Delete Test Category
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: testCategoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the test category to get
 */
investigationRouter.delete(
  "/test-categories",
  verifyToken,
  authorize(getPermission("OPD", "TEST_CATEGORIES", "DELETE")),
  deleteTestCategoriesById,
);
/**
 * @swagger
 * /api/v1/appointment/investigation/tests:
 *   post:
 *     summary: Create Test
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createTestsSchema'
 */
investigationRouter.post(
  "/tests",
  verifyToken,
  authorize(getPermission("OPD", "TESTS", "CREATE")),
  validateCreateTests,
  createTests,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/tests:
 *   put:
 *     summary: Update Test
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateTestsSchema'
 */
investigationRouter.put(
  "/tests",
  verifyToken,
  authorize(
    getPermission("OPD", "TESTS", "VIEW"),
    getPermission("OPD", "TESTS", "UPDATE"),
  ),
  validateUpdateTests,
  updateTests,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/tests/id:
 *   get:
 *     summary: Retrieve a single test
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the test to get
 */
investigationRouter.get(
  "/tests/id",
  verifyToken,
  authorize(getPermission("OPD", "TESTS", "VIEW")),
  getTestsById,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/tests/test-category:
 *   get:
 *     summary: Retrieve tests by test category
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: testCategoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the test category to get
 */
investigationRouter.get(
  "/tests/test-category",
  verifyToken,
  authorize(getPermission("OPD", "TESTS", "VIEW")),
  getTestsByTestCategoryId,
);

/**
 * @swagger
 * /api/v1/appointment/investigation:
 *   post:
 *     summary: Create Patient Test
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createPatientTestSchema'
 */
investigationRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "PATIENT_TEST", "CREATE")),
  validateCreatePatientTest,
  createPatientTest,
);
/**
 * @swagger
 * /api/v1/appointment/investigation:
 *   put:
 *     summary: Update Patient Test
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updatePatientTestSchema'
 */
investigationRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("OPD", "PATIENT_TEST", "VIEW"),
    getPermission("OPD", "PATIENT_TEST", "UPDATE"),
  ),
  validateUpdatePatientTest,
  updatePatientTest,
);

/**
 * @swagger
 * /api/v1/appointment/investigation/id:
 *   get:
 *     summary: Retrieve a single patient test
 *     tags: [Investigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientTestId
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the patient test to get
 */

investigationRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("OPD", "PATIENT_TEST", "VIEW")),
  getPatientTestById,
);
