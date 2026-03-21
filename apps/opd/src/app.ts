import { Router, type Router as ExpressRouter } from "express";
import cacheRouter from "./routes/cache.route.js";
import express from "express";
import path from "path";
import { locationRouter } from "./routes/location/location.route.js";
import { commonRouter } from "./routes/common.route.js";
import { settingsRouter } from "./routes/master/settings.route.js";
import { uinConfigRouter } from "./routes/master/uinConfig.route.js";
import { opdDepartmentRouter } from "./routes/master/opdDepartment.route.js";
import { opdDepartmentPrefixRouter } from "./routes/master/opdDepartmentPrefix.route.js";
import { consultationNotesRouter } from "./routes/master/consultationNotes.route.js";
import { consultationNotesMappingRouter } from "./routes/master/consultationNotesMapping.route.js";
import { chipsButtonMappingRouter } from "./routes/master/chipsButtonMapping.routes.js";
import { icdTenRouter } from "./routes/master/icdTen.routes.js";
import { medicineTabRouter } from "./routes/appointment/medicineTab.route.js";
import { medicineTabDetailsRouter } from "./routes/appointment/medicineTabDetails.route.js";
import { procedureRouter } from "./routes/master/procedure.route.js";
import { generalBillItemRouter } from "./routes/master/generalBillItem.route.js";
import { generalBillPricingRouter } from "./routes/master/generalBillPricing.route.js";
import { doctorRouter } from "./routes/doctor/doctor.route.js";
import { appointmentRouter } from "./routes/appointment/appointment.route.js";
import { patientsRouter } from "./routes/patient/patient.route.js";
import { patientsInsuranceRouter } from "./routes/insurance/patientInsurance.route.js";
import { timeSlotRouter } from "./routes/timeSlot/timeSlot.route.js";
import { clinicalHistoryRouter } from "./routes/appointment/clinicalHistory.route.js";
import { referToDoctorRouter } from "./routes/appointment/referToDoctor.route.js";
import { followUpRouter } from "./routes/appointment/followUp.route.js";
import { patientConsultationRouter } from "./routes/appointment/patientConsultation.route.js";
import { consultationComplaintsRouter } from "./routes/appointment/consultationComplaints.route.js";
import { patientAdviceDetailsRouter } from "./routes/appointment/patientAdviceDetails.route.js";
import { patientProcedureRouter } from "./routes/appointment/patientProcedure.route.js";
import { generalBillingRouter } from "./routes/appointment/generalBilling.route.js";
import { consultationICDTenListRouter } from "./routes/appointment/consultationICDTenList.route.js";
import { patientMedicineRouter } from "./routes/appointment/patientMedicine.route.js";
import { documentRouter } from "./routes/appointment/document.route.js";
import { investigationRouter } from "./routes/appointment/investigation.route.js";
import { pathologyMasterRouter } from "./routes/pathology/pathologyMaster.route.js";
import { insuranceRouter } from "./routes/insurance/insurance.route.js";
import { paymentRouter } from "./routes/payment/payment.route.js";
import { consultationRouter } from "./routes/appointment/consultation.route.js";

export const opdRouter: ExpressRouter = Router();

// Cache routes
opdRouter.use("/cache", cacheRouter);
// Location
opdRouter.use("/location", locationRouter);
// Common
opdRouter.use("/common", commonRouter);
// Uploads
opdRouter.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Master
opdRouter.use("/master/settings", settingsRouter);
opdRouter.use("/master/uin-config", uinConfigRouter);
opdRouter.use("/master/opd-department", opdDepartmentRouter);
opdRouter.use("/master/opd-department-prefix", opdDepartmentPrefixRouter);
opdRouter.use("/master/consultation-notes", consultationNotesRouter);
opdRouter.use(
  "/master/consultation-notes-mapping",
  consultationNotesMappingRouter,
);
opdRouter.use("/master/chips-button-mapping", chipsButtonMappingRouter);
opdRouter.use("/master/icd-ten", icdTenRouter);
opdRouter.use("/master/med-tab", medicineTabRouter);
opdRouter.use("/master/med-tab-details", medicineTabDetailsRouter);
opdRouter.use("/master/procedure", procedureRouter);
opdRouter.use("/master/general-bill-item", generalBillItemRouter);
opdRouter.use("/master/general-bill-pricing", generalBillPricingRouter);

// Patient
opdRouter.use("/patients", patientsRouter);
// Doctor
opdRouter.use("/doctor", doctorRouter);

// Appointment
opdRouter.use("/appointment", appointmentRouter);
opdRouter.use("/appointment/patient-insurance", patientsInsuranceRouter);
opdRouter.use("/time-slot", timeSlotRouter);

// Appointment Detail Tabs
opdRouter.use("/appointment/clinical-history", clinicalHistoryRouter);
opdRouter.use("/appointment/refer-to-doctor", referToDoctorRouter);
opdRouter.use("/appointment/follow-up", followUpRouter);
opdRouter.use("/appointment/patient-consultation", patientConsultationRouter);
opdRouter.use(
  "/appointment/consultation-complaint",
  consultationComplaintsRouter,
);
opdRouter.use(
  "/appointment/patient-advice-details",
  patientAdviceDetailsRouter,
);
opdRouter.use("/appointment/patient-procedure", patientProcedureRouter);
opdRouter.use("/appointment/general-billing", generalBillingRouter);

//consultation-icd-ten-list
opdRouter.use(
  "/appointment/consultation-icd-ten-list",
  consultationICDTenListRouter,
);
opdRouter.use("/appointment/patient-medicine", patientMedicineRouter);
opdRouter.use("/appointment/consultation", consultationRouter);
opdRouter.use("/appointment/documents", documentRouter);
opdRouter.use("/appointment/investigation", investigationRouter);

// Pathology
opdRouter.use("/pathology/pathology-master", pathologyMasterRouter);

opdRouter.use("/insurance", insuranceRouter);

// Payment
opdRouter.use("/payment", paymentRouter);
