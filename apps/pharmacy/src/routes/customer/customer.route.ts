import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
} from "@/controllers/customer/customer.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCustomer,
  validateUpdateSchema,
} from "@/validations/request/customer/customer.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const customerRouter: Router = Router();
/**
 * @swagger
 * tags:
 *   name: customer
 *   description: customer endpoints
 */
/**
 * @swagger
 * /api/v1/customer:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonCustomerSchema'
 */
// POST /customer
customerRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "CUSTOMER", "CREATE")),
  validateCustomer,
  createCustomer
);
/**
 * @swagger
 * /api/v1/customer:
 *   get:
 *     summary: Retrieve a list of customers.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
// GET /customer
customerRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "CUSTOMER", "VIEW")),
  getAllCustomers
);

/**
 * @swagger
 * /api/v1/customer/id:
 *   get:
 *     summary: Retrieve a single customer by ID.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID.
 */
// GET /customer/id?customerId=1
customerRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "CUSTOMER", "VIEW")),
  getCustomerById
);

/**
 * @swagger
 * /api/v1/customer:
 *   put:
 *     summary: Update a customer's details.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateCustomerSchema'
 */
// PUT /customer
customerRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "CUSTOMER", "VIEW"),
    getPermission("PMS", "CUSTOMER", "UPDATE")
  ),
  validateUpdateSchema,
  updateCustomer
);
