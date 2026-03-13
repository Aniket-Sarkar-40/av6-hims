import { PdfVarKey } from "@/enums/pdfVariable.enum.js";
import {
  LineItem,
  TransactionItem,
  VariableContract,
} from "@/types/pdf/pdfVariables.type.js";

const fmt = (n?: number) => (typeof n === "number" ? n.toFixed(2) : "");

export const VARIABLE_CONTRACTS: Record<PdfVarKey, VariableContract> = {
  // --- Header / master ---
  [PdfVarKey.WATER_MARK]: {
    key: PdfVarKey.WATER_MARK,
    keyType: "key-value",
    position: "Header",
    resolve: (ctx) => ctx.waterMark ?? "",
  },
  [PdfVarKey.COMPANY_NAME]: {
    key: PdfVarKey.COMPANY_NAME,
    keyType: "key-value",
    position: "Header",
    resolve: (ctx) => ctx.companyName,
  },
  [PdfVarKey.CC_ADDRESS_LINE_1]: {
    key: PdfVarKey.CC_ADDRESS_LINE_1,
    keyType: "key-value",
    position: "Header",
    resolve: (ctx) => ctx.ccAddressLine1,
  },
  [PdfVarKey.CC_ADDRESS_LINE_2]: {
    key: PdfVarKey.CC_ADDRESS_LINE_2,
    keyType: "key-value",
    position: "Header",
    resolve: (ctx) => ctx.ccAddressLine2 ?? "",
  },
  [PdfVarKey.CC_PHONE_1]: {
    key: PdfVarKey.CC_PHONE_1,
    keyType: "key-value",
    position: "Header",
    resolve: (ctx) => ctx.ccPhone1 ?? "",
  },
  [PdfVarKey.CC_PHONE_2]: {
    key: PdfVarKey.CC_PHONE_2,
    keyType: "key-value",
    position: "Header",
    resolve: (ctx) => ctx.ccPhone2 ?? "",
  },
  [PdfVarKey.CC_EMAIL]: {
    key: PdfVarKey.CC_EMAIL,
    keyType: "key-value",
    position: "Header",
    resolve: (ctx) => ctx.ccEmail ?? "",
  },

  // --- Patient / summary ---
  [PdfVarKey.TITLE]: {
    key: PdfVarKey.TITLE,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.title ?? "",
  },
  [PdfVarKey.NAME]: {
    key: PdfVarKey.NAME,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.name,
  },
  [PdfVarKey.AGE]: {
    key: PdfVarKey.AGE,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.age ?? "",
  },
  [PdfVarKey.SEX]: {
    key: PdfVarKey.SEX,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.sex ?? "",
  },
  [PdfVarKey.REF_NO]: {
    key: PdfVarKey.REF_NO,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.refNo ?? "",
  },
  [PdfVarKey.CONTACT_NO]: {
    key: PdfVarKey.CONTACT_NO,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.contactNo ?? "",
  },
  [PdfVarKey.EMAIL]: {
    key: PdfVarKey.EMAIL,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.email ?? "",
  },
  [PdfVarKey.ADDRESS]: {
    key: PdfVarKey.ADDRESS,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.address ?? "",
  },
  [PdfVarKey.PATIENT_HISTORY]: {
    key: PdfVarKey.PATIENT_HISTORY,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.patientHistory ?? "",
  },
  [PdfVarKey.PATIENT_ID]: {
    key: PdfVarKey.PATIENT_ID,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.patientId ?? "",
  },
  [PdfVarKey.VISIT_NO]: {
    key: PdfVarKey.VISIT_NO,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.visitNo ?? "",
  },
  [PdfVarKey.DATE]: {
    key: PdfVarKey.DATE,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.date ?? "",
  },
  [PdfVarKey.TIME]: {
    key: PdfVarKey.TIME,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.time ?? "",
  },
  [PdfVarKey.VISIT_TYPE]: {
    key: PdfVarKey.VISIT_TYPE,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.visitType ?? "",
  },
  [PdfVarKey.DELIVERY_MODE]: {
    key: PdfVarKey.DELIVERY_MODE,
    keyType: "key-value",
    position: "Summary",
    resolve: (ctx) => ctx.deliveryMode ?? "",
  },

  // --- Table (lineItems) – per-row keys ---
  [PdfVarKey.SL_NO]: {
    key: PdfVarKey.SL_NO,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (_row: LineItem, index) => index + 1,
  },
  [PdfVarKey.TABLE_DOCTOR]: {
    key: PdfVarKey.TABLE_DOCTOR,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => row.doctorName,
  },
  [PdfVarKey.DATE_TIME]: {
    key: PdfVarKey.DATE_TIME,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => row.dateTime,
  },
  [PdfVarKey.ITEM_NAME]: {
    key: PdfVarKey.ITEM_NAME,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => row.itemName,
  },
  [PdfVarKey.BATCH]: {
    key: PdfVarKey.BATCH,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => row.batch ?? "",
  },
  [PdfVarKey.EXP_DATE]: {
    key: PdfVarKey.EXP_DATE,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => row.expDate ?? "",
  },
  [PdfVarKey.BASE_RATE]: {
    key: PdfVarKey.BASE_RATE,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.baseRate),
  },
  [PdfVarKey.QUANTITY]: {
    key: PdfVarKey.QUANTITY,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => row.quantity,
  },
  [PdfVarKey.TAX]: {
    key: PdfVarKey.TAX,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.tax),
  },
  [PdfVarKey.DISCOUNT]: {
    key: PdfVarKey.DISCOUNT,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.discount),
  },
  [PdfVarKey.CO_PAY]: {
    key: PdfVarKey.CO_PAY,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.coPay),
  },
  [PdfVarKey.VIP]: {
    key: PdfVarKey.VIP,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.vip),
  },
  [PdfVarKey.NET_AMOUNT]: {
    key: PdfVarKey.NET_AMOUNT,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.netAmount),
  },
  [PdfVarKey.OTHER_CHARGE]: {
    key: PdfVarKey.OTHER_CHARGE,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.otherCharge),
  },
  [PdfVarKey.GROSS_AMOUNT]: {
    key: PdfVarKey.GROSS_AMOUNT,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.grossAmount),
  },
  [PdfVarKey.SUB_TOTAL]: {
    key: PdfVarKey.SUB_TOTAL,
    keyType: "array",
    position: "Table",
    source: "lineItems",
    resolveRow: (row: LineItem) => fmt(row.subTotal),
  },

  // --- Amount summary (scalar) ---
  [PdfVarKey.TOTAL_GROSS]: {
    key: PdfVarKey.TOTAL_GROSS,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.totalGross),
  },
  [PdfVarKey.TOTAL_NET]: {
    key: PdfVarKey.TOTAL_NET,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.totalNet),
  },
  [PdfVarKey.TOTAL_DISCOUNT]: {
    key: PdfVarKey.TOTAL_DISCOUNT,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.totalDiscount),
  },
  [PdfVarKey.TOTAL_TAX]: {
    key: PdfVarKey.TOTAL_TAX,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.totalTax),
  },
  [PdfVarKey.TOTAL_PAID]: {
    key: PdfVarKey.TOTAL_PAID,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.totalPaid),
  },
  [PdfVarKey.REFUND]: {
    key: PdfVarKey.REFUND,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.refund),
  },
  [PdfVarKey.REFUNDED]: {
    key: PdfVarKey.REFUNDED,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.refunded),
  },
  [PdfVarKey.DUE]: {
    key: PdfVarKey.DUE,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.due),
  },
  [PdfVarKey.TOTAL_CO_PAY]: {
    key: PdfVarKey.TOTAL_CO_PAY,
    keyType: "key-value",
    position: "AmountSummary",
    resolve: (ctx) => fmt(ctx.totalCoPay),
  },

  // --- Transaction summary ---
  [PdfVarKey.BILLED_BY]: {
    key: PdfVarKey.BILLED_BY,
    keyType: "key-value",
    position: "TransactionSummary",
    resolve: (ctx) => ctx.billedBy ?? "",
  },
  [PdfVarKey.REPORT_URL]: {
    key: PdfVarKey.REPORT_URL,
    keyType: "key-value",
    position: "TransactionSummary",
    resolve: (ctx) => ctx.reportUrl ?? "",
  },
  [PdfVarKey.TRANSACTION]: {
    key: PdfVarKey.TRANSACTION,
    keyType: "array",
    position: "TransactionSummary",
    source: "transactions",
    resolveRow: (row: TransactionItem) => row.text,
  },
  [PdfVarKey.AMOUNT_IN_WORD]: {
    key: PdfVarKey.AMOUNT_IN_WORD,
    keyType: "key-value",
    position: "TransactionSummary",
    resolve: (ctx) => ctx.amountInWord ?? "",
  },
  [PdfVarKey.USER_LOGIN]: {
    key: PdfVarKey.USER_LOGIN,
    keyType: "key-value",
    position: "TransactionSummary",
    resolve: (ctx) => ctx.userLogin ?? "",
  },
  [PdfVarKey.USER_PASSWORD]: {
    key: PdfVarKey.USER_PASSWORD,
    keyType: "key-value",
    position: "TransactionSummary",
    resolve: (ctx) => ctx.userPassword ?? "",
  },

  // --- Footer ---
  [PdfVarKey.SIGNATURE]: {
    key: PdfVarKey.SIGNATURE,
    keyType: "key-value",
    position: "Footer",
    resolve: (ctx) => ctx.signature ?? "",
  },
  [PdfVarKey.SIGNATURE_DOCTOR]: {
    key: PdfVarKey.SIGNATURE_DOCTOR,
    keyType: "key-value",
    position: "Footer",
    resolve: (ctx) => ctx.signatureDoctor ?? "",
  },
  [PdfVarKey.DOCTOR_DESIGNATION]: {
    key: PdfVarKey.DOCTOR_DESIGNATION,
    keyType: "key-value",
    position: "Footer",
    resolve: (ctx) => ctx.doctorDesignation ?? "",
  },
  [PdfVarKey.DOCTOR_REG_NO]: {
    key: PdfVarKey.DOCTOR_REG_NO,
    keyType: "key-value",
    position: "Footer",
    resolve: (ctx) => ctx.doctorRegNo ?? "",
  },
  [PdfVarKey.FOOTER_MESSAGE]: {
    key: PdfVarKey.FOOTER_MESSAGE,
    keyType: "key-value",
    position: "Footer",
    resolve: (ctx) => ctx.footerMessage ?? "",
  },
  [PdfVarKey.FOOTER_EMAIL]: {
    key: PdfVarKey.FOOTER_EMAIL,
    keyType: "key-value",
    position: "Footer",
    resolve: (ctx) => ctx.footerEmail ?? "",
  },
};
