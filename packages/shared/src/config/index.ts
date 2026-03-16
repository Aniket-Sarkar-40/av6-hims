import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../../../.env");

dotenv.config({ path: rootEnvPath });

export const PORT = process.env.PORT || 3000;
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
export const DOC_DESG_ID = process.env.DOC_DESG_ID || "2";
export const EXT_LOGIN_URL = process.env.EXT_LOGIN_URL;
export const EXT_ROLE_PERM_URL = process.env.EXT_ROLE_PERM_URL;
export const EXT_USER_DETAILS_URL = process.env.EXT_USER_DETAILS_URL;
export const EXT_CHANGE_ROLE_URL = process.env.EXT_CHANGE_ROLE_URL;
export const EXT_ROLE_BY_CC_URL = process.env.EXT_ROLE_BY_CC_URL;
export const API_TIMEOUT = Number(process.env.API_TIMEOUT);
export const EXT_UPLOAD_IMAGE = process.env.EXT_UPLOAD_IMAGE;
export const REDIS_PREFIX = process.env.REDIS_PREFIX || "";
export const FRONTEND_URLS = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : [];
export const IMAGE_URL = process.env.IMAGE_URL;
export const LOG_DAYS = process.env.LOG_DAYS || "7d";
export const MASTER_TABLES = ["country", "city", "state"];
export const NO_OF_LEVELS = Number(process.env.NO_OF_LEVELS) || 3;
export const TOKEN_VERSION = process.env.TOKEN_VERSION || "V1";
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ".fixuji.com";

export const JWT_TOKEN = process.env.JWT_TOKEN || "access-token-av6";
export const SUPER_ADMIN_ID = Number(process.env.SUPER_ADMIN_ID) || 1;
export const PERMISSION_PREFIX = process.env.PERMISSION_PREFIX || "";

export const CRON_RETRY_DELAY_MS = 5 * 60 * 1000;
export const CRON_MAX_RETRIES = 3;
export const CRON_IN_PROGRESS_STALE_MS = 10 * 60 * 1000;

// S3 bucket
export const HETZNER_ACCESS_KEY = String(process.env.HETZNER_ACCESS_KEY);
export const HETZNER_SECRET_KEY = String(process.env.HETZNER_SECRET_KEY);
export const HETZNER_BUCKET = String(process.env.HETZNER_BUCKET);
export const HETZNER_REGION = String(process.env.HETZNER_REGION);
export const HETZNER_ENDPOINT = String(process.env.HETZNER_ENDPOINT);
