import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Joi from "joi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../../../.env");

dotenv.config({ path: rootEnvPath });

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */
/**
 * All environment access flows through this Joi schema so that:
 *  - required secrets fail-fast at startup (never silently default to a
 *    guessable value),
 *  - values are coerced to the correct type once, in a single place,
 *  - consumers get typed, grouped config objects.
 *
 * Comma-separated list vars are validated as strings here and split in the
 * derived exports below.
 */

interface RawEnv {
  NODE_ENV: string;
  PORT: number;
  ENABLED_APPS: string;
  JWT_SECRET: string;
  SMTP_PASSWORD: string;
  EMAIL_PASSWORD: string;
  ACCESS_TOKEN_SECRET?: string;
  REFRESH_TOKEN_SECRET?: string;
  DATABASE_URL: string;
  IS_REDIS: boolean;
  REDIS_URL: string;
  REDIS_PASSWORD: string;
  REDIS_PREFIX: string;
  CORE_REDIS_PREFIX: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  EMAIL_SMTP_SERVER: string;
  EMAIL_SMTP_PORT: number;
  EMAIL_USERNAME: string;
  EMAIL_SSL_TLS: string;
  BASE_URL?: string;
  IMAGE_URL?: string;
  FRONTEND_URL?: string;
  FRONTEND_URLS: string;
  LOG_DAYS: string;
  NO_OF_LEVELS: number;
  TOKEN_VERSION: "V1" | "V2";
  COOKIE_DOMAIN: string;
  JWT_TOKEN: string;
  SUPER_ADMIN_ID: number;
  PERMISSION_PREFIX: string;
  DEFAULT_COMPANY_ID: number;
  DOC_DESG_ID: string;
  DOC_ROLE_ID: string;
  CLIENT_ID: string;
  API_TIMEOUT: number;
  EXT_CONNECTION_TYPE: string;
  EXT_LOGIN_URL?: string;
  EXT_ROLE_PERM_URL?: string;
  EXT_USER_DETAILS_URL?: string;
  EXT_CHANGE_ROLE_URL?: string;
  EXT_ROLE_BY_CC_URL?: string;
  EXT_UPLOAD_IMAGE?: string;
  EXT_BASE_URL?: string;
  EXT_EMP_CACHE?: string;
  EXT_PHARMACY_ITEM_URL: string;
  MASTER_SERVICE_URL: string;
  INVENTORY_SERVICE_URL: string;
  HETZNER_ACCESS_KEY: string;
  HETZNER_SECRET_KEY: string;
  HETZNER_BUCKET: string;
  HETZNER_REGION: string;
  HETZNER_ENDPOINT: string;
  CASH_BANK_GROUPS: string;
  RECEIVABLE_GROUPS: string;
  PAYABLE_GROUPS: string;
}

const requiredWhenV2 = Joi.string().when("TOKEN_VERSION", {
  is: "V2",
  then: Joi.string().min(1).required(),
  otherwise: Joi.string().allow("").optional(),
});

const envSchema = Joi.object<RawEnv>({
  NODE_ENV: Joi.string().trim().default("DEVELOPMENT"),
  PORT: Joi.number().default(3000),

  // --- Gateway ---
  ENABLED_APPS: Joi.string().allow("").default(""),

  // --- Secrets (REQUIRED: no defaults, fail-fast) ---
  JWT_SECRET: Joi.string().min(1).required(),
  SMTP_PASSWORD: Joi.string().min(1).required(),
  EMAIL_PASSWORD: Joi.string().min(1).required(),
  // Required only when running the V2 token flow.
  ACCESS_TOKEN_SECRET: requiredWhenV2,
  REFRESH_TOKEN_SECRET: requiredWhenV2,

  // --- Database ---
  DATABASE_URL: Joi.string().allow("").default(""),

  // --- Redis ---
  IS_REDIS: Joi.boolean().truthy("true").falsy("false").default(false),
  REDIS_URL: Joi.string().default("redis://localhost:6379"),
  REDIS_PASSWORD: Joi.string().allow("").default(""),
  REDIS_PREFIX: Joi.string().allow("").default(""),
  CORE_REDIS_PREFIX: Joi.string().allow("").default(""),

  // --- SMTP / Email ---
  SMTP_HOST: Joi.string().default("mail.aerialview6.com"),
  SMTP_PORT: Joi.number().default(465),
  SMTP_USER: Joi.string().default("your@aerialview6.com"),
  EMAIL_SMTP_SERVER: Joi.string().default("smtp.gmail.com"),
  EMAIL_SMTP_PORT: Joi.number().default(587),
  EMAIL_USERNAME: Joi.string().default("test@gmail.com"),
  EMAIL_SSL_TLS: Joi.string().default("tls"),

  // --- App / general ---
  BASE_URL: Joi.string().allow("").optional(),
  IMAGE_URL: Joi.string().allow("").optional(),
  FRONTEND_URL: Joi.string().allow("").optional(),
  FRONTEND_URLS: Joi.string().allow("").default(""),
  LOG_DAYS: Joi.string().default("7d"),
  NO_OF_LEVELS: Joi.number().default(3),
  TOKEN_VERSION: Joi.string().valid("V1", "V2").default("V1"),
  COOKIE_DOMAIN: Joi.string().default(".fixuji.com"),
  JWT_TOKEN: Joi.string().default("access-token-av6"),
  SUPER_ADMIN_ID: Joi.number().default(1),
  PERMISSION_PREFIX: Joi.string().allow("").default(""),
  DEFAULT_COMPANY_ID: Joi.number().default(1),
  DOC_DESG_ID: Joi.string().default("2"),
  DOC_ROLE_ID: Joi.string().default("3"),
  CLIENT_ID: Joi.string().allow("").default(""),
  API_TIMEOUT: Joi.number().default(60000),

  // --- External services ---
  EXT_CONNECTION_TYPE: Joi.string().default("client"),
  EXT_LOGIN_URL: Joi.string().allow("").optional(),
  EXT_ROLE_PERM_URL: Joi.string().allow("").optional(),
  EXT_USER_DETAILS_URL: Joi.string().allow("").optional(),
  EXT_CHANGE_ROLE_URL: Joi.string().allow("").optional(),
  EXT_ROLE_BY_CC_URL: Joi.string().allow("").optional(),
  EXT_UPLOAD_IMAGE: Joi.string().allow("").optional(),
  EXT_BASE_URL: Joi.string().allow("").optional(),
  EXT_EMP_CACHE: Joi.string().allow("").optional(),
  EXT_PHARMACY_ITEM_URL: Joi.string().allow("").default(""),
  MASTER_SERVICE_URL: Joi.string().default("http://127.0.0.1:4002"),
  INVENTORY_SERVICE_URL: Joi.string().default(
    "http://127.0.0.1:4507/api/v1/inv"
  ),

  // --- Storage (Hetzner S3) ---
  HETZNER_ACCESS_KEY: Joi.string().allow("").default(""),
  HETZNER_SECRET_KEY: Joi.string().allow("").default(""),
  HETZNER_BUCKET: Joi.string().allow("").default(""),
  HETZNER_REGION: Joi.string().allow("").default(""),
  HETZNER_ENDPOINT: Joi.string().allow("").default(""),

  // --- Accounting groups ---
  CASH_BANK_GROUPS: Joi.string().allow("").default(""),
  RECEIVABLE_GROUPS: Joi.string().allow("").default(""),
  PAYABLE_GROUPS: Joi.string().allow("").default(""),
})
  // process.env contains many unrelated keys (PATH, HOME, ...) - ignore them.
  .unknown(true);

const { value: env, error } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
}) as { value: RawEnv; error?: Joi.ValidationError };

if (error) {
  const details = error.details
    .map((d) => `  - ${d.path.join(".") || "(root)"}: ${d.message}`)
    .join("\n");
  throw new Error(
    `Invalid / missing environment configuration:\n${details}\n` +
      `Set the above variable(s) in your .env file (see .env.example).`
  );
}

const toList = (val: string): string[] =>
  val
    ? val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

/* -------------------------------------------------------------------------- */
/* Grouped, typed config objects                                              */
/* -------------------------------------------------------------------------- */

export const appConfig = {
  env: env.NODE_ENV,
  port: env.PORT,
  baseUrl: env.BASE_URL,
  imageUrl: env.IMAGE_URL,
  frontendUrl: env.FRONTEND_URL,
  frontendUrls: toList(env.FRONTEND_URLS),
  logDays: env.LOG_DAYS,
  cookieDomain: env.COOKIE_DOMAIN,
} as const;

export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtCookieName: env.JWT_TOKEN,
  accessTokenSecret: env.ACCESS_TOKEN_SECRET ?? "",
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET ?? "",
  tokenVersion: env.TOKEN_VERSION,
  superAdminId: env.SUPER_ADMIN_ID,
  permissionPrefix: env.PERMISSION_PREFIX,
  clientId: env.CLIENT_ID,
} as const;

export const redisConfig = {
  enabled: env.IS_REDIS,
  url: env.REDIS_URL,
  password: env.REDIS_PASSWORD,
  prefix: env.REDIS_PREFIX,
  corePrefix: env.CORE_REDIS_PREFIX,
} as const;

export const smtpConfig = {
  smtpServer: env.EMAIL_SMTP_SERVER,
  smtpPort: env.EMAIL_SMTP_PORT,
  smtpUsername: env.EMAIL_USERNAME,
  smtpPassword: env.EMAIL_PASSWORD,
  sslTls: env.EMAIL_SSL_TLS,
  // Legacy SMTP_* pair (kept in sync with the same secret source)
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  password: env.SMTP_PASSWORD,
} as const;

export const storageConfig = {
  accessKey: env.HETZNER_ACCESS_KEY,
  secretKey: env.HETZNER_SECRET_KEY,
  bucket: env.HETZNER_BUCKET,
  region: env.HETZNER_REGION,
  endpoint: env.HETZNER_ENDPOINT,
} as const;

export const externalConfig = {
  connectionType: env.EXT_CONNECTION_TYPE,
  loginUrl: env.EXT_LOGIN_URL,
  rolePermUrl: env.EXT_ROLE_PERM_URL,
  userDetailsUrl: env.EXT_USER_DETAILS_URL,
  changeRoleUrl: env.EXT_CHANGE_ROLE_URL,
  roleByCcUrl: env.EXT_ROLE_BY_CC_URL,
  uploadImage: env.EXT_UPLOAD_IMAGE,
  baseUrl: env.EXT_BASE_URL,
  empCache: env.EXT_EMP_CACHE,
  pharmacyItemUrl: env.EXT_PHARMACY_ITEM_URL,
  masterServiceUrl: env.MASTER_SERVICE_URL,
  inventoryServiceUrl: env.INVENTORY_SERVICE_URL,
  apiTimeout: env.API_TIMEOUT,
} as const;

/* -------------------------------------------------------------------------- */
/* Backward-compatible flat exports (derived from the validated env)          */
/* -------------------------------------------------------------------------- */

export const PORT = env.PORT;
export const DATABASE_URL = env.DATABASE_URL;
export const envMode = env.NODE_ENV;
export const BASE_URL = env.BASE_URL;
export const IS_REDIS = env.IS_REDIS;
export const REDIS_URL = env.REDIS_URL;
export const REDIS_PASSWORD = env.REDIS_PASSWORD;
export const SMTP_HOST = env.SMTP_HOST;
export const SMTP_PORT = env.SMTP_PORT;
export const SMTP_USER = env.SMTP_USER;
export const SMTP_PASSWORD = env.SMTP_PASSWORD;
export const EXT_CONNECTION_TYPE = env.EXT_CONNECTION_TYPE;
export const DOC_DESG_ID = env.DOC_DESG_ID;
export const EXT_LOGIN_URL = env.EXT_LOGIN_URL;
export const EXT_ROLE_PERM_URL = env.EXT_ROLE_PERM_URL;
export const EXT_USER_DETAILS_URL = env.EXT_USER_DETAILS_URL;
export const EXT_CHANGE_ROLE_URL = env.EXT_CHANGE_ROLE_URL;
export const EXT_ROLE_BY_CC_URL = env.EXT_ROLE_BY_CC_URL;
export const API_TIMEOUT = env.API_TIMEOUT;
export const EXT_UPLOAD_IMAGE = env.EXT_UPLOAD_IMAGE;
export const REDIS_PREFIX = env.REDIS_PREFIX;
export const FRONTEND_URLS = toList(env.FRONTEND_URLS);
export const IMAGE_URL = env.IMAGE_URL;
export const LOG_DAYS = env.LOG_DAYS;
export const MASTER_TABLES = ["country", "city", "state"];
export const ENABLED_APPS = toList(env.ENABLED_APPS);
export const NO_OF_LEVELS = env.NO_OF_LEVELS;
export const TOKEN_VERSION = env.TOKEN_VERSION;
export const COOKIE_DOMAIN = env.COOKIE_DOMAIN;

export const JWT_TOKEN = env.JWT_TOKEN;
export const SUPER_ADMIN_ID = env.SUPER_ADMIN_ID;
export const PERMISSION_PREFIX = env.PERMISSION_PREFIX;
export const JWT_SECRET = env.JWT_SECRET;

export const CRON_RETRY_DELAY_MS = 5 * 60 * 1000;
export const CRON_MAX_RETRIES = 3;
export const CRON_IN_PROGRESS_STALE_MS = 10 * 60 * 1000;

// S3 bucket
export const HETZNER_ACCESS_KEY = env.HETZNER_ACCESS_KEY;
export const HETZNER_SECRET_KEY = env.HETZNER_SECRET_KEY;
export const HETZNER_BUCKET = env.HETZNER_BUCKET;
export const HETZNER_REGION = env.HETZNER_REGION;
export const HETZNER_ENDPOINT = env.HETZNER_ENDPOINT;

export const DOC_ROLE_ID = env.DOC_ROLE_ID;
export const EXT_PHARMACY_ITEM_URL = env.EXT_PHARMACY_ITEM_URL;
export const MASTER_SERVICE_URL = env.MASTER_SERVICE_URL;
export const EXT_COLLECTION_CENTER_BY_STAFF = `${MASTER_SERVICE_URL}/api/v1/master/collection-center/staffId`;
export const EXT_COUNTRY_URL = `${MASTER_SERVICE_URL}/api/v1/master/country`;
export const EXT_BASE_URL = env.EXT_BASE_URL;

export const CLIENT_ID = env.CLIENT_ID;
export const EXT_EMP_CACHE = env.EXT_EMP_CACHE;

export const CORE_SERVICE_URL = `${MASTER_SERVICE_URL}/api/v1/core`;

export const CORE_REDIS_PREFIX = env.CORE_REDIS_PREFIX;
export const FRONTEND_URL = env.FRONTEND_URL;
export const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET ?? "";
export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET ?? "";
export const CASH_BANK_GROUPS = toList(env.CASH_BANK_GROUPS);
export const RECEIVABLE_GROUPS = toList(env.RECEIVABLE_GROUPS);
export const PAYABLE_GROUPS = toList(env.PAYABLE_GROUPS);
export const DEFAULT_COMPANY_ID = env.DEFAULT_COMPANY_ID;
export const EXT_CURRENCY_URL = `${MASTER_SERVICE_URL}/api/v1/master/currency`;

export const COMPANY_LOGO_BASE_URL =
  (env.IMAGE_URL || "") + "/hospital_content/logo";

export const INVENTORY_SERVICE_URL = env.INVENTORY_SERVICE_URL;

export const EMAIL_CONFIG = {
  smtpServer: smtpConfig.smtpServer,
  smtpPort: smtpConfig.smtpPort,
  smtpUsername: smtpConfig.smtpUsername,
  smtpPassword: smtpConfig.smtpPassword,
  sslTls: smtpConfig.sslTls,
};
