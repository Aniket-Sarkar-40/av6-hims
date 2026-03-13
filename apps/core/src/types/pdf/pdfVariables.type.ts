/* eslint-disable @typescript-eslint/no-explicit-any */
import { PdfVarKey } from "@/enums/pdfVariable.enum.js";

// ---------------- DATA CONTEXT ----------------

export interface LineItem {
  doctorName: string;
  dateTime: string;
  itemName: string;
  batch?: string;
  expDate?: string;
  baseRate: number;
  quantity: number;
  tax: number;
  discount: number;
  coPay: number;
  vip: number;
  netAmount: number;
  otherCharge?: number;
  grossAmount: number;
  subTotal: number;
}

export interface TransactionItem {
  text: string; // e.g. "Amount of 0800 in Cash Collected By ..."
}

export interface PdfContext {
  // header / master
  companyName: string;
  ccAddressLine1: string;
  ccAddressLine2?: string;
  ccPhone1?: string;
  ccPhone2?: string;
  ccEmail?: string;
  waterMark?: string;

  // patient / visit
  title?: string;
  name: string;
  age?: number;
  sex?: string;
  refNo?: string;
  contactNo?: string;
  email?: string;
  address?: string;
  patientHistory?: string;
  patientId?: string;
  visitNo?: string;
  date?: string;
  time?: string;
  visitType?: string;
  deliveryMode?: string;

  // table
  lineItems: LineItem[];

  // amounts
  totalGross?: number;
  totalNet?: number;
  totalDiscount?: number;
  totalTax?: number;
  totalPaid?: number;
  refund?: number;
  refunded?: number;
  due?: number;
  totalCoPay?: number;

  // transaction summary
  billedBy?: string;
  reportUrl?: string;
  transactions: TransactionItem[];
  amountInWord?: string;
  userLogin?: string;
  userPassword?: string;

  // footer
  signature?: string;
  signatureDoctor?: string;
  doctorDesignation?: string;
  doctorRegNo?: string;
  footerMessage?: string;
  footerEmail?: string;
}

// ---------------- CONTRACT META ----------------

type KeyType = "key-value" | "array";
type Position =
  | "Header"
  | "Summary"
  | "Table"
  | "AmountSummary"
  | "TransactionSummary"
  | "Footer";

type ArraySource = "lineItems" | "transactions";

export interface BaseContract {
  key: PdfVarKey;
  keyType: KeyType;
  position: Position;
}

interface ScalarContract extends BaseContract {
  keyType: "key-value";
  resolve: (ctx: PdfContext) => any;
}

interface ArrayContract extends BaseContract {
  keyType: "array";
  source: ArraySource;
  resolveRow: (row: any, index: number, ctx: PdfContext) => any;
}

export type VariableContract = ScalarContract | ArrayContract;
