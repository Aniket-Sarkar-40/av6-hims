import { Router, type Router as ExpressRouter } from "express";
import express from "express";
import path from "path";

import cacheRouter from "./routes/cacheRoute/cache.route.js";
import { customerRouter } from "./routes/customer/customer.route.js";
import { distributorRouter } from "./routes/distributor/distributor.route.js";
import emailConfigRouter from "./routes/email/email.route.js";
import featureRouter from "./routes/feature/feature.route.js";
import { gatePassRouter } from "./routes/gatePass/gatePass.route.js";
import { grnRouter } from "./routes/grn/grn.route.js";
import { grnReturnRouter } from "./routes/grn/grnReturn.route.js";
import { insuranceRouter } from "./routes/insurance/insurance.route.js";
import { insurancePaymentSettingsRouter } from "./routes/insurance/insurancePaymentSettings.route.js";
import { patientsInsuranceRouter } from "./routes/insurance/patientInsurance.route.js";
import { patientsRouter } from "./routes/insurance/patients.route.js";
import { itemRouter } from "./routes/item/item.route.js";
import { itemBranchRouter } from "./routes/item/itemBranchMap.route.js";
import { itemDosageRouter } from "./routes/item/itemDosageMap.route.js";
import { itemInstructionRouter } from "./routes/item/itemInstructionMap.route.js";
import { boxSizeRouter } from "./routes/master/boxSize.route.js";
import { branchRouter } from "./routes/master/branch.route.js";
import collectionCenterRouter from "./routes/master/collectionCenter.route.js";
import currencyRouter from "./routes/master/currency.route.js";
import manufactureRouter from "./routes/master/manufacture.route.js";
import medCategoryRouter from "./routes/master/medCategory.route.js";
import medCompoRouter from "./routes/master/medComposition.route.js";
import medDosageRouter from "./routes/master/medDosage.route.js";
import medDrugRouter from "./routes/master/medDrug.route.js";
import medicineDistMapRouter from "./routes/master/medicineDistMap.route.js";
import medInstructionRouter from "./routes/master/medInstruction.route.js";
import medPackageRouter from "./routes/master/medPackage.route.js";
import medTypeRouter from "./routes/master/medType.route.js";
import medUnitRouter from "./routes/master/medUnit.route.js";
import printerSettingsRouter from "./routes/master/printerSettings.route.js";
import settingsRouter from "./routes/master/settings.route.js";
import storage from "./routes/master/storage.route.js";
import { storeRouter } from "./routes/master/store.route.js";
import { uinConfigRouter } from "./routes/master/uinConfig.route.js";
import warehouseRouter from "./routes/master/warehouse.route.js";
import { migrationRouter } from "./routes/migration/migration.route.js";
import { branchOnMonthExpirationRouter } from "./routes/mis/branchOnMonthExpiration.route.js";
import { misBranchRouter } from "./routes/mis/misBranch.route.js";
import { misPurchaseReportRouter } from "./routes/mis/misPurchaseReport.route.js";
import { misSaleRouter } from "./routes/mis/misSale.route.js";
import { misStoreRequisitionRouter } from "./routes/mis/misStoreRequistionReport..route.js";
import { misSupplierPaymentRouter } from "./routes/mis/misSupplierPayment.route.js";
import monthOnMonthExpirationRouter from "./routes/mis/monthOnMonthExpiration.route.js";
import { consultationIcdListRouter } from "./routes/opd/consultationIcdList.route.js";
import { opdListRouter } from "./routes/opd/opdList.route.js";
import { purchaseRouter } from "./routes/purchase/purchase.route.js";
import { storeRequisitionRouter } from "./routes/purchase/storeRequisition.route.js";
import { storeRequisitionReturnRouter } from "./routes/purchase/storeRequisitionReturn.route.js";
import { sellRouter } from "./routes/sell/sell.route.js";
import sellReturnRouter from "./routes/sell/sellReturn.route.js";
import { departmentRouter } from "./routes/staff/department.route.js";
import staffDesignationRouter from "./routes/staff/designation.route.js";
import { doctorRouter } from "./routes/staff/doctor.route.js";
import { employeeRouter } from "./routes/staff/employee.route.js";
import { staffCollectionCenterRouter } from "./routes/staff/staffCollectionCenter.route.js";
import stockAdjustmentRouter from "./routes/stock/stockAdjustment.route.js";
import stockTransferRouter from "./routes/stock/stockTransfer.route.js";
import { autoAlertRouter } from "./routes/master/autoAlert.route.js";
import commonRouter from "./routes/common.route.js";

export const pharmacyRouter: ExpressRouter = Router();

// Cache
pharmacyRouter.use("/cache", cacheRouter);

// Common
pharmacyRouter.use("/common", commonRouter);

// Master
pharmacyRouter.use("/master/med-compo", medCompoRouter);
pharmacyRouter.use("/master/med-unit", medUnitRouter);
pharmacyRouter.use("/master/med-category", medCategoryRouter);
pharmacyRouter.use("/master/med-type", medTypeRouter);
pharmacyRouter.use("/master/med-package", medPackageRouter);
pharmacyRouter.use("/master/med-drug", medDrugRouter);
pharmacyRouter.use("/master/warehouse", warehouseRouter);
pharmacyRouter.use("/master/collection-center", collectionCenterRouter);
pharmacyRouter.use("/master/branch", branchRouter);
pharmacyRouter.use("/master/med-manufacture", manufactureRouter);
pharmacyRouter.use("/master/med-dosage", medDosageRouter);
pharmacyRouter.use("/master/med-inst", medInstructionRouter);
pharmacyRouter.use("/master/store", storeRouter);
pharmacyRouter.use("/master/medicine-dist-map", medicineDistMapRouter);
pharmacyRouter.use("/master/uin-config", uinConfigRouter);
pharmacyRouter.use("/master/settings", settingsRouter);
pharmacyRouter.use("/master/printer-settings", printerSettingsRouter);
pharmacyRouter.use("/master/currency", currencyRouter);
pharmacyRouter.use("/master/storage", storage);
pharmacyRouter.use("/master/box-size", boxSizeRouter);
pharmacyRouter.use("/master/auto-alert", autoAlertRouter);

// Staff
pharmacyRouter.use("/department", departmentRouter);
pharmacyRouter.use("/employee", employeeRouter);
pharmacyRouter.use("/designation", staffDesignationRouter);
pharmacyRouter.use("/doctor", doctorRouter);
pharmacyRouter.use("/staff-collection-center", staffCollectionCenterRouter);

// Purchase
pharmacyRouter.use("/purchase/purchase-order", purchaseRouter);
pharmacyRouter.use("/storeRequisition", storeRequisitionRouter);
pharmacyRouter.use("/storeRequisitionReturn", storeRequisitionReturnRouter);

// Items
pharmacyRouter.use("/item", itemRouter);
pharmacyRouter.use("/item-dosage", itemDosageRouter);
pharmacyRouter.use("/item-instruction", itemInstructionRouter);
pharmacyRouter.use("/item-branch", itemBranchRouter);

// Customer / Income / Expense
pharmacyRouter.use("/customer", customerRouter);

// Distributor
pharmacyRouter.use("/distributor", distributorRouter);

// GRN
pharmacyRouter.use("/grn", grnRouter);
pharmacyRouter.use("/grn-return", grnReturnRouter);

// Stock
pharmacyRouter.use("/stock-transfer", stockTransferRouter);
pharmacyRouter.use("/stock-adjustment", stockAdjustmentRouter);

// Gate Pass
pharmacyRouter.use("/gate-pass", gatePassRouter);

// Sell
pharmacyRouter.use("/sell", sellRouter);
pharmacyRouter.use("/sell-return", sellReturnRouter);

// Patients / Insurance
pharmacyRouter.use("/patients", patientsRouter);
pharmacyRouter.use("/insurance", insuranceRouter);
pharmacyRouter.use("/insurance-payment", insurancePaymentSettingsRouter);
pharmacyRouter.use("/patients-insurance", patientsInsuranceRouter);

// Email
pharmacyRouter.use("/email", emailConfigRouter);

// OPD / Consultation
pharmacyRouter.use("/branch-month-expiration", branchOnMonthExpirationRouter);
pharmacyRouter.use("/consultation-icd-list", consultationIcdListRouter);
pharmacyRouter.use("/opd-list", opdListRouter);

// MIS
pharmacyRouter.use("/mis-branch", misBranchRouter);
pharmacyRouter.use("/mis-sale", misSaleRouter);
pharmacyRouter.use("/mis-purchase-report", misPurchaseReportRouter);
pharmacyRouter.use("/mis-supplier-payment", misSupplierPaymentRouter);
pharmacyRouter.use("/mis/monthOnMonthExpiration", monthOnMonthExpirationRouter);
pharmacyRouter.use("/mis/storeRequisition", misStoreRequisitionRouter);

// Feature / Migration
pharmacyRouter.use("/feature-flag", featureRouter);
pharmacyRouter.use("/migration", migrationRouter);

// Uploads
pharmacyRouter.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
