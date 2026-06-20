import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
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
  errors?: ValidationErrorItem[];
  err?: ErrorHandler;
}

export interface IdValue {
  id: number;
  value: string;
}
