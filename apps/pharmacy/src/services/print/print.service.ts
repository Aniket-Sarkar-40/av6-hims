import { getSellReturnBySellIdFromDb } from "@/repository/sell/sellReturn.repository.js";
import {
  AppointmentDosageDto,
  AppointmentResponse,
  NonCompletedMedicine,
} from "@/types/opd/opdList.js";
import { PrinterResponse, SellDtoForReceipt } from "@/types/sell/sell.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { applyRound, getValidCharSet } from "av6-utils";
import dayjs from "dayjs";
import {
  BreakLine,
  CharacterSet,
  PrinterTypes,
  ThermalPrinter,
} from "node-thermal-printer";
import { ToWords } from "to-words";
import { printerSettingService } from "../master/printerSettings.service.js";
import { settingsService } from "../master/settings.service.js";

const toWords = new ToWords({
  localeCode: "en-GH",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: "Cedi",
      plural: "Cedis",
      symbol: "₵",
      fractionalUnit: {
        name: "Pesewa",
        plural: "Pesewas",
        symbol: "",
      },
    },
  },
});

/* ───────────────────────── Helpers ────────────────────────── */
// 58‑mm printers = ~32 chars, 80‑mm = ~48 chars
// const CHARS_PER_LINE = 32;

// function getSwallowPhrase(packType: MED_PACK_TYPE, dose: number) {
//   if (!dose) return "";
//   switch (packType) {
//     case "Tube":
//       return `Apply as directed`;
//     case "Strip":
//       return `Swallow ${dose}(s) `;
//     case "Bottle":
//       return `Take ${dose}(s) dose(s)`;
//     case "Box":
//       return `Take ${dose}(s) dose(s) from the box`;
//     case "Sachet":
//       return `Empty ${dose}(s) sachet(s) and take`;
//     case "Packet":
//       return `Use content of ${dose}(s) packet(s)`;
//     case "Jar":
//       return `Take ${dose}(s) dose(s) from the jar`;
//     default:
//       return `Take ${dose}(s) dose(s)`;
//   }
// }

//  function createInstruction(
//   med: ItemAppointmentDTO,
//   morningDose: number,
//   afternoonDose: number,
//   nightDose: number,
//   duration: string,
//   notes: string,
//   sos?: boolean
// ) {
//   const doses = [];
//   if (morningDose) doses.push(`${getSwallowPhrase(med.medPackingType, morningDose)} in the morning`);
//   if (afternoonDose) doses.push(`${getSwallowPhrase(med.medPackingType, afternoonDose)} in the afternoon`);
//   if (nightDose) doses.push(`${getSwallowPhrase(med.medPackingType, nightDose)} at night`);
//   const doseStr = doses.join(", ");
//   const foodInstr = "with or without food";
//   return `${doseStr} daily ${foodInstr} for ${duration} days.${notes ? " Notes: " + notes : ""}${sos ? " (SOS)" : ""}`;
// }

function createInstructionNew(
  morningDose: number,
  afternoonDose: number,
  nightDose: number,
  duration: string,
  notes: string,
  sos?: boolean,
) {
  let inst = "";
  if (morningDose) inst += `Morning ${morningDose} `;
  if (afternoonDose) inst += `Afternoon ${afternoonDose} `;
  if (nightDose) inst += `Night ${nightDose} `;
  inst += `${notes} ${sos ? "(SOS)" : ""}`;
  inst = inst.trim();
  // if (duration) {
  //   inst += ` for ${duration} days`;
  // }
  return inst;
}

function generateZplLabel({
  ccName,
  ccAddress,
  phone,
  medicineName,
  instructionText,
  patientName,
  footer,
  footerSub,
}: {
  ccName: string;
  ccAddress: string;
  phone: string;
  medicineName: string;
  instructionText: string;
  patientName: string;
  footer: string;
  footerSub: string;
}) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const currentDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

  const zplString = `
^XA
^PW480
^LL176

; --- TOP STATIC HEADER ---
^CF0,15
^FO0,5^FB480,1,,C^A0N,20,20^FD${ccName}^FS
^FO0,25^FB480,1,,C^A0N,10,10^FD${ccAddress}^FS
^FO0,35^FB480,1,,C^A0N,10,10^FD${phone}^FS
^FO0,45^GB480,15,15,B,0^FS
^FO0,47^FB480,1,,C^A0N,12,12^FR^FD${medicineName}^FS

; --- DYNAMIC INSTRUCTION AREA ---
; This Field Block allows for up to 3 lines of text.
^FO5,62^FB470,3,2,L,0^A0N,15,15^FD${instructionText}^FS

; --- BOTTOM STATIC FOOTER ---
^FO5,112^A0N,12,12^FDPatient : ${patientName}^FS
^FO0,127^GB480,1,1,B,0^FS
^FO5,130^FB235,1,,L^A0N,10,10^FD${currentDateTime}^FS
^FO240,130^FB235,1,,R^A0N,10,10^FDPharm:__________________^FS
^FO0,142^GB480,1,1,B,0^FS
^FO0,145^FB480,1,,C^A0N,10,10^FD${footer}^FS
^FO0,160^FB480,1,,C^A0N,10,10^FD${footerSub}^FS

^XZ
`;

  // Return the generated ZPL, trimming any leading/trailing whitespace.
  return zplString.trim();
}

function generateTSPLLabel({
  ccName,
  ccAddress,
  phone,
  medicineName,
  instructionText,
  patientName,
  footer,
  footerSub,
}: {
  ccName: string;
  ccAddress: string;
  phone: string;
  medicineName: string;
  instructionText: string;
  patientName: string;
  footer: string;
  footerSub: string;
}) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const currentDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

  const tsplString = `
SIZE 70mm,50mm
GAP 2mm,0mm
DIRECTION 0
CLS
CODEPAGE UTF-8

; --- TOP STATIC HEADER ---
TEXT 5,5,"2",0,1,1,"${ccName}"
TEXT 5,25,"1",0,1,1,"${ccAddress}"
TEXT 5,35,"1",0,1,1,"${phone}"
BOX 5,45,270,60,2
TEXT 5,47,"1",0,1,1,"${medicineName}"

; --- DYNAMIC INSTRUCTION AREA ---
TEXT 5,65,"1",0,1,1,"${instructionText}"

; --- BOTTOM STATIC FOOTER ---
TEXT 5,105,"1",0,1,1,"Patient: ${patientName}"
LINE 5,125,270,125,2
TEXT 5,130,"1",0,1,1,"${currentDateTime}"
TEXT 140,130,"1",0,1,1,"Pharm:__________________"
LINE 5,150,270,150,2
TEXT 5,155,"1",0,1,1,"${footer}"
TEXT 5,170,"1",0,1,1,"${footerSub}"

PRINT 1,1
`;

  // Return the generated TSPL, trimming any leading/trailing whitespace.
  return tsplString.trim();
}

function generateXPMLLabel({
  ccName,
  ccAddress,
  phone,
  medicineName,
  instructionText,
  patientName,
  footerSub,
}: {
  ccName: string;
  ccAddress: string;
  phone: string;
  medicineName: string;
  instructionText: string;
  patientName: string;
  footerSub: string;
}) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const currentDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  let lienHeight = 5;
  // let xpmlString = `
  //   <xpml><page quantity='0' pitch='50.0 mm'></xpml>SIZE 71.2 mm, 50 mm
  //   DIRECTION 0,0
  //   REFERENCE 0,0
  //   OFFSET 0 mm
  //   SET PEEL OFF
  //   <xpml></page></xpml><xpml><page quantity='1' pitch='50.0 mm'></xpml>SET TEAR ON
  //   CLS
  //   TEXT 150,5,"2",0,2,2,"${ccName}"
  //   TEXT 50,60,"1",0,1,1,"${ccAddress}"
  //   TEXT 50,85,"1",0,1,1,"${phone}"
  //   LINE 50,110,50,${lienHeight},1
  //   TEXT 50,120,"2",0,1,2,"${medicineName}"
  //   TEXT 50,145,"1",0,1,1,"${instructionText}"
  //   TEXT 50,170,"1",0,1,1,"Patient : ${patientName}"
  //   TEXT 300,170,"1",0,1,1,"Pharm:_____________________"
  //   TEXT 50,190,"1",0,1,1,"${footerSub}"
  //   PRINT 1,1
  //   <xpml></page></xpml><xpml><end/></xpml>
  //   `
  let xpmlString = `
     <xpml><page quantity='0' pitch='50.0 mm'></xpml>SIZE 71.2 mm, 50 mm
     DIRECTION 0,0
     REFERENCE 0,0
     OFFSET 0 mm
     SET PEEL OFF
     <xpml></page></xpml><xpml><page quantity='1' pitch='50.0 mm'></xpml>SET TEAR ON
     CLS\n`;
  xpmlString += `    TEXT 125,${lienHeight},"2",0,2,2,"${ccName}"\n`;
  lienHeight += 50;
  if (ccAddress.length > 52) {
    xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"${ccAddress.substring(0, 50)}"\n`;
    lienHeight += 25;
    xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"${ccAddress.substring(50, 95)}"\n`;
  } else {
    xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"${ccAddress}"\n`;
  }
  lienHeight += 25;
  xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"${phone}"\n`;
  lienHeight += 20;
  xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"_____________________________________________________"\n`;
  lienHeight += 25;
  if (medicineName.length > 35) {
    xpmlString += `    TEXT 50,${lienHeight},"2",0,1,1,"${medicineName.substring(0, 35)}${medicineName.charAt(35) != " " ? "-" : ""}"\n`;
    lienHeight += 25;
    xpmlString += `    TEXT 50,${lienHeight},"2",0,1,1,"${medicineName.substring(35).trim()}"\n`;
    lienHeight += 25;
  } else {
    xpmlString += `    TEXT 50,${lienHeight},"2",0,1,2,"${medicineName}"\n`;
    lienHeight += 35;
  }
  xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"_____________________________________________________"\n`;
  lienHeight += 5;
  const count = Math.ceil(instructionText.length / 50);
  for (let i = 0; i < count; i++) {
    lienHeight += 25;
    if (i < count - 1) {
      xpmlString += `    TEXT 50,${lienHeight},"2",0,1,1,"${instructionText.substring(i * 50, (i + 1) * 50)}"\n`;
    } else {
      xpmlString += `    TEXT 50,${lienHeight},"2",0,1,1,"${instructionText.substring(i * 50)}"\n`;
    }
  }
  lienHeight += 30;
  xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"Patient : ${patientName}"\n`;
  lienHeight += 25;
  xpmlString += `    TEXT 50,${lienHeight},"1",0,1,1,"Date : ${currentDateTime}"\n`;
  xpmlString += `    TEXT 350,${lienHeight},"1",0,1,1,"Dispensary :_____________________"\n`;
  lienHeight += 40;
  xpmlString += `    TEXT 150,${lienHeight},"1",0,1,1,"${footerSub}"\n`;
  xpmlString += `    PRINT 1,1 \n`;
  xpmlString += `    <xpml></page></xpml><xpml><end/></xpml>\n`;

  return xpmlString.trim();
}

export const printService = {
  async printSellReceipt(sell: SellDtoForReceipt): Promise<PrinterResponse> {
    const printerSettings =
      await printerSettingService.getSettingsByPrinterTypeAndCC(
        sell.ccId,
        "THERMAL",
      );
    const settings = await settingsService.getSettings(true);
    const allSellReturns = await getSellReturnBySellIdFromDb(sell.id);

    const returnedTotal = allSellReturns.reduce(
      (acc, sr) => (acc += sr.totalAmount.toNumber()),
      0,
    );
    const returnedNetDiscount = allSellReturns.reduce(
      (acc, sr) => (acc += sr.netDiscount.toNumber()),
      0,
    );
    const returnedNetTax = allSellReturns.reduce(
      (acc, sr) => (acc += sr.netTax.toNumber()),
      0,
    );
    const returnedCustomerPayAmount = allSellReturns.reduce(
      (acc, sr) => (acc += sr.customerPayAmount.toNumber()),
      0,
    );
    const returnedCoPayAmount = allSellReturns.reduce(
      (acc, sr) => (acc += sr.coPayAmount.toNumber()),
      0,
    );

    if (!printerSettings) {
      logger.error("Printer settings not found");
      throw new ErrorHandler(404, "Printer settings not found");
    }
    try {
      logger.info("entering::printSellReceipt::service");

      const chapPerLine = getValidCharSet(printerSettings.printerWidth);

      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        // interface: "tcp://127.0.0.1:9100",
        interface: "/dev/usb/lp0",
        removeSpecialCharacters: false,
        breakLine: BreakLine.NONE,
        width: chapPerLine,
        characterSet: CharacterSet.PC852_LATIN2,
        options: {
          timeout: 5000,
        },
      });

      /* ───────────────── Header ───────────────── */
      printer.alignCenter();
      printer.newLine();
      printer.setTextQuadArea();
      printer.bold(true);
      printer.println("RABITO CLINIC");
      printer.setTextNormal();
      printer.newLine();
      //await printer.printImage("public/images/logo-rabitoclinic.png");

      printer.println(`${sell.cc.colName}, ${sell.cc.address}`);
      printer.newLine();
      printer.println(`Phone: ${sell.cc.phone}`);
      printer.println(`Email: ${sell.cc.email}`);
      printer.newLine();
      printer.alignCenter();
      printer.setTypeFontA();
      printer.println(`Payment Receipt`);
      printer.setTypeFontB();
      printer.drawLine();

      /* ───────────── Sale meta info ───────────── */
      printer.setTypeFontA();
      printer.tableCustom([
        {
          text: `Name:`,
          width: 0.5,
          align: "LEFT",
          bold: true,
        },
        {
          text: `Age/Gender`,
          width: 0.5,
          align: "RIGHT",
          bold: true,
        },
      ]);
      printer.tableCustom([
        {
          text: `${sell.customer?.patientName || ""}`,
          width: 0.5,
          align: "LEFT",
        },
        {
          text: `${sell.customer.age}/${sell.customer.gender}`,
          width: 0.5,
          align: "RIGHT",
        },
      ]);
      printer.tableCustom([
        {
          text: `${dayjs(sell.billDate).format("DD-MM-YYYY")} ${dayjs(sell.billDate).format("HH:mm:ss")}`,
          width: 0.5,
          align: "LEFT",
        },
        {
          text: `Mode:${sell.paymentTransaction?.paymentMode?.replace("_", " ") || ""}`,
          width: 0.5,
          align: "RIGHT",
        },
      ]);
      printer.newLine();

      printer.tableCustom([
        {
          text: `Pat.Type:${sell.deliveryType}${sell.appointment ? `(${sell.appointment?.referredBy})` : ""}`,
          width: 0.5,
          align: "LEFT",
        },
        {
          text: `Provider:${sell.insurance?.value || sell.corporateClient?.value || ""}`,
          width: 0.5,
          align: "RIGHT",
        },
      ]);
      printer.newLine();

      printer.tableCustom([
        {
          text: `Bill No`,
          width: 0.5,
          align: "LEFT",
          bold: true,
        },
        {
          text: `Visit No`,
          width: 0.5,
          align: "RIGHT",
          bold: true,
        },
      ]);

      printer.tableCustom([
        {
          text: `${sell.sellRefNo.trim()}`,
          width: 0.5,
          align: "LEFT",
          bold: false,
        },
        {
          text: `${sell.sellRefNo.trim()}`,
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
      ]);

      printer.newLine();
      printer.drawLine();

      /* ───────────── Item table ───────────── */
      // table header
      printer.setTypeFontA();
      printer.tableCustom([
        {
          text: "Item",
          width: 0.4,
          align: "LEFT",
          bold: true,
        },
        {
          text: "Qty",
          width: 0.16,
          align: "CENTER",
          bold: true,
        },
        {
          text: `Unit Price`,
          width: 0.24,
          align: "CENTER",
          bold: true,
        },
        {
          text: `Total`,
          width: 0.2,
          align: "RIGHT",
          bold: true,
        },
      ]);
      printer.drawLine();

      // table rows
      sell.sellDetails.forEach((d) => {
        let returnedTotal = 0;
        allSellReturns.forEach((sr) => {
          sr.sellReturnDetails.forEach((srd) => {
            if (srd.sellDetailsId === d.id) {
              returnedTotal += srd.totalAmount.toNumber() ?? 0;
            }
          });
        });
        printer.tableCustom([
          {
            text: d.item?.medicineName || "",
            width: 0.4,
            align: "LEFT",
            bold: false,
          },
          {
            text: applyRound(
              d.quantity - (d.returnQuantity || 0),
              settings?.sellRoundedFormat ?? "TO_FIXED",
              settings?.defaultPrecision ?? 2,
            ).toFixed(2),
            width: 0.16,
            align: "CENTER",
            bold: false,
          },
          {
            text: d.mrp.toString(),
            width: 0.24,
            align: "CENTER",
            bold: false,
          },
          {
            text: applyRound(
              d.totalAmount - returnedTotal,
              settings?.sellRoundedFormat ?? "TO_FIXED",
              settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
            ).toFixed(2),
            width: 0.2,
            align: "RIGHT",
            bold: false,
          },
        ]);
        /* ______________For Batch No & Expiry Date __________________ */
        printer.tableCustom([
          {
            text: `Batch: ${d.batchNo === "n@n" ? "----" : d.batchNo} Exp: ${dayjs(d.expiryDate).format("DD-MM-YYYY") === "31-12-2999" ? "----" : dayjs(d.expiryDate).format("DD-MM-YYYY")}`,
            width: 1,
            align: "LEFT",
            // style: { fontSize: 8 },  // Adjust font size to fit if needed
            bold: true,
          },
        ]);
      });
      printer.drawLine();

      /* ───────────── Totals ───────────── */
      // printer.alignRight();
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },
        {
          text: "Gross Amount:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${applyRound(
            sell.totalAmount - returnedTotal,
            settings?.sellRoundedFormat ?? "TO_FIXED",
            settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
          ).toFixed(2)}`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },
        {
          text: "Discount:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${applyRound(
            sell.netDiscount - returnedNetDiscount,
            settings?.sellRoundedFormat ?? "TO_FIXED",
            settings?.defaultPrecision ?? 2,
          ).toFixed(2)}`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },

        {
          text: "Tax:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${applyRound(
            sell.netTax - returnedNetTax,
            settings?.sellRoundedFormat ?? "TO_FIXED",
            settings?.defaultPrecision ?? 2,
          ).toFixed(2)}`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },
        {
          text: "Net Payable:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${applyRound(
            sell.customerPayAmount - returnedCustomerPayAmount,
            settings?.sellRoundedFormat ?? "TO_FIXED",
            settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
          ).toFixed(2)}`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },
        {
          text: "Co-Payment:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${applyRound(
            sell.coPayAmount - returnedCoPayAmount,
            settings?.sellRoundedFormat ?? "TO_FIXED",
            settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
          ).toFixed(2)}`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },
        {
          text: "Collected Amount:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${sell.paidAmount.toFixed(2)}`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },
        {
          text: "Due:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${
            sell.customerPayAmount -
              returnedCustomerPayAmount -
              sell.paidAmount -
              sell.refundedAmount <
            0
              ? "0.00"
              : applyRound(
                  sell.customerPayAmount -
                    returnedCustomerPayAmount -
                    sell.paidAmount -
                    sell.refundedAmount,
                  settings?.sellRoundedFormat ?? "TO_FIXED",
                  settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
                ).toFixed(2)
          }`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "",
          width: 0.25,
          align: "LEFT",
          bold: false,
        },
        {
          text: "Refund Amount:",
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
        {
          text: `${sell.refundedAmount.toFixed(2)}`,
          width: 0.25,
          align: "RIGHT",
          bold: false,
        },
      ]);
      printer.newLine();
      printer.newLine();
      /* ───────────── Others Info ───────────── */
      // printer.setTypeFontB();
      printer.tableCustom([
        {
          text: "In Word:",
          width: 0.35,
          align: "LEFT",
          bold: true,
        },
        {
          text: sell.paidAmount > 0 ? toWords.convert(sell.paidAmount) : "",
          width: 0.65,
          align: "LEFT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "Register by:",
          width: 0.35,
          align: "LEFT",
          bold: true,
        },
        {
          text: sell.staff?.name || "",
          width: 0.65,
          align: "LEFT",
          bold: false,
        },
      ]);
      printer.tableCustom([
        {
          text: "Collected by:",
          width: 0.35,
          align: "LEFT",
          bold: true,
        },
        {
          text: sell.paymentTransaction?.collectorName || "",
          width: 0.65,
          align: "LEFT",
          bold: false,
        },
      ]);
      printer.newLine();

      /* ───────────── Footer ───────────── */
      printer.alignCenter();
      printer.newLine();
      printer.println("Thank you For Choosing US");
      printer.cut();

      // printer.execute();

      const buffer = printer.getBuffer();
      const escposText = buffer.toString("binary");
      const unicodeEscaped = JSON.stringify(escposText.slice(1, -1));
      return {
        receipt: unicodeEscaped,
        printerName: printerSettings.printerName,
      };
    } catch (error) {
      logger.error(error);
      return { receipt: "", printerName: "" };
    }
  },
  async printNotCompletedSellReceipt(
    appointment: AppointmentResponse,
    medicines: NonCompletedMedicine[],
  ): Promise<PrinterResponse> {
    const printerSettings =
      await printerSettingService.getSettingsByPrinterTypeAndCC(
        appointment.ccId,
        "THERMAL",
      );

    if (!printerSettings) {
      logger.error("Printer settings not found");
      throw new ErrorHandler(404, "Printer settings not found");
    }
    try {
      logger.info("entering::printSellReceipt::service");

      const chapPerLine = getValidCharSet(printerSettings.printerWidth);

      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        // interface: "tcp://127.0.0.1:9100",
        interface: "/dev/usb/lp0",
        removeSpecialCharacters: false,
        breakLine: BreakLine.NONE,
        width: chapPerLine,
        characterSet: CharacterSet.PC852_LATIN2,
        options: {
          timeout: 5000,
        },
      });

      /* ───────────────── Header ───────────────── */
      printer.alignCenter();
      printer.newLine();
      printer.setTextQuadArea();
      printer.bold(true);
      printer.println("RABITO CLINIC");
      printer.setTextNormal();
      printer.newLine();
      //await printer.printImage("public/images/logo-rabitoclinic.png");

      printer.println(`${appointment.ccName}, ${appointment.address}`);
      printer.newLine();
      printer.println(`Phone: ${appointment.ccPhone}`);
      printer.println(`Email: ${appointment.ccEmail}`);
      printer.newLine();
      printer.alignCenter();
      printer.setTypeFontA();
      printer.println(`Incomplete Medicine Receipt`);
      printer.setTypeFontB();
      printer.drawLine();

      /* ───────────── Sale meta info ───────────── */
      printer.setTypeFontA();
      printer.tableCustom([
        {
          text: `Name:`,
          width: 0.5,
          align: "LEFT",
          bold: true,
        },
        {
          text: `Age/Gender`,
          width: 0.5,
          align: "RIGHT",
          bold: true,
        },
      ]);
      printer.tableCustom([
        {
          text: `${appointment.patientName || ""}`,
          width: 0.5,
          align: "LEFT",
        },
        {
          text: `${appointment.age}/${appointment.gender}`,
          width: 0.5,
          align: "RIGHT",
        },
      ]);
      printer.tableCustom([
        {
          text: `${dayjs(appointment.appointmentDate).format("DD-MM-YYYY")}`,
          width: 0.5,
          align: "LEFT",
        },
        {
          text: `Mode:${appointment.paymentType || ""}`,
          width: 0.5,
          align: "RIGHT",
        },
      ]);
      printer.newLine();

      printer.tableCustom([
        {
          text: `Apt.Type:${appointment.appointmentType || ""}`,
          width: 0.5,
          align: "LEFT",
        },
        {
          text: `Provider:${appointment?.insurerName || appointment.clientName || ""}`,
          width: 0.5,
          align: "RIGHT",
        },
      ]);
      printer.newLine();

      printer.tableCustom([
        {
          text: `Bill No`,
          width: 0.5,
          align: "LEFT",
          bold: true,
        },
        {
          text: `Visit No`,
          width: 0.5,
          align: "RIGHT",
          bold: true,
        },
      ]);

      printer.tableCustom([
        {
          text: `${appointment.billNo?.trim() || "N/A"}`,
          width: 0.5,
          align: "LEFT",
          bold: false,
        },
        {
          text: `${appointment.visitNo?.trim() || "N/A"}`,
          width: 0.5,
          align: "RIGHT",
          bold: false,
        },
      ]);

      printer.newLine();
      printer.drawLine();

      /* ───────────── Item table ───────────── */
      // table header
      printer.setTypeFontA();
      printer.tableCustom([
        {
          text: "Item",
          width: 0.4,
          align: "LEFT",
          bold: true,
        },
        {
          text: "Expected Qty",
          width: 0.16,
          align: "CENTER",
          bold: true,
        },
        {
          text: `Sold Qty`,
          width: 0.24,
          align: "CENTER",
          bold: true,
        },
        {
          text: `Remaining Qty`,
          width: 0.2,
          align: "RIGHT",
          bold: true,
        },
      ]);
      printer.drawLine();

      // table rows
      medicines.forEach((d) => {
        printer.tableCustom([
          {
            text: d.medicineName || "",
            width: 0.4,
            align: "LEFT",
            bold: false,
          },
          {
            text: String(d.expectedQty),
            width: 0.16,
            align: "CENTER",
            bold: false,
          },
          {
            text: String(d.totalSoldQty),
            width: 0.24,
            align: "CENTER",
            bold: false,
          },
          {
            text: String((d.expectedQty ?? 0) - (d.totalSoldQty ?? 0)),
            width: 0.2,
            align: "RIGHT",
            bold: false,
          },
        ]);
      });
      printer.drawLine();

      printer.newLine();
      /* ───────────── Others Info ───────────── */
      // printer.setTypeFontB();

      printer.tableCustom([
        {
          text: "Doctor:",
          width: 0.35,
          align: "LEFT",
          bold: true,
        },
        {
          text: appointment.bookedBy || "",
          width: 0.65,
          align: "LEFT",
          bold: false,
        },
      ]);

      printer.newLine();

      /* ───────────── Footer ───────────── */
      printer.alignCenter();
      printer.newLine();
      printer.println("Thank you For Choosing US");
      printer.cut();

      // printer.execute();

      const buffer = printer.getBuffer();
      const escposText = buffer.toString("binary");
      const unicodeEscaped = JSON.stringify(escposText.slice(1, -1));
      return {
        receipt: unicodeEscaped,
        printerName: printerSettings.printerName,
      };
    } catch (error) {
      logger.error(error);
      return { receipt: "", printerName: "" };
    }
  },

  async printInstruction(
    instructions: AppointmentDosageDto,
    index: number,
  ): Promise<PrinterResponse> {
    try {
      if (!instructions.collectionCenter?.id) {
        logger.error("Collection center ID is missing in instructions");
        throw new ErrorHandler(400, "Collection center ID is required");
      }

      const printerSettings =
        await printerSettingService.getSettingsByPrinterTypeAndCC(
          instructions.collectionCenter?.id,
          "LABEL",
        );

      if (!printerSettings) {
        logger.error("Printer settings not found");
        throw new ErrorHandler(404, "Printer settings not found");
      }

      const chapPerLine = getValidCharSet(printerSettings.printerWidth);

      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: "tcp://127.0.0.1:9100",
        removeSpecialCharacters: false,
        breakLine: BreakLine.NONE,
        width: chapPerLine,
        characterSet: CharacterSet.PC437_USA,
        options: {
          timeout: 5000,
        },
      });

      // Reset the top margin to zero

      /* ───────────────── Header ───────────────── */
      printer.alignCenter();
      printer.setTypeFontA();
      printer.newLine(); // Ensures space before header
      printer.tableCustom([
        {
          text: `${instructions.collectionCenter?.colName}`,
          align: "CENTER",
          width: 0.8,
          bold: true,
        },
      ]);
      printer.newLine(); // Adds space after header

      /* ───────────────── Medicine ───────────────── */
      printer.setTypeFontB();
      printer.invert(true);
      printer.bold(true);
      printer.tableCustom([
        {
          text: `${instructions.medicine[index].med?.medicineName || "No Medicine"}`,
          align: "CENTER",
          width: 1,
        },
      ]);
      printer.bold(false);
      printer.invert(false);

      /* ───────────────── Instruction ───────────────── */
      printer.alignCenter();
      printer.setTypeFontB();
      printer.bold(true);
      const instruction = instructions.medicine[index].med
        ? String(
            createInstructionNew(
              instructions.medicine[index].morningDose,
              instructions.medicine[index].afternoonDose,
              instructions.medicine[index].nightDose,
              instructions.medicine[index].duration,
              instructions.medicine[index].notes,
              instructions.medicine[index].sos === "SOS",
            ),
          )
        : "No instruction available.";
      printer.tableCustom([
        {
          text: instruction,
          align: "LEFT",
          width: 1,
          bold: true,
        },
      ]);
      printer.bold(false);

      /* ───────────────── Meta Data ───────────────── */
      printer.setTypeFontB();
      printer.tableCustom([
        {
          text: "Patient :",
          align: "LEFT",
          width: 0.2,
        },
        {
          text: `${instructions.patientName || "Unknown"}`,
          align: "LEFT",
          width: 0.8,
        },
      ]);
      printer.tableCustom([
        {
          text: `${dayjs(new Date()).format("DD-MM-YYYY")} ${dayjs(new Date()).format("HH:mm")}`,
          align: "LEFT",
          width: 0.45,
        },
        {
          text: `Pharm:______________________`,
          align: "LEFT",
          width: 0.55,
        },
      ]);

      /* ───────────────── Footer ───────────────── */
      printer.newLine(); // Ensure space before footer

      /* ───────────────── Cut ───────────────── */
      printer.cut();
      // printer.execute();

      const buffer = printer.getBuffer();
      const escposText = buffer.toString("binary");
      const unicodeEscaped = JSON.stringify(escposText.slice(1, -1));
      console.log(unicodeEscaped);

      return {
        receipt: unicodeEscaped,
        printerName: printerSettings.printerName,
      };
    } catch (error) {
      logger.error(error);
      return { receipt: "", printerName: "" };
    }
  },

  async printInstructionZplOrTSPL(
    instructions: AppointmentDosageDto,
    index: number,
    printerType: "ZPL" | "TSPL" | "XPML",
  ): Promise<{ receipt: string; printerName: string }> {
    if (!instructions.collectionCenter?.id) {
      logger.error("Collection center ID is missing in instructions");
      throw new ErrorHandler(400, "Collection center ID is required");
    }
    const printerSettings =
      await printerSettingService.getSettingsByPrinterTypeAndCC(
        instructions.collectionCenter?.id,
        "LABEL",
      );

    if (!printerSettings) {
      logger.error("Printer settings not found");
      throw new ErrorHandler(404, "Printer settings not found");
    }

    // const ccName = instructions.collectionCenter?.colName ?? "";
    const ccAddress = instructions.collectionCenter?.address ?? "";
    const phone = `Ph : ${instructions.collectionCenter?.phone ?? ""}`;
    const medicineName =
      instructions.medicine[index].med?.medicineName ?? "No Medicine";
    const dosage = createInstructionNew(
      instructions.medicine[index].morningDose,
      instructions.medicine[index].afternoonDose,
      instructions.medicine[index].nightDose,
      instructions.medicine[index].duration,
      instructions.medicine[index].notes,
      instructions.medicine[index].sos === "SOS",
    );
    const patientName = `${instructions.patientName ?? "Unknown"}`;
    const footerSub = "We Medicate & God Heals You";
    let data;
    if (printerType === "ZPL") {
      data = generateZplLabel({
        ccAddress: ccAddress,
        ccName: "Rabito Clinic",
        footer:
          "Do not stop taking your medicine without consulting your doctor",
        footerSub: footerSub,
        phone: phone,
        medicineName: medicineName,
        instructionText: dosage,
        patientName: patientName,
      });
    } else if (printerType === "TSPL") {
      data = generateTSPLLabel({
        ccAddress: ccAddress,
        ccName: "Rabito Clinic",
        footer:
          "Do not stop taking your medicine without consulting your doctor",
        footerSub: footerSub,
        phone: phone,
        medicineName: medicineName,
        instructionText: dosage,
        patientName: patientName,
      });
    } else {
      data = generateXPMLLabel({
        ccAddress: ccAddress,
        ccName: "Rabito Clinic",
        footerSub: footerSub,
        phone: phone,
        medicineName: medicineName,
        instructionText: dosage,
        patientName: patientName,
      });
    }
    console.log(data);

    return { receipt: data, printerName: printerSettings.printerName };
  },
};
