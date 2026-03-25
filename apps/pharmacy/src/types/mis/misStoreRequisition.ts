export interface SearchRequestMisStoreRequisition {
  branchId: number;
  pageNo: number;
  pageSize: number;
  searchText?: string;
  sortDir?: "ASC" | "DESC";
}
export interface IStoreRequisitionByItemSummary {
  id: number;
  description: string;
  monthlyDemand: number;
  quarterlyDemand: number;
  requestedQty: number;
  qtyInStore: number;
  unitCost: number;
  total: number;
}
