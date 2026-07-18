import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { distributorService } from "@/services/distributor/distributor.service.js";
import { itemService } from "@/services/item/item.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  GrnDetailDTO,
  GrnDetailsResponse,
  GrnDetailsResponseBase,
  GrnDTO,
  GrnResponse,
} from "@/types/grn/grn.js";

export const toGrnDTO = async (grn: GrnResponse): Promise<GrnDTO> => {
  const distributorDTO = await distributorService.getDistributorByIdWoDto(
    grn.distributorId,
    true,
  );
  const warehouseDTO = await warehouseService.getWarehouseById(
    grn.warehouseId,
    true,
  );

  const createdBy = grn.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(grn.createdBy, true)
    : null;

  const detailDTO: GrnDetailDTO[] = await Promise.all(
    grn.goodReceiveDetails.map(async (detail) => {
      const item = await itemService.getItemByIdWoDTO(detail.itemId, true);
      const inHandQty =
        (await getItemStockQtyByBatchWise(
          detail.itemId,
          {
            warehouseId: grn.warehouseId,
          },
          detail.batchNo,
          detail.expiryDate,
        )) || null;

      return {
        ...detail,
        item: item,
        inHandQty: inHandQty ? inHandQty : 0,
      };
    }),
  );

  return {
    ...grn,
    distributor: distributorDTO,
    warehouse: warehouseDTO,
    createdBy: createdBy,
    goodReceiveDetails: detailDTO,
  };
};

export const toGrnDetailsDTO = async (
  grnDetailsInput: GrnDetailsResponseBase[],
): Promise<GrnDetailsResponse[]> => {
  const items = await itemService.getAllItemWoDto();
  const distributors = await distributorService.getDistributorWoDto(true);
  const warehouses = await warehouseService.getAllWarehouseWoDTO();
  const staffs = await employeeService.getAllEmployeesWoDto();

  return Promise.all(
    grnDetailsInput.map(async (grnDetail) => {
      const warehouse =
        warehouses.find((w) => w.id === grnDetail.goodReceive.warehouseId) ??
        null;
      const item = items.find((item) => item.id === grnDetail.itemId);
      const distributor = distributors.find(
        (d) => d.id === grnDetail.goodReceive.distributorId,
      );
      const createdBy = grnDetail.createdBy
        ? (staffs.find((st) => st.id === grnDetail.createdBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            grnDetail.createdBy,
          )) ??
          null)
        : null;

      return {
        ...grnDetail,
        item: item ?? null,
        billTo: distributor?.billTo ?? null,
        warehouse,
        createdBy,
      };
    }),
  );
};
