import { BranchOrWarehouseDTO } from "@/types/master/collectionCenter.js";
import { BranchDTO } from "@/types/master/branch.js";
import { WarehouseDTO } from "@/types/master/warehouse.js";

export const toBranchOrWarehouseDto = async (
  branches: BranchDTO[],
  warehouses: WarehouseDTO[]
): Promise<BranchOrWarehouseDTO[]> => {
  const branchItems = await Promise.all(
    branches.map(
      async (branch): Promise<BranchOrWarehouseDTO> => ({
        id: branch.id,
        type: "Branch",
        name: branch.name,
        branch: branch,
        warehouse: null,
      })
    )
  );

  const warehouseDtos = await Promise.all(
    warehouses.map(
      async (warehouse): Promise<BranchOrWarehouseDTO> => ({
        id: warehouse.id,
        type: "Warehouse",
        name: warehouse.name,
        warehouse: warehouse,
        branch: null,
      })
    )
  );

  return [...warehouseDtos, ...branchItems];
};
