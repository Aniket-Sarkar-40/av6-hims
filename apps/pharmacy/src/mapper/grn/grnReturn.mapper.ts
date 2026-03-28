import { getGrnDetailsByIdFromDb } from "@/repository/grn/grn.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { distributorService } from "@/services/distributor/distributor.service.js";
import { itemService } from "@/services/item/item.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  GoodReceiveReturnDetailDTO,
  GoodReceiveReturnDTO,
  GrnReturnDetailsResponse,
  GrnReturnDetailsResponseBase,
  GrnReturnResponse,
} from "@/types/grn/grnReturn.js";

export const toGrnReturnDTO = async (grnReturn: GrnReturnResponse): Promise<GoodReceiveReturnDTO> => {
  const distributor = await distributorService.getDistributorByIdWoDto(grnReturn.distributorId, true);
  const warehouse = await warehouseService.getWarehouseByIdWoDTO(grnReturn.warehouseId, true);

  const createdBy = grnReturn.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(grnReturn.createdBy, true)
    : null;
  const approvedBy = grnReturn.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(grnReturn.approvedBy, true)
    : null;
  const rejectedBy = grnReturn.rejectedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(grnReturn.rejectedBy, true)
    : null;

  const detailDTO: GoodReceiveReturnDetailDTO[] = await Promise.all(
    grnReturn.goodReceiveReturnDetails.map(async (detail) => {
      const item = await itemService.getItemByIdWoDTO(detail.itemId, true);
      const inHandQty =
        (await getItemStockQtyByBatchWise(
          detail.itemId,
          {
            warehouseId: grnReturn.warehouseId,
          },
          detail.batchNo,
          detail.expiryDate
        )) || null;

      const grnDetails = await getGrnDetailsByIdFromDb(detail.grnDetailId);

      return {
        ...detail,
        inHandQty: inHandQty ? inHandQty : 0,
        returnedQty: grnDetails?.returnQuantity ?? 0,
        item: item,
      };
    })
  );

  return {
    ...grnReturn,
    goodReceiveReturnDetails: detailDTO,
    distributor,
    warehouse,
    createdBy: createdBy,
    approvedBy: approvedBy,
    rejectedBy: rejectedBy,
  };
};

export const toGrnReturnDetailsDTO = async (
  grnReturnDetailsInput: GrnReturnDetailsResponseBase[]
): Promise<GrnReturnDetailsResponse[]> => {
  const items = await itemService.getAllItemWoDto();
  const distributors = await distributorService.getDistributorWoDto(true);
  const warehouses = await warehouseService.getAllWarehouseWoDTO();
  const staffs = await employeeService.getAllEmployeesWoDto();

  return Promise.all(
    grnReturnDetailsInput.map(async (grnReturnDetail) => {
      const item = items.find((item) => item.id === grnReturnDetail.itemId);
      const warehouse = warehouses.find((w) => w.id === grnReturnDetail.goodReceiveReturn.warehouseId) ?? null;
      const distributor = distributors.find((d) => d.id === grnReturnDetail.goodReceiveReturn.distributorId);
      const createdBy = grnReturnDetail.createdBy
        ? (staffs.find((st) => st.id === grnReturnDetail.createdBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(grnReturnDetail.createdBy)) ??
          null)
        : null;

      const approvedBy = grnReturnDetail.goodReceiveReturn.approvedBy
        ? (staffs.find((st) => st.id === grnReturnDetail.goodReceiveReturn.approvedBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(grnReturnDetail.goodReceiveReturn.approvedBy)) ??
          null)
        : null;

      return {
        ...grnReturnDetail,
        item: item ?? null,
        billTo: distributor?.billTo ?? null,
        warehouse,
        createdBy,
        approvedBy,
      };
    })
  );
};
