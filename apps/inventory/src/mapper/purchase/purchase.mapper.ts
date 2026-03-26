import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { itemStoreService } from "@/services/master/itemStore.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { settingsService } from "@/services/master/settings.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  PurchaseOrderDetailDTO,
  PurchaseOrderDTO,
  PurchaseOrderWithDetails,
} from "@/types/purchase/purchase.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { customOmit, omitAudit, toIdValue } from "av6-utils";
import { itemMasterToDto } from "../master/itemMaster.mapper.js";

export const toPurchaseOrderDTO = async (
  purchaseOrders: PurchaseOrderWithDetails[],
): Promise<PurchaseOrderDTO[]> => {
  const suppliers = await itemSupplierService.getAllItemSupplier(true);
  const stores = await itemStoreService.getAllItemStore(true);
  const warehouses = await warehouseService.getAllWarehouse(true);
  const branches = await branchService.getAllBranch(true);
  const settings = await settingsService.getSettings();
  const warehouseMode = settings?.warehouseMode;

  return Promise.all(
    purchaseOrders.map(async (po) => {
      const omittedPo = customOmit<
        PurchaseOrderWithDetails,
        "purchaseOrderDetails"
      >(po, ["purchaseOrderDetails"]);
      let warehouse, branch;

      if (warehouseMode && po.ccId) {
        warehouse = warehouses.find((wh) => wh.id === po.ccId);
      } else if (!warehouseMode && po.ccId) {
        branch = branches.find((br) => br.id === po.ccId);
      }

      const supplierDTO = suppliers.find(
        (supplier) => supplier.id === po.supplierId,
      );
      const storeDTO = stores.find((store) => store.id === po.storeId);

      const createdBy = po.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(po.createdBy, true)
        : null;
      const updatedBy = po.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(po.updatedBy, true)
        : null;

      const detailDTO: PurchaseOrderDetailDTO[] = await Promise.all(
        po.purchaseOrderDetails.map(async (detail) => {
          const itemDTO = detail.itemId
            ? await itemMasterService.getItemMasterById(
                { itemId: detail.itemId },
                true,
              )
            : null;
          const createdBy = detail.createdBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.createdBy,
                true,
              )
            : null;
          const updatedBy = detail.updatedBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.updatedBy,
                true,
              )
            : null;

          return {
            ...detail,
            item: itemDTO ? await itemMasterToDto(itemDTO) : null,
            createdBy: createdBy,
            updatedBy: updatedBy,
          };
        }),
      );

      return {
        ...omittedPo.rest,
        store: toIdValue(storeDTO, "itemStoreName"),
        supplier: toIdValue(supplierDTO, "name"),
        warehouse: toIdValue(warehouse, "name"),
        branch: toIdValue(branch, "name"),
        createdBy: omitAudit(createdBy),
        updatedBy: omitAudit(updatedBy),
        purchaseOrderDetails: omitAudit(detailDTO),
      };
    }),
  );
};
