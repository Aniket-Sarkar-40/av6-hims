import { ErrorCode } from "@/types/global.js";

export const statusCodeToErrorCode: { [key: number]: ErrorCode } = {
  400: "BAD_REQUEST",
  401: "USER_PERMISSION_DENIED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  500: "INTERNAL_SERVER_ERROR",
};
