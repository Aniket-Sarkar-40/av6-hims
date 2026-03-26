import { settingsService } from "@/services/master/settings.service.js";
import {
  CollectionCenterApiRow,
  CollectionCenterResolved,
} from "@/types/common.js";
import { getBranchAndWarehouseByCcIds } from "@/utils/getCollectionCenter.utils.js";

export const resolveCollectionCenters = async (
  rows: CollectionCenterApiRow[],
): Promise<CollectionCenterResolved[]> => {
  // de-dup ids just in case
  const ids = Array.from(new Set(rows.map((r) => r.id)));
  const map = await getBranchAndWarehouseByCcIds(ids); // Record<ccId, { branch, warehouse }>

  const ccSettings = await settingsService.getSettings(true);
  const warehouseMode = ccSettings?.warehouseMode || false;

  return rows
    .map(({ id, name, type }): CollectionCenterResolved | null => {
      const hit = map[id];
      if (!hit || (!hit.branch && !hit.warehouse)) return null;
      if (warehouseMode) {
        if (!hit.warehouse && !hit.branch) return null;
      } else {
        if (!hit.branch) return null;
      }

      let resolvedType = type;
      if (!resolvedType) {
        if (ccSettings?.warehouseMode) {
          resolvedType = hit.warehouse ? "Warehouse" : "Branch";
        } else {
          resolvedType = "Branch";
        }
      }

      const branch = resolvedType === "Branch" ? hit.branch : null;
      const warehouse = resolvedType === "Warehouse" ? hit.warehouse : null;

      if (type === "Branch" && !branch) return null;
      if (type === "Warehouse" && !warehouse) return null;

      const actualName = branch?.name || warehouse?.name || name;
      return { id, name: actualName, type: resolvedType, branch, warehouse };
    })
    .filter((x): x is CollectionCenterResolved => x !== null);
};
