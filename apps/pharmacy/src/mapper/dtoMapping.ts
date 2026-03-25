import { GrnDetailsResponseBase, GrnResponse } from "@/types/grn/grn.js";
import {
  GrnReturnDetailsResponseBase,
  GrnReturnResponse,
} from "@/types/grn/grnReturn.js";
import { DbInsuranceWithMapping } from "@/types/insurance/insurance.js";
import { BranchResponce } from "@/types/master/branch.js";
import { PurchaseOrderDetailsBase } from "@/types/purchase/purchase.js";
import { GetStoreRequisitionReturnResponse } from "@/types/purchase/requisitionReturn.js";
import {
  ReqItemDetailsResponseBase,
  RequisitionItemDetailResponse,
  StoreRequisitionResponse,
} from "@/types/purchase/storeRequisition.js";
import { SellDetailsResponseBase, SellResponse } from "@/types/sell/sell.js";
import { SellReturnResponse } from "@/types/sell/sellReturn.js";
import { StaffEntity } from "@/types/staff/doctor.js";
import { ItemStockAuditDetails } from "@/types/stock/stock.js";
import { StockAdjustmentResponse } from "@/types/stock/stockAdjustment.js";

import { toExpenseDTO } from "./consumerConnect/expense.mapper.js";
import { toIncomeDTO } from "./consumerConnect/income.mapper.js";
import { toDistributorDto } from "./distributor/distributor.mapper.js";
import { toGatePassDTO } from "./gatePass/gatePass.mapper.js";
import { toGrnDetailsDTO, toGrnDTO } from "./grn/grn.mapper.js";
import {
  toGrnReturnDetailsDTO,
  toGrnReturnDTO,
} from "./grn/grnReturn.mapper.js";
import { toInsuranceDto } from "./insurance/insurance.mapper.js";
import { toPatientDto } from "./insurance/patients.mapper.js";
import { toPatientInsuranceDto } from "./insurance/patientsInsurance.mapper.js";
import { toInTransitStockDTO } from "./inTransitStock/inTransitStock.mapper.js";
import {
  toItemBranchPriceDTO,
  toItemDosageMapDTO,
  toItemDto,
  toItemInstructionMapDTO,
  toItemStockBatchDTO,
  toItemStockDTO,
} from "./item/item.mapper.js";
import { toAutoAlertAuditDTO } from "./master/autoAlert.mapper.js";
import { toBankHeadDTO } from "./master/bankHead.mapper.js";
import { toBranchDTO } from "./master/branch.mapper.js";
import { toCityDTOOnlyForCity } from "./master/city.mapper.js";
import { toCountryDto } from "./master/country.mapper.js";
import { toCountryCodeDTO } from "./master/countryCode.mapper.js";
import { toMedCategoryDTO } from "./master/medCategory.mapper.js";
import { toMobileMoneyMethodDTO } from "./master/mobileMoney.mapper.js";
import { toStateDTOForState } from "./master/state.mapper.js";
import { toStoreDTO } from "./master/store.mapper.js";
import { toUINConfigDTO } from "./master/uinConfig.mapper.js";
import { toWarehouseDTO } from "./master/warehouse.mapper.js";
import {
  toPurchaseOrderDetailsDto,
  toPurchaseOrderDTO,
} from "./purchase/purchase.mapper.js";
import {
  toReqItemDetailsDto,
  toRequisitionItemDetailDTO,
  toStoreRequisitionDTO,
} from "./purchase/storeRequisition.mapper.js";
import { toStoreRequisitionReturnDTO } from "./purchase/storeRequisitionReturn.mapper.js";
import { toSellDetailsDTO, toSellDTO } from "./sell/sell.mapper.js";
import { toSellReturnDTO } from "./sell/sellReturn.mapper.js";
import { toDoctorDTO } from "./staff/doctor.mapper.js";
import { toStockAuditDTO } from "./stock/stock.mapper.js";
import { toStockAdjustmentDTO } from "./stock/stockAdjustment.mapper.js";
import { toStockTransferDTO } from "./stock/stockTransfer.mapper.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import {
  AutoAlertAudit,
  BranchItemMap,
  CashNBankHead,
  City,
  Country,
  CountryCode,
  Distributor,
  Expense,
  Income,
  ItemImages,
  ItemInstructionMap,
  ItemMedicineDosageMap,
  MedCategory,
  MobileMoneyMethod,
  Patient,
  PatientInsurance,
  PmsGatePass,
  PmsInTransitStock,
  PmsItem,
  PmsItemStock,
  PmsPurchaseOrder,
  PmsPurchaseOrderDetails,
  PmsStockTransfer,
  PmsStockTransferDetails,
  PmsUINConfig,
  PmsWarehouse,
  State,
  Store,
} from "@repo/db/generated/prisma/client";

// Define a type for DTO mapping functions.
type DtoMappingFunction = (data: unknown) => unknown;
export const dtoMapping: Record<string, DtoMappingFunction> = {
  [SHORT_CODE.CITY]: (data: unknown) => toCityDTOOnlyForCity(data as City),
  [SHORT_CODE.UIN_CONFIG]: (data: unknown) =>
    toUINConfigDTO(data as PmsUINConfig),
  [SHORT_CODE.STATE]: (data: unknown) => toStateDTOForState(data as State),
  [SHORT_CODE.WAREHOUSE]: (data: unknown) =>
    toWarehouseDTO(data as PmsWarehouse),
  [SHORT_CODE.BRANCH]: (data: unknown) => toBranchDTO(data as BranchResponce),
  [SHORT_CODE.GATE_PASS]: (data: unknown) => toGatePassDTO(data as PmsGatePass),
  [SHORT_CODE.ITEM]: (data: unknown) =>
    toItemDto(data as PmsItem & { itemImages: ItemImages[] }),
  [SHORT_CODE.EXPENSE]: (data: unknown) => toExpenseDTO(data as Expense),
  [SHORT_CODE.INCOME]: (data: unknown) => toIncomeDTO(data as Income),
  [SHORT_CODE.PO]: (data: unknown) =>
    toPurchaseOrderDTO(
      data as PmsPurchaseOrder & {
        purchaseOrderDetails: PmsPurchaseOrderDetails[];
      },
    ),
  [SHORT_CODE.DISTRIBUTOR]: (data: unknown) =>
    toDistributorDto(data as Distributor),
  [SHORT_CODE.GRN]: (data: unknown) => toGrnDTO(data as GrnResponse),
  [SHORT_CODE.GRN_RETURN]: (data: unknown) =>
    toGrnReturnDTO(data as GrnReturnResponse),
  [SHORT_CODE.MED_CATEGORY]: (data: unknown) =>
    toMedCategoryDTO(data as MedCategory),
  [SHORT_CODE.DOCTOR]: (data: unknown) => toDoctorDTO(data as StaffEntity),
  [SHORT_CODE.STORE_REQ]: (data: unknown) =>
    toStoreRequisitionDTO(data as StoreRequisitionResponse),
  [SHORT_CODE.STORE_REQ_ITEM]: (data: unknown) =>
    toRequisitionItemDetailDTO(data as RequisitionItemDetailResponse),
  [SHORT_CODE.SELL_RETURN]: (data: unknown) =>
    toSellReturnDTO(data as SellReturnResponse),
  [SHORT_CODE.SELL]: (data: unknown) => toSellDTO(data as SellResponse),
  [SHORT_CODE.STOCK_TRANS]: (data: unknown) =>
    toStockTransferDTO(
      data as PmsStockTransfer & {
        stockTransferDetails: PmsStockTransferDetails[];
      },
    ),
  [SHORT_CODE.STORE]: (data: unknown) => toStoreDTO(data as Store),
  [SHORT_CODE.MED_DOSAGE_MAP]: (data: unknown) =>
    toItemDosageMapDTO(data as ItemMedicineDosageMap),
  [SHORT_CODE.MED_INST_MAP]: (data: unknown) =>
    toItemInstructionMapDTO(data as ItemInstructionMap),
  [SHORT_CODE.STOCK]: (data: unknown) => toItemStockDTO(data as PmsItemStock),
  [SHORT_CODE.STOCK_BATCH_WISE]: (data: unknown) =>
    toItemStockBatchDTO(data as PmsItemStock[]),
  [SHORT_CODE.ITEM_BRANCH_PRICE]: (data: unknown) =>
    toItemBranchPriceDTO(data as BranchItemMap),
  [SHORT_CODE.PATIENTS]: (data: unknown) => toPatientDto(data as Patient),
  [SHORT_CODE.INSURANCE]: (data: unknown) =>
    toInsuranceDto(data as DbInsuranceWithMapping),
  [SHORT_CODE.STOCK_INT]: (data: unknown) =>
    toInTransitStockDTO(data as PmsInTransitStock),
  [SHORT_CODE.STOCK]: (data: unknown) => toItemStockDTO(data as PmsItemStock),
  [SHORT_CODE.COUNTRY_CODE]: (data: unknown) =>
    toCountryCodeDTO(data as CountryCode),
  [SHORT_CODE.PATIENTS_INSURANCE]: (data: unknown) =>
    toPatientInsuranceDto(data as PatientInsurance),
  [SHORT_CODE.COUNTRY]: (data: unknown) => toCountryDto(data as Country),
  [SHORT_CODE.STOCK_ADJUSTMENT]: (data: unknown) =>
    toStockAdjustmentDTO(data as StockAdjustmentResponse),
  [SHORT_CODE.STOCK_AUDIT]: (data: unknown) =>
    toStockAuditDTO(data as ItemStockAuditDetails),
  [SHORT_CODE.BANK_HEAD]: (data: unknown) =>
    toBankHeadDTO(data as CashNBankHead),
  [SHORT_CODE.MOBILE_MONEY]: (data: unknown) =>
    toMobileMoneyMethodDTO(data as MobileMoneyMethod),
  [SHORT_CODE.STORE_REQ_RETURN]: (data: unknown) =>
    toStoreRequisitionReturnDTO(data as GetStoreRequisitionReturnResponse),
  [SHORT_CODE.AUTO_ALERT_AUDIT]: (data: unknown) =>
    toAutoAlertAuditDTO(data as AutoAlertAudit),
  [SHORT_CODE.SELL_DETAILS]: (data: unknown) =>
    toSellDetailsDTO(data as SellDetailsResponseBase[]),
  [SHORT_CODE.PO_DETAILS]: (data: unknown) =>
    toPurchaseOrderDetailsDto(data as PurchaseOrderDetailsBase[]),
  [SHORT_CODE.GRN_DETAILS]: (data: unknown) =>
    toGrnDetailsDTO(data as GrnDetailsResponseBase[]),
  [SHORT_CODE.GRN_RETURN_DETAILS]: (data: unknown) =>
    toGrnReturnDetailsDTO(data as GrnReturnDetailsResponseBase[]),
  [SHORT_CODE.ST_REQ_DETAILS]: (data: unknown) =>
    toReqItemDetailsDto(data as ReqItemDetailsResponseBase[]),
};
