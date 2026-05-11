import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 4501;
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const envMode = process.env.NODE_ENV?.trim() || "DEVELOPMENT";
export const BASE_URL = process.env.BASE_URL;
export const IS_REDIS = process.env.IS_REDIS === "true" || false;
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
export const SMTP_HOST = process.env.SMTP_HOST || "mail.aerialview6.com";
export const SMTP_PORT = process.env.SMTP_PORT || 465;
export const SMTP_USER = process.env.SMTP_USER || "your@aerialview6.com";
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "your-smtp-password";
export const EXT_CONNECTION_TYPE = process.env.EXT_CONNECTION_TYPE || "client";
export const EXT_LOGIN_URL = process.env.EXT_LOGIN_URL;
export const EXT_ROLE_PERM_URL = process.env.EXT_ROLE_PERM_URL;
export const EXT_USER_DETAILS_URL = process.env.EXT_USER_DETAILS_URL;
export const EXT_CHANGE_ROLE_URL = process.env.EXT_CHANGE_ROLE_URL;
export const EXT_ROLE_BY_CC_URL = process.env.EXT_ROLE_BY_CC_URL;
export const API_TIMEOUT = Number(process.env.API_TIMEOUT);
export const EXT_UPLOAD_IMAGE = process.env.EXT_UPLOAD_IMAGE;
export const REDIS_PREFIX = process.env.REDIS_PREFIX || "";
export const CORE_REDIS_PREFIX = process.env.CORE_REDIS_PREFIX || "";
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const NO_OF_LEVELS = Number(process.env.NO_OF_LEVELS) || 3;
export const SUPER_ADMIN_ID = Number(process.env.SUPER_ADMIN_ID) || 1;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
export const TOKEN_VERSION = process.env.TOKEN_VERSION || "V2";
export const MASTER_TABLES = ["country", "city", "state"];
export const JWT_TOKEN = process.env.JWT_TOKEN || "access-token-fixuji";
export const PERMISSION_PREFIX = process.env.PERMISSION_PREFIX || "";
export const MASTER_SERVICE_URL =
  process.env.MASTER_SERVICE_URL ?? "http://127.0.0.1:4002";
export const EXT_COLLECTION_CENTER_BY_STAFF = `${MASTER_SERVICE_URL}/api/v1/master/collection-center/staffId`;
export const EXT_COUNTRY_URL = `${MASTER_SERVICE_URL}/api/v1/master/country`;
export const EXT_EMP_CACHE = process.env.EXT_EMP_CACHE;
export const CASH_BANK_GROUPS = process.env.CASH_BANK_GROUPS
  ? process.env.CASH_BANK_GROUPS.split(",")
  : [];
export const RECEIVABLE_GROUPS = process.env.RECEIVABLE_GROUPS
  ? process.env.RECEIVABLE_GROUPS.split(",")
  : [];
export const PAYABLE_GROUPS = process.env.PAYABLE_GROUPS
  ? process.env.PAYABLE_GROUPS.split(",")
  : [];
export const CLIENT_ID = process.env.CLIENT_ID || "";
export const DEFAULT_COMPANY_ID = Number(process.env.DEFAULT_COMPANY_ID) || 1;
export const EXT_CURRENCY_URL = `${MASTER_SERVICE_URL}/api/v1/master/currency`;
