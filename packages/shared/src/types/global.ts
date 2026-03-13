import ErrorHandler from "@/utils/errorHandler.utils.js";
import { ValidationErrorItem } from "joi";

// Define the possible literal types for error 'type'
export type ErrorType =
  | "string"
  | "integer"
  | "BigDecimal"
  | "Boolean"
  | "object";

// Define the allowed locations where an error can occur
export type ErrorLocation = "body" | "pathparam" | "queryparam" | "header";

// Define the possible error codes for the response
export type ErrorCode =
  | "PARAMETER_MISSING"
  | "PARAMETER_INVALID"
  | "PARAMETER_MISMATCHED"
  | "NOT_FOUND"
  | "USER_PERMISSION_DENIED"
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR";

// Main API response interface
export interface ApiResponse {
  success: boolean;
  message?: string;
  errorCode?: ErrorCode;
  errorMessage?: string; // e.g., "One or more parameter missing" or "User do not have access to perform this operation"
  errors?: ValidationErrorItem[] | undefined;
  err?: ErrorHandler;
}

export interface IdValue {
  id: number;
  value: string;
}

export type Service = "CORE" | "PHARMACY" | "OPD" | "INVENTORY";

export interface BaseModel {
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  canceledAt?: Date | null;
  canceledBy?: number | null;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

export type BaseModelAttr =
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "canceledBy"
  | "canceledAt"
  | "createdAt"
  | "updatedAt"
  | "deletedAt";

export type BaseModelAttrWoCancel =
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt";
