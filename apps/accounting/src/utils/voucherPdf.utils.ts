import { CustomDocDefinition, TableBodyIterable } from "av6-pdf-engine";
import { VoucherPdfDTO } from "@/types/voucher/voucher.js";
import { getCompanySettings } from "@/repository/settings/settings.repository.js";
import { VoucherTypeNature } from "@repo/db/generated/prisma/enums.js";
import { Group, Ledger, VoucherLine } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { COMPANY_LOGO_BASE_URL } from "@repo/shared";

export const getTopLedger = (
  voucherTypeNature: VoucherTypeNature,
  voucherLines: VoucherLine[],
  ledgers: Ledger[],
  groups: Group[]
): { line: VoucherLine; ledger: Ledger } | undefined | null => {
  const ledgerMap = new Map(ledgers.map((l) => [l.id, l]));
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  switch (voucherTypeNature) {
    case "PAYMENT": {
      // Top ledger (CR): Cash-in-Hand or Bank Accounts
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        return (
          (ledger?.isCashAccount || ledger?.isBankAccount) && line.drCr === "CR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "RECEIPT": {
      // Top ledger (DR): Cash-in-Hand or Bank Accounts
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        return (
          (ledger?.isCashAccount || ledger?.isBankAccount) && line.drCr === "DR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "SALES": {
      // Top ledger (DR): Sundry Debtors or Sundry Creditors
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        if (!ledger) return false;
        const group = groupMap.get(ledger.groupId);
        return (
          (group?.name === "Sundry Debtors" ||
            group?.name === "Sundry Creditors") &&
          line.drCr === "DR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "SALES_RETURN": {
      // Top ledger (CR): Sundry Debtors or Sundry Creditors
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        if (!ledger) return false;
        const group = groupMap.get(ledger.groupId);
        return (
          (group?.name === "Sundry Debtors" ||
            group?.name === "Sundry Creditors") &&
          line.drCr === "CR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "PURCHASE": {
      // Top ledger (CR): Sundry Debtors or Sundry Creditors
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        if (!ledger) return false;
        const group = groupMap.get(ledger.groupId);
        return (
          (group?.name === "Sundry Debtors" ||
            group?.name === "Sundry Creditors") &&
          line.drCr === "CR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "PURCHASE_RETURN": {
      // Top ledger (DR): Sundry Debtors or Sundry Creditors
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        if (!ledger) return false;
        const group = groupMap.get(ledger.groupId);
        return (
          (group?.name === "Sundry Debtors" ||
            group?.name === "Sundry Creditors") &&
          line.drCr === "DR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "CONTRA": {
      // Top ledger (DR): Cash/Bank Account
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        return (
          (ledger?.isCashAccount || ledger?.isBankAccount) && line.drCr === "DR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "DEBIT_NOTE": {
      // Top ledger (DR): Sundry Debtors / Sundry Creditors
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        if (!ledger) return false;
        const group = groupMap.get(ledger.groupId);
        return (
          (group?.name === "Sundry Debtors" ||
            group?.name === "Sundry Creditors") &&
          line.drCr === "DR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    case "CREDIT_NOTE": {
      // Top ledger (DR): Sales Accounts / Purchase Accounts
      const line = voucherLines.find((line) => {
        const ledger = ledgerMap.get(line.ledgerId);
        if (!ledger) return false;
        const group = groupMap.get(ledger.groupId);
        return (
          (group?.name === "Sales Accounts" ||
            group?.name === "Purchase Accounts") &&
          line.drCr === "DR"
        );
      });
      if (!line) return null;
      const ledger = ledgerMap.get(line.ledgerId);
      return ledger ? { line, ledger } : null;
    }

    default:
      return null;
  }
};

export const generateVoucherInvoice = async (
  data: VoucherPdfDTO
): Promise<CustomDocDefinition> => {
  logger.info("entering::generateStudentCard::utils");

  let companyLogo;
  const companySettings = (await getCompanySettings()) ?? null;
  if (companySettings)
    companyLogo = `${COMPANY_LOGO_BASE_URL}${companySettings?.miniLogo}`;

  const voucherPdfTEmplate: CustomDocDefinition = {
    pageSize: "A4",
    pageOrientation: "portrait",
    margins: {
      top: 120,
      right: 36,
      bottom: 40,
      left: 36,
    },
    header: {
      marginTop: 20,
      marginLeft: 30,
      marginRight: 30,
      blocks: [
        {
          type: "columns",
          mode: "spaceBetween",
          widths: [100, "*"],
          columns: [
            [
              {
                type: "image",
                src: companyLogo,
                width: 75,
                height: 60,
                align: "left",
                marginLeft: 10,
              },
            ],
            [
              {
                type: "text",
                text: `${data.company?.name}`,
                align: "right",
                bold: true,
                fontSize: 16,
                lineGap: 2,
              },
              {
                type: "text",
                text: `${data.collectionCenter?.value}`,
                fontSize: 12,
                lineGap: 2,
                align: "right",
                bold: true,
              },
            ],
          ],
        },
        {
          type: "line",
          lineWidth: 1,
          color: "#000000",
          marginTop: 15,
        },
      ],
    },
    content: [
      {
        type: "text",
        text: `${data.voucherType?.value} voucher`,
        bold: true,
        fontSize: 16,
        align: "center",
      },
      //========== VOUCHER SUMMARY ==============
      {
        type: "text",
        text: "Voucher Summary",
        bold: true,
        fontSize: 10,
        align: "left",
        underline: true,
      },
      {
        type: "keyValueGrid",
        marginTop: 10,
        columnWidths: ["*", "*"],
        columnGap: 20,
        keyWidth: 85,
        separator: ":",
        rowGap: 6,
        keyTextStyle: {
          fontSize: 9,
        },
        valueTextStyle: {
          fontSize: 9,
        },
        columns: [
          [
            {
              key: "Voucher No",
              value: `${data.voucherNo}`,
            },
            {
              key: "Voucher Date",
              value: `${data.voucherDate}`,
            },

            {
              key: "Currency",
              value: `${data.currency?.value || ""}`,
            },
            {
              key: "Currency Conversion rate",
              value: `${data.currencyConversionRate || ""}`,
            },
          ],
          [
            {
              key: "Voucher Status",
              value: `${data.status}`,
            },
            {
              key: "Reference Type",
              value: `${data.refType || ""}`,
            },
            {
              key: "Sub Reference Type",
              value: `${data.subRefType || ""}`,
            },
            {
              key: "Reference No",
              value: `${data.refNo || ""}`,
            },
          ],
        ],
      },

      //=========== ACCOUNT NAME ==========
      data.topLedger
        ? {
            type: "text",
            text: `${data.topLedger?.label || ""} : ${
              data.topLedger?.name || ""
            }`,
            bold: true,
            fontSize: 9,
            marginTop: 10,
            align: "left",
          }
        : {
            type: "text",
            text: "",
          },

      //=========== PAYMENT SUMMARY =============
      data.transactionType || data.instrumentDate || data.instrumentNo
        ? {
            type: "text",
            text: "Payment Summary",
            bold: true,
            fontSize: 10,
            align: "left",
            underline: true,
            marginTop: 10,
          }
        : {
            type: "text",
            text: "",
            marginTop: 0,
            marginBottom: 0,
          },

      {
        type: "keyValueGrid",
        marginTop: 10,
        columnWidths: ["*"],
        columnGap: 24,
        keyWidth: 80,
        separator: ":",
        rowGap: 6,
        keyTextStyle: {
          fontSize: 9,
        },
        valueTextStyle: {
          fontSize: 9,
        },
        columns:
          data.transactionType || data.instrumentDate || data.instrumentNo
            ? [
                [
                  {
                    key: "Mode Of Payment",
                    value: `${data.transactionType || ""}`,
                  },
                  {
                    key: "Instrument No",
                    value: `${data.instrumentNo || ""}`,
                  },
                  {
                    key: "Instrument Date",
                    value: `${data.instrumentDate || ""}`,
                  },
                ],
              ]
            : [],
      },

      //========== PAYMENT DETAILS BREAKDOWN ==============
      {
        type: "text",
        text: `${data.voucherType?.value} Details Breakdown`,
        bold: true,
        fontSize: 10,
        align: "left",
        underline: true,
        marginTop: 10,
      },
      {
        type: "table",
        headerRows: 1,
        widths: [55, "*", 120],
        marginTop: 8,
        marginBottom: 20,
        layout: {
          border: "all",
          hLineColor: "#000000",
          vLineColor: "#000000",
        },
        body: [
          {
            isIterable: false,
            iterableKey: "",
            content: [
              {
                text: "SL NO",
                bold: true,
                paddingTop: 5,
                paddingBottom: 3,
                align: "center",
                fontSize: 9,
              },
              {
                text: "PARTICULARS",
                bold: true,
                paddingTop: 5,
                paddingBottom: 3,
                align: "center",
                fontSize: 9,
              },
              {
                text: "AMOUNT",
                bold: true,
                paddingTop: 5,
                paddingBottom: 3,
                align: "center",
                fontSize: 9,
              },
            ],
          },
          ...data.voucherLines.map((line): TableBodyIterable => {
            return {
              isIterable: false,
              iterableKey: "",
              content: [
                {
                  text: `${line.index}`,
                  paddingTop: 5,
                  paddingBottom: 3,
                  align: "center",
                  fontSize: 9,
                },
                {
                  text: `${line.ledger?.value}`,
                  paddingTop: 5,
                  paddingBottom: 3,
                  align: "center",
                  fontSize: 9,
                },
                {
                  text: `${line.amount}`,
                  paddingTop: 5,
                  paddingBottom: 3,
                  align: "center",
                  fontSize: 9,
                },
              ],
            };
          }),
          {
            isIterable: false,
            iterableKey: "",
            content: [
              {
                text: "NET TOTAL",
                paddingTop: 5,
                align: "right",
                fontSize: 9,
                bold: true,
                colSpan: 2,
              },
              {
                text: `${data.topLedger?.amount}` || "N/A",
                paddingTop: 5,
                paddingBottom: 5,
                align: "center",
                fontSize: 9,
                bold: true,
              },
            ],
          },
        ],
      },

      // ============== NET AMOUNT IN WORDS & NARRATION ============
      {
        type: "keyValueGrid",
        columnWidths: ["*", "*"],
        keyWidth: 118,
        orientation: "horizontal",
        separator: ":",
        keyTextStyle: {
          fontSize: 9,
          bold: true,
        },
        valueTextStyle: {
          fontSize: 9,
        },
        columns: [
          [
            {
              key: "Net amount Paid (In Words)",
              value: `${data.amountInWords || ""}`,
            },
          ],
        ],
      },

      {
        type: "keyValueGrid",
        columnWidths: ["*", "*"],
        keyWidth: 45,
        marginTop: 10,
        orientation: "horizontal",
        separator: ":",
        keyTextStyle: {
          fontSize: 9,
          bold: true,
        },
        valueTextStyle: {
          fontSize: 9,
        },
        columns: [
          [
            {
              key: "Narration",
              value: `${data.narration}`,
            },
          ],
        ],
      },

      // ============ CREATED & APPROVED DETAILS

      {
        type: "text",
        text: "Creation & Approval Details:",
        bold: true,
        underline: true,
        fontSize: 9,
        marginTop: 20,
      },

      {
        type: "table",
        widths: ["*", "*"],
        layout: {
          border: "all",
          hLineColor: "#000000",
          vLineColor: "#000000",
        },
        marginTop: 8,
        marginBottom: 14,
        body: [
          {
            isIterable: false,
            iterableKey: "",
            content: [
              {
                blocks: [
                  {
                    type: "columns",
                    widths: [55, "*"],
                    gap: 0,
                    columns: [
                      [
                        {
                          type: "text",
                          text: "Created By:",
                          bold: true,
                          fontSize: 9,
                        },
                      ],
                      [
                        {
                          type: "text",
                          text: `${data.createdBy?.value || ""}`,
                          fontSize: 9,
                        },
                      ],
                    ],
                    padding: 5,
                    marginBottom: -10,
                  },
                ],
              },
              {
                blocks: [
                  {
                    type: "columns",
                    widths: [65, "*"],
                    gap: 0,
                    columns: [
                      [
                        {
                          type: "text",
                          text: "Created Date:",
                          bold: true,
                          fontSize: 9,
                        },
                      ],
                      [
                        {
                          type: "text",
                          text: `${data.createdAt || ""}`,
                          fontSize: 9,
                        },
                      ],
                    ],
                    padding: 5,
                    marginBottom: -10,
                  },
                ],
              },
            ],
          },
          {
            isIterable: false,
            iterableKey: "",
            content: [
              {
                blocks: [
                  {
                    type: "columns",
                    widths: [65, "*"],
                    gap: 0,
                    columns: [
                      [
                        {
                          type: "text",
                          text: "Approved By:",
                          bold: true,
                          fontSize: 9,
                        },
                      ],
                      [
                        {
                          type: "text",
                          text: `${data.approvedBy?.value || ""}`,
                          fontSize: 9,
                        },
                      ],
                    ],
                    padding: 5,
                    marginBottom: -10,
                  },
                ],
              },
              {
                blocks: [
                  {
                    type: "columns",
                    widths: [70, "*"],
                    gap: 0,
                    columns: [
                      [
                        {
                          type: "text",
                          text: "Approved Date:",
                          bold: true,
                          fontSize: 9,
                        },
                      ],
                      [
                        {
                          type: "text",
                          text: `${data.approvedAt || ""}`,
                          fontSize: 9,
                        },
                      ],
                    ],
                    padding: 5,
                    marginBottom: -10,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    footer: [
      {
        type: "line",
        lineWidth: 1,
        color: "#000000",
      },
      {
        type: "text",
        text: "Computer Generated Copy",
        fontSize: 9,
        align: "center",
        marginTop: 5,
        underline: true,
      },
    ],
  };
  logger.info("exiting::generateStudentCard::utils");
  return voucherPdfTEmplate;
};
