import { getPOByNumberFromDb } from "@/repository/purchase/purchase.repository.js";
import { distributorService } from "@/services/distributor/distributor.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import { GatePassDto } from "@/types/gatePass/gatePass.js";
import { WarehouseDTO } from "@/types/master/warehouse.js";

import { Distributor, PmsGatePass } from "@repo/db/generated/prisma/client";

export const toGatePassDTO = async (
  gatePass: PmsGatePass,
): Promise<GatePassDto> => {
  const distributorDTO: Distributor | null =
    await distributorService.getDistributorByIdWoDto(
      gatePass.distributorId,
      true,
    );
  const warehouseDTO: WarehouseDTO | null =
    await warehouseService.getWarehouseById(gatePass.warehouseId, true);

  const purchaseOrder = await getPOByNumberFromDb(gatePass.poNumber);
  const createdBy = gatePass.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        gatePass.createdBy,
        true,
      )
    : null;

  return {
    id: gatePass.id,
    date: gatePass.date,
    distributor: distributorDTO,
    warehouse: warehouseDTO,
    totalQuantity: gatePass.totalQuantity,
    poNumber: gatePass.poNumber,
    poDate: gatePass.poDate,
    boxCount: gatePass.boxCount,
    billAmount: gatePass.billAmount.toNumber(),
    gatePassNumber: gatePass.gatePassNumber,
    invoiceNumber: gatePass.invoiceNumber ?? null,
    remarks: gatePass.remarks ?? null,
    priority: gatePass.priority,
    status: gatePass.status,
    createdBy: createdBy,
    purchaseOrder,
  };
};
