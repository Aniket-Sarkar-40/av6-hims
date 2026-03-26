import { subItemStock } from "@/repository/stock/stock.repository.js";
import { SellStockAdjustmentInput } from "@/types/sell/sell.js";
import { db } from "@repo/db";
export const sellStockAdjustment = async (input: SellStockAdjustmentInput) => {
  const { id, type, sell } = input;
  if (type === "SELL") {
    await db.$transaction(async (tx) => {
      for (const detail of sell.sellDetails) {
        await subItemStock(
          tx,
          {
            itemId: detail.itemId,
            quantity: detail.quantity,
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate ?? undefined,
            branchId: sell.ccId,
            isFoc: detail.isFoc,
          },
          {
            operation: "SELL",
            refId: sell.id,
            refDetailsId: detail.id,
            refNo: sell.sellRefNo,
            refDate: sell.billDate,
            refApprovedBy: undefined,
            refApprovedAt: undefined,
            createdBy: sell.createdBy?.id ?? undefined,
          },
        );
      }
      await tx.pmsSell.update({
        where: {
          id,
        },
        data: {
          isStockAdjusted: true,
        },
      });
    });

    return true;
  } else if (type === "SELL_RETURN") {
    // const sellReturn = await sellReturnService.getSellReturnById(id);
    // if (!sellReturn) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell Return"));

    // await db.$transaction(async (tx) => {
    //   for (const detail of sellReturn.sellReturnDetails) {
    //     await addItemStock(
    //       tx,
    //       {
    //         itemId: detail.itemId,
    //         quantity: detail.quantity,
    //         batchNo: detail.batchNo,
    //         branchId: sellReturn.ccId,
    //         expiryDate: detail.expiryDate ?? undefined,
    //         isFoc: detail.isFoc,
    //       },
    //       {
    //         operation: "SELL_RETURN_APPROVAL",
    //         refId: sellReturn.id,
    //         refDetailsId: detail.id,
    //         refNo: sellReturn.sellNumber,
    //         refDate: sellReturn.billDate,
    //         refApprovedBy: sellReturn.approvedBy?.id,
    //         refApprovedAt: sellReturn.approvedAt ?? new Date(),
    //       }
    //     );
    //   }
    // });

    return false;
  } else {
    return false;
  }
};
