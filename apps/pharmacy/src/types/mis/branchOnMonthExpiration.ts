export interface BranchOnMonthExpiration {
  id: number;
  itemName: string;
  physicalQty: number;
  expiryDate: Date;
  sellingPrice: number;
  total: number;
  batch: string;
  branch: string;
}

export interface BranchOnMonthExpirationAmt {
  branch: string;
  amount: number;
}

export interface HighestDrugSold {
  id: number;
  date: Date;
  itemName: string;
  category: string;
  quantitySold: number;
  mrp: number;
  total: number;
}

export interface HighestDrugSoldReq extends SearchReqExcelWithDateRange {
  id: number;
}

export interface SearchReqExcel {
  pageNo: number;
  pageSize: number;
  searchText?: string;
  sortDir?: "ASC" | "DESC";
  categoryId?: number;
}

export interface SearchReqExcelWithDateRange extends SearchReqExcel {
  startDate?: Date;
  endDate?: Date;
}
