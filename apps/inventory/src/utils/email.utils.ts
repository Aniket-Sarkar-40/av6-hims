import { getSettingsInDb } from "@/repository/master/settings.repository.js";
import { eventEmailService } from "@/services/master/emailConfig.service.js";
import { settingsService } from "@/services/master/settings.service.js";
import { EmailConfig, EventEmail } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { EMAIL_CONFIG } from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { interpolate } from "av6-core-v2";
import nodemailer, { SendMailOptions } from "nodemailer";
import hbs, {
  NodemailerExpressHandlebarsOptions,
} from "nodemailer-express-handlebars";

import path from "path";

const templatesDir = path.resolve(
  process.cwd(),
  "src",
  "utils",
  "templates",
  "emails"
);

interface TemplateMailOptions<T> extends SendMailOptions {
  template: string;
  context: T;
}

export const sendEmail = async <T>(options: TemplateMailOptions<T>) => {
  const settings = await settingsService.getSettings();

  if (!settings || !settings.isEmail) {
    logger.info("Email flag is off!");
    return;
  }
  const handlebarOptions: NodemailerExpressHandlebarsOptions = {
    viewEngine: {
      extname: ".handlebars", // Extension name
      partialsDir: path.resolve(templatesDir, "../templates/email/"),
      defaultLayout: "",
    },
    viewPath: path.resolve(templatesDir, "../templates/email/"),
    extName: ".handlebars",
  };

  const emailConfig = await eventEmailService.getEmailConfig();

  const transporter = nodemailer.createTransport({
    // @ts-expect-error: Type definitions are missing for the 'pool' option
    pool: true,
    host: emailConfig.smtpServer,
    port: emailConfig.smtpPort,
    secure: true,
    auth: {
      user: emailConfig.smtpUsername,
      pass: emailConfig.smtpPassword,
    },
  });

  if (
    !emailConfig.smtpServer ||
    !emailConfig.smtpUsername ||
    !emailConfig.smtpPassword ||
    !emailConfig.smtpPort
  ) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Email Config")
    );
  }

  transporter.use("compile", hbs(handlebarOptions));

  await transporter.sendMail({ from: emailConfig.smtpUsername, ...options });
};

export async function sendTemplatedEmail(opts: {
  template: EventEmail;
  to: string[];
  cc?: string[];
  bcc?: string[];
  variables: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
    cid?: string;
  }>;
  isFromEmailConfig?: boolean;
}) {
  const settings = await settingsService.getSettings();
  let isEmailEnabled = false;
  const isFromEmailConfig = opts.isFromEmailConfig ?? true;
  if (settings) {
    isEmailEnabled = settings.isEmail;
  } else {
    const settings = await getSettingsInDb();
    if (settings) isEmailEnabled = settings.isEmail;
  }

  if (!isEmailEnabled) {
    logger.info("Email flag is off!");
    return;
  }

  const { template, to, cc = [], bcc = [], variables, attachments = [] } = opts;

  const htmlToSend = template.emailBody
    ? interpolate(template.emailBody, variables)
    : "";

  let emailConfig: Pick<
    EmailConfig,
    "smtpServer" | "smtpPort" | "smtpUsername" | "smtpPassword" | "sslTls"
  > | null = null;
  if (isFromEmailConfig) {
    emailConfig = await eventEmailService.getEmailConfig();
  } else {
    emailConfig = {
      smtpServer: EMAIL_CONFIG.smtpServer,
      smtpPort: EMAIL_CONFIG.smtpPort.toString(),
      smtpUsername: EMAIL_CONFIG.smtpUsername,
      smtpPassword: EMAIL_CONFIG.smtpPassword,
      sslTls: EMAIL_CONFIG.sslTls,
    };
  }

  const transporter = nodemailer.createTransport({
    // @ts-expect-error: Type definitions are missing for the 'pool' option
    pool: true,
    host: emailConfig.smtpServer,
    port: emailConfig.smtpPort,
    secure: true,
    auth: {
      user: emailConfig.smtpUsername,
      pass: emailConfig.smtpPassword,
    },
  });

  if (
    !emailConfig.smtpServer ||
    !emailConfig.smtpUsername ||
    !emailConfig.smtpPassword ||
    !emailConfig.smtpPort
  ) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Email Config")
    );
  }

  // Send mail
  await transporter.sendMail({
    from: emailConfig.smtpUsername,
    to,
    cc,
    bcc,
    subject: template.subject,
    html: htmlToSend,
    attachments,
  });
}
