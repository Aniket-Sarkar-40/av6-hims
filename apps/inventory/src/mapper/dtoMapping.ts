import {
  toBranchRequisitionDetailDTO,
  toBranchRequisitionDTO,
} from "@/mapper/purchase/branchRequisition.mapper.js";
import {
  toBranchRequisitionReturnDTO,
  toBranchReturnDetailDTO,
} from "@/mapper/purchase/branchRequisitionReturn.mapper.js";
import {
  toStoreRequisitionReturnDetailDTO,
  toStoreRequisitionReturnDTO,
} from "@/mapper/purchase/storeRequisitionReturn.mapper.js";
import { ConsumptionResponse } from "@/types/consumption/consumption.js";
import { GrnResponse } from "@/types/grn/grn.js";
import { GrnReturnResponse } from "@/types/grn/grnReturn.js";
import { BranchResponse } from "@/types/master/branch.js";
import { ItemSupplierResponse } from "@/types/master/itemSupplier.js";
import { WarehouseResponse } from "@/types/master/warehouse.js";
import { BranchRequisitionResponse } from "@/types/purchase/branchRequisition.js";
import { GetBranchRequisitionReturnResponse } from "@/types/purchase/branchRequisitionReturn.js";
import {
  PurchaseOrderDetailResponse,
  PurchaseOrderWithDetails,
} from "@/types/purchase/purchase.js";
import { StoreRequisitionResponse } from "@/types/purchase/storeRequisition.js";
import { GetStoreRequisitionReturnResponse } from "@/types/purchase/storeRequisitionReturn.js";
import { StockAdjustmentResponse } from "@/types/stock/stockAdjustment.js";
import {
  InvGoodReceiveReturnDetails,
  InvInTransitStock,
  InvItem,
  InvItemStock,
  InvItemStore,
  InvItemSupplierMapping,
  InvUINConfig,
  InvUnitMaster,
  RequisitionReturnItemDetails,
} from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { toUINConfigDTO } from "av6-core-v2";
import { toConsumptionDTO } from "./consumption/consumption.mapper.js";
import { toGrnDTO } from "./grn/grn.mapper.js";
import {
  toGrnReturnDetailsDto,
  toGrnReturnDTO,
} from "./grn/grnReturn.mapper.js";
import { toInTransitStockDTO } from "./inTransitStock/inTransitStock.mapper.js";
import { toItemSupplierMapDTO } from "./itemSupplierMap/itemSupplierMap.mapper.js";
import { toBranchDTO } from "./master/branch.mapper.js";
import { toItemMasterDTO } from "./master/itemMaster.mapper.js";
import { toItemStoreDTO } from "./master/itemStore.mapper.js";
import { toItemSupplierDTO } from "./master/itemSupplier.mapper.js";
import { toWarehouseDTO } from "./master/warehouse.mapper.js";
import {
  toPurchaseOrderDetailsDto,
  toPurchaseOrderDTO,
} from "./purchase/purchase.mapper.js";
import {
  toStoreRequisitionDetailDTO,
  toStoreRequisitionDTO,
} from "./purchase/storeRequisition.mapper.js";
import { toStockDTO } from "./stock/stock.mapper.js";
import { toStockAdjustmentDTO } from "./stock/stockAdjustment.mapper.js";
import { toUnitMasterDto } from "@/mapper/master/unitMaster.mapper.js";

// Define a type for DTO mapping functions.
type DtoMappingFunction = (data: unknown) => unknown;
export const dtoMapping: Record<string, DtoMappingFunction> = {
  [SHORT_CODE.UIN_CONFIG]: (data: unknown) =>
    toUINConfigDTO(data as InvUINConfig),
  [SHORT_CODE.ITEM]: (data: unknown) => toItemMasterDTO(data as InvItem[]),
  [SHORT_CODE.BRANCH]: (data: unknown) => toBranchDTO(data as BranchResponse[]),
  [SHORT_CODE.WAREHOUSE]: (data: unknown) =>
    toWarehouseDTO(data as WarehouseResponse[]),
  [SHORT_CODE.ITEM_STORE]: (data: unknown) =>
    toItemStoreDTO(data as InvItemStore[]),
  [SHORT_CODE.GRN]: (data: unknown) => toGrnDTO(data as GrnResponse[]),
  [SHORT_CODE.GRN_RETURN]: (data: unknown) =>
    toGrnReturnDTO(data as GrnReturnResponse[]),
  [SHORT_CODE.ITEM_SUPPLIER]: (data: unknown) =>
    toItemSupplierDTO(data as ItemSupplierResponse[]),
  [SHORT_CODE.ITEM_SUPPLIER_MAP]: (data: unknown) =>
    toItemSupplierMapDTO(data as InvItemSupplierMapping[]),
  [SHORT_CODE.CONSUMPTION]: (data: unknown) =>
    toConsumptionDTO(data as ConsumptionResponse[]),
  [SHORT_CODE.STOCK]: (data: unknown) => toStockDTO(data as InvItemStock[]),
  [SHORT_CODE.ST_REQ]: (data: unknown) =>
    toStoreRequisitionDTO(data as StoreRequisitionResponse[]),
  [SHORT_CODE.PO]: (data: unknown) =>
    toPurchaseOrderDTO(data as PurchaseOrderWithDetails[]),
  [SHORT_CODE.IN_TRANSIT_STOCK]: (data: unknown) =>
    toInTransitStockDTO(data as InvInTransitStock[]),
  [SHORT_CODE.STOCK_ADJUSTMENT]: (data: unknown) =>
    toStockAdjustmentDTO(data as StockAdjustmentResponse[]),
  [SHORT_CODE.BRANCH_REQ]: (data: unknown) =>
    toBranchRequisitionDTO(data as BranchRequisitionResponse[]),
  [SHORT_CODE.ST_REQ_RET]: (data: unknown) =>
    toStoreRequisitionReturnDTO(data as GetStoreRequisitionReturnResponse),
  [SHORT_CODE.BRANCH_REQ_RETURN]: (data: unknown) =>
    toBranchRequisitionReturnDTO(data as GetBranchRequisitionReturnResponse),
  [SHORT_CODE.PO_DETAILS]: (data: unknown) =>
    toPurchaseOrderDetailsDto(data as PurchaseOrderDetailResponse[]),
  [SHORT_CODE.ST_REQ_DETAILS]: (data: unknown) =>
    toStoreRequisitionDetailDTO(data as StoreRequisitionResponse[]),
  [SHORT_CODE.BRANCH_REQ_DETAILS]: (data: unknown) =>
    toBranchRequisitionDetailDTO(data as BranchRequisitionResponse[]),
  [SHORT_CODE.ST_REQ_RETURN_DETAILS]: (data: unknown) =>
    toStoreRequisitionReturnDetailDTO(data as RequisitionReturnItemDetails[]),
  [SHORT_CODE.BRANCH_REQ_RETURN_DETAILS]: (data: unknown) =>
    toBranchReturnDetailDTO(data as GetBranchRequisitionReturnResponse[]),
  [SHORT_CODE.GRN_RETURN_DETAILS]: (data: unknown) =>
    toGrnReturnDetailsDto(data as InvGoodReceiveReturnDetails[]),
  [SHORT_CODE.UNIT_MASTER]: (data: unknown) =>
    toUnitMasterDto(data as InvUnitMaster[]),
};
