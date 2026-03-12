export enum PermissionType {
  CREATE = "add",
  VIEW = "view",
  UPDATE = "edit",
  DELETE = "delete",
  APPROVE = "approve",
  REJECT = "reject",
}

export enum PermissionResource {
  // INVENTORY
  SETTING = "settings",
  ITEM_SUPPLIER = "item-supplier",
  ITEM_CATEGORY = "item-category",
  ITEM_STORE = "item-store",
  UNIT_MASTER = "unit-master",
  UIN_CONFIG = "uin-config",
  ITEM_MASTER = "item-master",
  ITEM_SUPPLIER_MAP = "item-supplier-map",
  BRANCH = "branch",
  WAREHOUSE = "warehouse",
  CACHE = "cache",
  PURCHASE_ORDER = "purchase-order",
  ITEM_SEARCH = "item-search",
  GRN = "grn",
  GRN_PDF = "grn-pdf",
  GRN_RETURN = "grn-return",
  GRN_RETURN_APPROVE = "grn-return-approve",
  GRN_RETURN_REJECTED = "grn-return-rejected",
  GRN_RETURN_PDF = "grn-return-pdf",
  STORE_REQUISITION = "store-requisition",
  STORE_REQUISITION_REJECT = "storeRequisition-reject",
  STORE_REQUISITION_SENT = "storeRequisition-sent",
  STORE_REQUISITION_ACK = "storeRequisition-acknowledge",
  LOCATION = "location",
  CONSUMPTION = "consumption",
  ITEM_BATCHES = "item-batch",
  ITEMS_SUP = "items-supplier",
  ITEM_STOCK = "item-stock",
  ITEM_STOCK_SUMMARY = "item-stock-summary",
  CURRENCY = "currency",
  STOCK_ADJUSTMENT = "stock-adjustment",
  COLLECTION_CENTER = "collection-center",

  // CORE
}

export enum PermissionModule {
  PMS = "pms",
  OPD = "opd",
  CORE = "core",
  INV = "inv",
}

export const getPermission = (
  module: keyof typeof PermissionModule,
  resource: keyof typeof PermissionResource,
  type: keyof typeof PermissionType
): string => {
  return `${module}:${PermissionResource[resource]}:${PermissionType[type]}`;
};
