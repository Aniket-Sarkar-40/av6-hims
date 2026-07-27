/**
 * Deterministic env for Vitest. Set before any `@repo/shared` import so Joi
 * config validation succeeds and CLIENT_ID is known for auth-hash tests.
 * dotenv (loaded by shared config) does not override keys already set here.
 */
process.env.NODE_ENV ??= "test";
process.env.JWT_SECRET ??= "test-jwt-secret-do-not-use-in-prod";
process.env.SMTP_PASSWORD ??= "test-smtp-password";
process.env.EMAIL_PASSWORD ??= "test-email-password";
process.env.CLIENT_ID ??= "TEST_CLIENT_ID";
process.env.TOKEN_VERSION ??= "V1";
process.env.PERMISSION_PREFIX ??= "";
process.env.IS_REDIS ??= "false";
process.env.DATABASE_URL ??= "mysql://root:@localhost:3306/test_hims";
