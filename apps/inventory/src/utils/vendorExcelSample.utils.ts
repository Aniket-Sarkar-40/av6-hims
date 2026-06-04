import ExcelJs from "exceljs";

type VendorExcelHeaderStatus = "REQUIRED" | "CONDITIONAL" | "OPTIONAL";

type VendorExcelHeaderGuide = {
  status: VendorExcelHeaderStatus;
  note: string;
};

const VENDOR_HEADER_GUIDE: Record<string, VendorExcelHeaderGuide> = {
  supplierCode: {
    status: "OPTIONAL",
    note: "Optional. If empty, Vendor Code will be generated automatically.",
  },
  name: {
    status: "REQUIRED",
    note: "Required. Vendor Name is mandatory and must be unique.",
  },
  phone: {
    status: "OPTIONAL",
    note: "Optional. If provided, phone number must be unique.",
  },
  email: {
    status: "OPTIONAL",
    note: "Optional. If provided, email must be unique.",
  },
  address: {
    status: "REQUIRED",
    note: "Required. Address is mandatory.",
  },
  billTo: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  shipTo: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  vendorType: {
    status: "OPTIONAL",
    note: "Optional. Must match allowed VendorType enum value if provided.",
  },

  salesPerson: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  salesPersonPhone: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  salesPersonEmail: {
    status: "OPTIONAL",
    note: "Optional.",
  },

  proprietaryPersonName: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  proprietaryPersonPhone: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  proprietaryPersonEmail: {
    status: "OPTIONAL",
    note: "Optional.",
  },

  termsAndCondition: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  stockShipmentDetails: {
    status: "OPTIONAL",
    note: "Optional.",
  },

  contactPersonName: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  contactPersonPhone: {
    status: "OPTIONAL",
    note: "Optional.",
  },
  contactPersonEmail: {
    status: "OPTIONAL",
    note: "Optional.",
  },

  accountNo: {
    status: "CONDITIONAL",
    note: "Bank details are optional. If any bank field is filled, Bank Account No is required.",
  },
  accountHolderName: {
    status: "OPTIONAL",
    note: "Optional bank field.",
  },
  typeOfAccount: {
    status: "OPTIONAL",
    note: "Optional bank field.",
  },
  ifscCode: {
    status: "CONDITIONAL",
    note: "Bank details are optional. If any bank field is filled, IFSC Code is required.",
  },
  bankName: {
    status: "CONDITIONAL",
    note: "Bank details are optional. If any bank field is filled, Bank Name is required.",
  },
  bankAddress: {
    status: "OPTIONAL",
    note: "Optional bank field.",
  },

  taxIdentificationName: {
    status: "CONDITIONAL",
    note: "Tax details are optional. If any tax field is filled, Tax Identification Name is required.",
  },
  taxIdentificationValue: {
    status: "CONDITIONAL",
    note: "Tax details are optional. If any tax field is filled, Tax Identification Value is required.",
  },
  taxIdentificationNumber: {
    status: "OPTIONAL",
    note: "Optional tax field.",
  },
};

const shouldShowVendorHeaderStar = (status: VendorExcelHeaderStatus) => {
  return status === "REQUIRED" || status === "CONDITIONAL";
};

const getVendorHeaderStatusLabel = (status: VendorExcelHeaderStatus) => {
  if (status === "REQUIRED") return "Required";
  if (status === "CONDITIONAL") return "Required if section is used";
  return "Optional";
};

export const addVendorHeaderStarAndNotes = (ws: ExcelJs.Worksheet) => {
  const headerRow = ws.getRow(1);

  headerRow.eachCell((cell, colNumber) => {
    const column = ws.getColumn(colNumber);
    const key = column.key as string | undefined;
    const guide = key ? VENDOR_HEADER_GUIDE[key] : undefined;

    if (!guide) return;

    const currentHeader = String(cell.value ?? "").trim();

    if (
      shouldShowVendorHeaderStar(guide.status) &&
      !currentHeader.endsWith("*")
    ) {
      cell.value = `${currentHeader} *`;
    }

    (cell as ExcelJs.Cell).note = `${getVendorHeaderStatusLabel(
      guide.status
    )}\n\n${guide.note}`;
  });
};

export const addVendorImportInstructionSheet = (wb: ExcelJs.Workbook) => {
  const instructionWs = wb.addWorksheet("Instructions", {
    properties: {
      defaultRowHeight: 20,
    },
  });

  instructionWs.columns = [
    { header: "Type", key: "type", width: 32 },
    { header: "Meaning", key: "meaning", width: 100 },
  ];

  instructionWs.mergeCells("A1:B1");
  instructionWs.getCell("A1").value = "Vendor Import Guide";
  instructionWs.getCell("A1").font = {
    name: "Calibri",
    size: 15,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  instructionWs.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F81BD" },
  };
  instructionWs.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  instructionWs.getRow(1).height = 28;

  instructionWs.mergeCells("A2:B2");
  instructionWs.getCell("A2").value =
    "Use the Vendor sheet for import. Fields marked with * need attention. Hover over Vendor sheet headers to see details.";
  instructionWs.getCell("A2").font = {
    name: "Calibri",
    size: 10,
    italic: true,
    color: { argb: "FF404040" },
  };
  instructionWs.getCell("A2").alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true,
  };
  instructionWs.getRow(2).height = 30;

  const tableHeaderRow = instructionWs.getRow(4);
  tableHeaderRow.getCell(1).value = "Type";
  tableHeaderRow.getCell(2).value = "Meaning";

  tableHeaderRow.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  tableHeaderRow.height = 22;

  const instructionRows = [
    {
      type: "Required *",
      meaning: "Always required. Vendor Name and Address must be provided.",
    },
    {
      type: "Required if section is used *",
      meaning:
        "Bank and Tax fields are optional as a section. But if you fill any value in that section, some fields become required.",
    },
    {
      type: "Bank Details",
      meaning:
        "If any bank field is filled, Bank Account No, IFSC Code, and Bank Name are required.",
    },
    {
      type: "Tax Details",
      meaning:
        "If any tax field is filled, Tax Identification Name and Tax Identification Value are required.",
    },
    {
      type: "Optional",
      meaning: "Fields without * can be left empty.",
    },
    {
      type: "Vendor Code",
      meaning:
        "Optional. If empty, the system will generate Vendor Code automatically.",
    },
    {
      type: "Duplicate Validation",
      meaning:
        "Vendor Code, Vendor Name, Phone, and Email are checked during batch import. Duplicate rows will fail in Batch Job Details.",
    },
    {
      type: "Important",
      meaning:
        "Do not rename column headers. The system supports the generated * markers automatically during import.",
    },
  ];

  instructionRows.forEach((item, index) => {
    const row = instructionWs.addRow(item);

    row.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        size: 10,
        color: { argb: "FF1F2937" },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (index % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF7FBFF" },
        };
      }
    });

    row.getCell(1).font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FF1F2937" },
    };
  });

  instructionWs.views = [{ state: "frozen", ySplit: 4 }];

  instructionWs.pageSetup = {
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    orientation: "landscape",
  };
};
