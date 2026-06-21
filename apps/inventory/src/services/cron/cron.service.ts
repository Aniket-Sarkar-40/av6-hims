import {
  createAutoAlertAuditInDb,
  getAutoAlertEmailByShortCodeFromDb,
  updateAutoAlertAuditInDb,
} from "@/repository/master/autoAlert.repository.js";
import { getEventEmailByEmailType } from "@/repository/master/emailConfig.repository.js";
import {
  fetchExpiredItems,
  fetchExpiringItems,
  fetchReOrderItems,
} from "@/repository/stock/stock.repository.js";
import { featureFlagService } from "@/services/feature/feature.service.js";
import { ExpiredItemsResponse, LowStockResponse } from "@/types/stock/stock.js";
import { sendTemplatedEmail } from "@/utils/email.utils.js";
import {
  ALERT_DELIVERY_METHOD,
  ALERT_MODE,
  ALERT_STATUS,
  EMAIL_TYPE,
  INV_ALERT_TYPE,
} from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { interpolate } from "av6-core-v2";
import ExcelJs from "exceljs";

export const getSummary = (
  items: LowStockResponse[] | ExpiredItemsResponse[]
) => {
  const map = new Map<number, { ccId: number; name: string; total: number }>();

  for (const i of items) {
    if (!map.has(i.ccId)) {
      map.set(i.ccId, { ccId: i.ccId, name: i.collectionCenterName, total: 0 });
    }
    map.get(i.ccId)!.total++;
  }

  return Array.from(map.values());
};

export const cronService = {
  async reOrderAlert(inp: {
    alertMode?: ALERT_MODE;
    runDate?: Date;
    isResend: boolean;
    resendMasterId?: number;
  }) {
    const feature = await featureFlagService.getFeatureFlagByShortCode(
      "RE_ORDER_EMAIL_ALERT"
    );
    if (!feature || feature.isEnabled === false) {
      logger.error("Reorder email alert feature is disabled");
      return false;
    }

    const lowStockItems = await fetchReOrderItems(inp.runDate ?? new Date());
    if (lowStockItems.length === 0) {
      logger.error("No Reorder items found.");
      return false;
    }

    // Fetch email template
    const emailTemplate = await getEventEmailByEmailType(
      EMAIL_TYPE.RE_ORDER_ITEM_ALERT
    );
    if (!emailTemplate) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Re Order Alert Email Template")
      );
    }

    if (emailTemplate && !emailTemplate.emailBody) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Re order Alert Email Body")
      );
    }

    // Fetch recipient mails
    const alertMails = await getAutoAlertEmailByShortCodeFromDb(
      INV_ALERT_TYPE.RE_ORDER_ITEMS
    );
    if (!alertMails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Recipient Emails for Re order Alert")
      );
    }

    const autoAlertAudit = await createAutoAlertAuditInDb({
      runDate: inp.runDate ?? new Date(),
      deliveryMethod: ALERT_DELIVERY_METHOD.EMAIL,
      alertType: INV_ALERT_TYPE.RE_ORDER_ITEMS,
      isResend: inp.isResend,
      resendMasterId: inp.resendMasterId,
      alertMode: inp.alertMode ?? ALERT_MODE.MANUAL,
      recipientId: alertMails.id,
    });

    try {
      const toMails = alertMails.to
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const bccMails = alertMails.bcc
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const ccMails = alertMails.cc
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      emailTemplate.subject = `${emailTemplate.subject} ${
        inp.runDate?.toDateString() ?? new Date().toDateString()
      }`;
      const emailBody = emailTemplate.emailBody!;

      // Extract tbody content
      const tbodyMatch = emailBody.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
      if (!tbodyMatch) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Table Body in email template")
        );
      }

      const tbodyContent = tbodyMatch[1];

      // Extract all <tr> rows
      const trRows = tbodyContent.match(/<tr[\s\S]*?<\/tr>/gi);
      if (!trRows || trRows.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Table row inside table body")
        );
      }

      // Only row in tbody is the template → trRows[0]
      const rowTemplate = trRows[0].trim();

      // Generate summary
      const summery = getSummary(lowStockItems);

      // Build all dynamic rows
      const rows = summery
        .map((item) =>
          interpolate(rowTemplate, {
            collectionCenterName: item.name,
            count: item.total,
          })
        )
        .join("");

      // Replace tbody content with generated rows
      emailTemplate.emailBody = emailBody.replace(
        /<tbody[^>]*>[\s\S]*?<\/tbody>/i,
        `<tbody>
        ${rows}
      </tbody>`
      );

      const wb = new ExcelJs.Workbook();
      const ws = wb.addWorksheet("Re order Items");

      const attribute = [
        "Item Name",
        "Branch/Warehouse",
        "Re-Order Stock Quantity",
        "Available Quantity",
      ];
      const attributeRow = ws.addRow(attribute);
      attributeRow.font = { bold: true };

      lowStockItems.forEach((i) => {
        ws.addRow([
          i.itemName,
          i.collectionCenterName,
          i.minStockQty,
          i.availableQty,
        ]);
      });

      /* Auto size the columns */
      ws.columns.forEach((col) => {
        let max = 10;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
        col.width = max + 2;
      });
      const excelBuffer = Buffer.from(await wb.xlsx.writeBuffer());

      await sendTemplatedEmail({
        template: emailTemplate,
        to: toMails,
        cc: ccMails,
        bcc: bccMails,
        variables: {},
        attachments: [
          {
            filename: `re_order_stock_items_${
              inp.runDate?.toDateString() ?? new Date().toDateString()
            }.xlsx`,
            content: excelBuffer,
          },
        ],
      });

      const updateAudit = await updateAutoAlertAuditInDb({
        id: autoAlertAudit.id,
        status: ALERT_STATUS.SENT,
        successDate: new Date(),
        recipientId: alertMails.id,
      });

      if (inp.resendMasterId) {
        await updateAutoAlertAuditInDb({
          id: inp.resendMasterId,
          status: ALERT_STATUS.SENT,
          successDate: updateAudit.successDate,
          recipientId: alertMails.id,
        });
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error";

      await updateAutoAlertAuditInDb({
        id: autoAlertAudit.id,
        status: ALERT_STATUS.FAILED,
        errorMsg: errorMessage,
      });
      return false;
    }
  },

  async expiredItemAlert(inp: {
    alertMode?: ALERT_MODE;
    runDate?: Date;
    isResend: boolean;
    resendMasterId?: number;
  }) {
    const feature = await featureFlagService.getFeatureFlagByShortCode(
      "EXPIRED_ITEM_EMAIL_ALERT"
    );
    if (!feature || feature.isEnabled === false) {
      logger.error("Expired item alert feature is disabled");
      return false;
    }
    const expiredItems = await fetchExpiredItems(inp.runDate ?? new Date());
    if (expiredItems.length === 0) {
      logger.error("No expired items found.");
      return false;
    }

    const autoAlertAudit = await createAutoAlertAuditInDb({
      runDate: inp.runDate ?? new Date(),
      deliveryMethod: ALERT_DELIVERY_METHOD.EMAIL,
      alertType: INV_ALERT_TYPE.EXPIRED_ITEMS,
      isResend: inp.isResend,
      resendMasterId: inp.resendMasterId,
      alertMode: inp.alertMode ?? ALERT_MODE.MANUAL,
    });

    try {
      const emailTemplate = await getEventEmailByEmailType(
        EMAIL_TYPE.EXPIRED_ITEM_ALERT
      );
      if (!emailTemplate) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Expired Item Alert Email template."
          )
        );
      }

      if (emailTemplate && !emailTemplate.emailBody) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Expired Item Alert Email Body")
        );
      }
      // Fetch recipient mails
      const alertMails = await getAutoAlertEmailByShortCodeFromDb(
        INV_ALERT_TYPE.EXPIRED_ITEMS
      );
      if (!alertMails) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Recipient Mails for expired item alert"
          )
        );
      }
      const toMails = alertMails.to
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const bccMails = alertMails.bcc
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const ccMails = alertMails.cc
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      emailTemplate.subject = `${emailTemplate.subject} ${
        inp.runDate?.toDateString() ?? new Date().toDateString()
      }`;
      const emailBody = emailTemplate.emailBody!;

      // Extract tbody content
      const tbodyMatch = emailBody.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
      if (!tbodyMatch) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Table Body in email template")
        );
      }

      const tbodyContent = tbodyMatch[1];

      // Extract all <tr> rows
      const trRows = tbodyContent.match(/<tr[\s\S]*?<\/tr>/gi);
      if (!trRows || trRows.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Table row inside table body")
        );
      }

      // Only row in tbody is the template → trRows[0]
      const rowTemplate = trRows[0].trim();

      // Generate summary
      const summery = getSummary(expiredItems);

      // Build all dynamic rows
      const rows = summery
        .map((item) =>
          interpolate(rowTemplate, {
            collectionCenterName: item.name,
            count: item.total,
          })
        )
        .join("");

      // Replace tbody content with generated rows
      emailTemplate.emailBody = emailBody.replace(
        /<tbody[^>]*>[\s\S]*?<\/tbody>/i,
        `<tbody>
          ${rows}
        </tbody>`
      );

      const wb = new ExcelJs.Workbook();
      const ws = wb.addWorksheet("Expired Items");

      const attribute = [
        "Item Name",
        "Branch/Warehouse",
        "Quantity",
        "Batch No",
        "Expiry Date",
        "Foc",
      ];
      const attributeRow = ws.addRow(attribute);
      attributeRow.font = { bold: true };

      expiredItems.forEach((i) => {
        ws.addRow([
          i.itemName,
          i.collectionCenterName,
          i.quantity,
          i.batchNo,
          i.expiryDate.toDateString(),
          i.isFoc,
        ]);
      });

      /* Auto size the columns */
      ws.columns.forEach((col) => {
        let max = 10;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
        col.width = max + 2;
      });

      // Convert into nuffer
      const excelBuffer = Buffer.from(await wb.xlsx.writeBuffer());

      await sendTemplatedEmail({
        template: emailTemplate,
        to: toMails,
        cc: ccMails,
        bcc: bccMails,
        variables: {},
        attachments: [
          {
            filename: `expired_items_${
              inp.runDate?.toDateString() ?? new Date().toDateString()
            }.xlsx`,
            content: excelBuffer,
          },
        ],
      });

      const updateAudit = await updateAutoAlertAuditInDb({
        id: autoAlertAudit.id,
        status: ALERT_STATUS.SENT,
        successDate: new Date(),
        recipientId: alertMails.id,
      });

      if (inp.resendMasterId) {
        await updateAutoAlertAuditInDb({
          id: inp.resendMasterId,
          status: ALERT_STATUS.SENT,
          successDate: updateAudit.successDate,
          recipientId: alertMails.id,
        });
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error";

      await updateAutoAlertAuditInDb({
        id: autoAlertAudit.id,
        status: ALERT_STATUS.FAILED,
        errorMsg: errorMessage,
      });
      return false;
    }
  },

  async expiringItemAlert(inp: {
    alertMode?: ALERT_MODE;
    runDate?: Date;
    isResend: boolean;
    resendMasterId?: number;
  }) {
    const feature = await featureFlagService.getFeatureFlagByShortCode(
      "EXPIRING_SOON_ITEM_EMAIL_ALERT"
    );
    if (!feature || feature.isEnabled === false) {
      logger.error("Expiring item email alert feature is disabled");
      return false;
    }
    const response = await fetchExpiringItems(inp.runDate ?? new Date());
    const { data, expiryInMonth } = response;

    if (data.length === 0) {
      logger.error(`No expiring items found in ${expiryInMonth} months.`);
      return false;
    }

    const autoAlertAudit = await createAutoAlertAuditInDb({
      runDate: inp.runDate ?? new Date(),
      deliveryMethod: ALERT_DELIVERY_METHOD.EMAIL,
      alertType: INV_ALERT_TYPE.EXPIRING_ITEMS,
      isResend: inp.isResend,
      resendMasterId: inp.resendMasterId,
      alertMode: inp.alertMode ?? ALERT_MODE.MANUAL,
    });

    try {
      const emailTemplate = await getEventEmailByEmailType(
        EMAIL_TYPE.EXPIRING_ITEM_ALERT
      );
      if (!emailTemplate) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Expiring item alert Email template."
          )
        );
      }
      if (emailTemplate && !emailTemplate.emailBody) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Expiring item alert Email Body")
        );
      }
      // Fetch recipient mails
      const alertMails = await getAutoAlertEmailByShortCodeFromDb(
        INV_ALERT_TYPE.EXPIRING_ITEMS
      );
      if (!alertMails) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Recipient Mails for expiring item alert"
          )
        );
      }

      const toMails = alertMails.to
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const bccMails = alertMails.bcc
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const ccMails = alertMails.cc
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      emailTemplate.subject = `${emailTemplate.subject} ${
        inp.runDate?.toDateString() ?? new Date().toDateString()
      }`;
      const emailBody = emailTemplate.emailBody!;

      // Extract tbody content
      const tbodyMatch = emailBody.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
      if (!tbodyMatch) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Table Body in email template")
        );
      }

      const tbodyContent = tbodyMatch[1];

      // Extract all <tr> rows
      const trRows = tbodyContent.match(/<tr[\s\S]*?<\/tr>/gi);
      if (!trRows || trRows.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Table row inside table body")
        );
      }

      // Only row in tbody is the template → trRows[0]
      const rowTemplate = trRows[0].trim();

      // Generate summary
      const summery = getSummary(data);

      // Build all dynamic rows
      const rows = summery
        .map((item) =>
          interpolate(rowTemplate, {
            collectionCenterName: item.name,
            count: item.total,
          })
        )
        .join("");

      // Replace tbody content with generated rows
      emailTemplate.emailBody = emailBody.replace(
        /<tbody[^>]*>[\s\S]*?<\/tbody>/i,
        `<tbody>
          ${rows}
        </tbody>`
      );

      const wb = new ExcelJs.Workbook();
      const ws = wb.addWorksheet("Expiring Items");

      const attribute = [
        "Item Name",
        "Branch/Warehouse",
        "Quantity",
        "Batch No",
        "Expiry Date",
        "Foc",
      ];
      const attributeRow = ws.addRow(attribute);
      attributeRow.font = { bold: true };

      data.forEach((i) => {
        ws.addRow([
          i.itemName,
          i.collectionCenterName,
          i.quantity,
          i.batchNo,
          i.expiryDate.toDateString(),
          i.isFoc,
        ]);
      });

      /* Auto size the columns */
      ws.columns.forEach((col) => {
        let max = 10;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
        col.width = max + 2;
      });

      // Convert into nuffer
      const excelBuffer = Buffer.from(await wb.xlsx.writeBuffer());

      await sendTemplatedEmail({
        template: emailTemplate,
        to: toMails,
        cc: ccMails,
        bcc: bccMails,
        variables: {
          expiry: expiryInMonth,
        },
        attachments: [
          {
            filename: `expiring_items_${
              inp.runDate?.toDateString() ?? new Date().toDateString()
            }.xlsx`,
            content: excelBuffer,
          },
        ],
      });

      const updateAudit = await updateAutoAlertAuditInDb({
        id: autoAlertAudit.id,
        status: ALERT_STATUS.SENT,
        successDate: new Date(),
        recipientId: alertMails.id,
      });

      if (inp.resendMasterId) {
        await updateAutoAlertAuditInDb({
          id: inp.resendMasterId,
          status: ALERT_STATUS.SENT,
          successDate: updateAudit.successDate,
          recipientId: alertMails.id,
        });
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error";

      await updateAutoAlertAuditInDb({
        id: autoAlertAudit.id,
        status: ALERT_STATUS.FAILED,
        errorMsg: errorMessage,
      });

      return false;
    }
  },
};
