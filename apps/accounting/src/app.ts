import { Router, type Router as ExpressRouter } from "express";
import cacheRouter from "./routes/cache.route.js";
import express from "express";
import path from "path";
import { commonRouter } from "@/routes/common.route.js";
import { settingsRouter } from "@/routes/settings/settings.route.js";
import { auditConfigRouter } from "@/routes/master/auditConfig.route.js";
import { emailConfigRouter } from "@/routes/master/emailConfig.route.js";
import { locationRouter } from "@/routes/location/location.route.js";
import { uinConfigRouter } from "@/routes/master/uinConfig.route.js";
import { ledgerRouter } from "@/routes/master/ledger.route.js";
import { groupRouter } from "@/routes/master/group.route.js";
import { companyRouter } from "@/routes/company/company.route.js";
import { companyFinancialYearRouter } from "@/routes/master/companyFinancialYear.route.js";
import { voucherRouter } from "@/routes/voucher/voucher.route.js";
import { reportRouter } from "@/routes/report/report.route.js";
import { ledgerBalanceEngineRouter } from "@/routes/report/ledgerBalanceEngine.route.js";
import { accountingIntegrationConfigRoutes } from "@/routes/integrationConfig/accountingIntegrationConfig.route.js";
import { bankReconciliationRouter } from "@/routes/bankReconciliation/bankReconciliation.route.js";

export const accRouter: ExpressRouter = Router();

// Cache routes
accRouter.use("/cache", cacheRouter);
// Common
accRouter.use("/common", commonRouter);
accRouter.use("/master/settings", settingsRouter);
accRouter.use("/audit-config", auditConfigRouter);
accRouter.use("/master/email-config", emailConfigRouter);
// location
accRouter.use("/location", locationRouter);
// Uploads
accRouter.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
accRouter.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Master
accRouter.use("/master/uin-config", uinConfigRouter);
accRouter.use("/master/ledger", ledgerRouter);
accRouter.use("/master/group", groupRouter);

// Company
accRouter.use("/company", companyRouter);
accRouter.use("/company-financial-years", companyFinancialYearRouter);

// Voucher
accRouter.use("/voucher", voucherRouter);

// Report
accRouter.use("/report", reportRouter);

// Ledger Balance
accRouter.use("/ledger-balance", ledgerBalanceEngineRouter);

// Integration Config
accRouter.use("/integration-config", accountingIntegrationConfigRoutes);

// Bank Reconciliation
accRouter.use("/bank-reconcil", bankReconciliationRouter);
