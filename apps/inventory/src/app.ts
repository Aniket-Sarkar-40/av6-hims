import express, { Router, type Router as ExpressRouter } from "express";
import path from "path";
import { cacheRouter } from "./routes/cache.route.js";
import { commonRouter } from "./routes/common.route.js";
import { consumptionRouter } from "./routes/consumption/consumption.route.js";
import { grnRouter } from "./routes/grn/grn.route.js";
import { grnReturnRouter } from "./routes/grn/grnReturn.route.js";
import { itemStockRouter } from "./routes/itemStock/itemStock.route.js";
import { itemSupplierMapRouter } from "./routes/itemSupplierMap/itemSupplierMap.route.js";
import { locationRouter } from "./routes/location/location.route.js";
import { branchRouter } from "./routes/master/branch.route.js";
import currencyRouter from "./routes/master/currency.route.js";
import { itemCategoryRouter } from "./routes/master/itemCategory.route.js";
import { itemMasterRouter } from "./routes/master/itemMaster.route.js";
import { itemStoreRouter } from "./routes/master/itemStore.route.js";
import { itemSupplierRouter } from "./routes/master/itemSupplier.route.js";
import { settingsRouter } from "./routes/master/settings.route.js";
import { storageRouter } from "./routes/master/storage.route.js";
import { taxDetailsRouter } from "./routes/master/taxDetails.route.js";
import { uinConfigRouter } from "./routes/master/uinConfig.route.js";
import { unitMasterRouter } from "./routes/master/unitMaster.route.js";
import { warehouseRouter } from "./routes/master/warehouse.route.js";
import { purchaseRouter } from "./routes/purchase/purchase.route.js";
import { storeRequisitionRouter } from "./routes/purchase/storeRequisition.route.js";
import { stockAdjustmentRouter } from "./routes/stock/stockAdjustment.route.js";
import stockTransferRouter from "@/routes/stock/stockTransfer.route.js";
import { branchRequisitionRouter } from "@/routes/purchase/branchRequisition.route.js";
import { storeRequisitionReturnRouter } from "@/routes/purchase/storeRequisitionReturn.route.js";
import { branchRequisitionReturnRouter } from "@/routes/purchase/branchRequisitionReturn.route.js";
import { loadSchemaPrecisionSettings } from "@/middlewares/schemaPrecision.middleware.js";

export const inventoryRouter: ExpressRouter = Router();

inventoryRouter.use(loadSchemaPrecisionSettings);

//master
inventoryRouter.use("/cache", cacheRouter);
inventoryRouter.use("/master/item-category", itemCategoryRouter);
inventoryRouter.use("/master/item-store", itemStoreRouter);
inventoryRouter.use("/master/item-unit", unitMasterRouter);
inventoryRouter.use("/common", commonRouter);
inventoryRouter.use("/master/item-supplier", itemSupplierRouter);

inventoryRouter.use("/master/uin-config", uinConfigRouter);
inventoryRouter.use("/master/item-master", itemMasterRouter);
inventoryRouter.use("/master/settings", settingsRouter);
inventoryRouter.use("/master/item-supplier-mapping", itemSupplierMapRouter);
inventoryRouter.use("/master/branch", branchRouter);
inventoryRouter.use("/master/currency", currencyRouter);
inventoryRouter.use("/item-stock", itemStockRouter);
inventoryRouter.use("/master/warehouse", warehouseRouter);
inventoryRouter.use("/grn", grnRouter);
inventoryRouter.use("/grn-return", grnReturnRouter);
inventoryRouter.use("/location", locationRouter);
inventoryRouter.use("/master/storage", storageRouter);
inventoryRouter.use("/master/tax-details", taxDetailsRouter);
//uploads
inventoryRouter.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Purchase Order
inventoryRouter.use("/purchase/purchase-order", purchaseRouter);

// Store Requisition
inventoryRouter.use("/store-requisition", storeRequisitionRouter);

//Stock Adjustment
inventoryRouter.use("/stock-adjustment", stockAdjustmentRouter);

// Consumption
inventoryRouter.use("/consumption", consumptionRouter);

inventoryRouter.use("/stock-transfer", stockTransferRouter);

// Branch Requisition
inventoryRouter.use("/branch-requisition", branchRequisitionRouter);
inventoryRouter.use(
  "/branch-requisition-return",
  branchRequisitionReturnRouter
);

//Store requisition return
inventoryRouter.use("/store-requisition-return", storeRequisitionReturnRouter);
