import { Router, type Router as ExpressRouter } from "express";
import authRouter from "./routes/auth.route.js";
import commonRouter from "./routes/common.route.js";
import { pdfTemplateRouter } from "./routes/pdf/pdfTemplate.route.js";
import countryRouter from "./routes/master/country.route.js";
import stateRouter from "./routes/master/state.route.js";
import cityRouter from "./routes/master/city.route.js";
import cacheRouter from "./routes/cacheRoute/cache.route.js";
import countryCodeRouter from "./routes/master/countryCode.route.js";
import collectionCenterRouter from "./routes/master/collectionCenter.route.js";
import departmentRouter from "./routes/staff/department.route.js";
import staffDesignationRouter from "./routes/staff/designation.route.js";
import doctorRouter from "./routes/staff/doctor.route.js";
import employeeRouter from "./routes/staff/employee.route.js";
import currencyRouter from "./routes/master/currency.route.js";
import staffCollectionCenterRouter from "./routes/staff/staffCollectionCenter.route.js";
import { uinConfigRouter } from "./routes/master/uinConfig.route.js";
import eventRecipientRuleRouter from "./routes/event/eventRecipientRule.route.js";
import serviceEventRouter from "./routes/event/serviceEvent.route.js";
import eventConfigRouter from "./routes/event/eventConfig.route.js";
import templateRouter from "./routes/event/template.route.js";
import { registerPharmacyApprovalCallbacks } from "@/modules/callbacks/approvalCallback.js";
import { eventBus } from "@/events/eventBus.js";
import { registerApprovalEmailListeners } from "@/modules/notifications/approvalEmailListener.js";
import { incomeHeadRouter } from "@/routes/master/incomeHead.route.js";

registerApprovalEmailListeners(eventBus); // notifications
registerPharmacyApprovalCallbacks(); // stock updates

export const coreRouter: ExpressRouter = Router();

// auth
coreRouter.use("/auth", authRouter);

// common
coreRouter.use("/common", commonRouter);

// pdf template
coreRouter.use("/pdf-template", pdfTemplateRouter);

//master

coreRouter.use("/master/country", countryRouter);
coreRouter.use("/master/state", stateRouter);
coreRouter.use("/master/city", cityRouter);
coreRouter.use("/master/uin-config", uinConfigRouter);
coreRouter.use("/cache", cacheRouter);
coreRouter.use("/master/country-code", countryCodeRouter);
coreRouter.use("/master/collection-center", collectionCenterRouter);
coreRouter.use("/master/department", departmentRouter);
coreRouter.use("/master/staff-designation", staffDesignationRouter);
coreRouter.use("/master/doctor", doctorRouter);
coreRouter.use("/master/employee", employeeRouter);
coreRouter.use("/master/currency", currencyRouter);
coreRouter.use("/staff-collection-center", staffCollectionCenterRouter);
coreRouter.use("/event/service-event", serviceEventRouter);
coreRouter.use("/event/event-config", eventConfigRouter);
coreRouter.use("/event/template", templateRouter);
coreRouter.use("/event/rule", eventRecipientRuleRouter);
coreRouter.use("/master/income-head", incomeHeadRouter);
