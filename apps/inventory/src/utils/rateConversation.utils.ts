import { CreateGrnInput, GrnPdfDTO } from "@/types/grn/grn.js";
import {
  CreateGrnReturnInput,
  GoodReceiveReturnDTO,
} from "@/types/grn/grnReturn.js";
import {
  CreatePurchaseOrderInput,
  PurchaseOrderPdfDTO,
} from "@/types/purchase/purchase.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import { DiscMethod, RoundFormat } from "@repo/db/generated/prisma/enums.js";
import { applyRound } from "av6-utils";

type RateConversionRoundOptions = {
  roundFormat: RoundFormat;
  precision: number;
};

const convertAmountByRate = (
  amount: number,
  conversionRate: number,
  roundOptions: RateConversionRoundOptions
): number => {
  return applyRound(
    amount * conversionRate,
    roundOptions.roundFormat,
    roundOptions.precision
  );
};

const reverseConvertAmountByRate = (
  amount: number,
  conversionRate: number,
  roundOptions: RateConversionRoundOptions
): Prisma.Decimal => {
  return new Prisma.Decimal(
    applyRound(
      amount / conversionRate,
      roundOptions.roundFormat,
      roundOptions.precision
    )
  );
};

export const applyGrnRateConversion = (
  body: CreateGrnInput,
  roundOptions: RateConversionRoundOptions
): CreateGrnInput => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = convertAmountByRate(
    Number(body.totalAmount),
    conversionRate,
    roundOptions
  );

  body.paidAmount = body.paidAmount
    ? convertAmountByRate(Number(body.paidAmount), conversionRate, roundOptions)
    : body.paidAmount;

  body.returnedAmount = body.returnedAmount
    ? convertAmountByRate(
        Number(body.returnedAmount),
        conversionRate,
        roundOptions
      )
    : body.returnedAmount;

  body.netTotal = convertAmountByRate(
    Number(body.netTotal),
    conversionRate,
    roundOptions
  );

  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? convertAmountByRate(
            Number(body.discount),
            conversionRate,
            roundOptions
          )
        : body.discount
      : body.discount;

  body.netDiscount = body.netDiscount
    ? convertAmountByRate(
        Number(body.netDiscount),
        conversionRate,
        roundOptions
      )
    : body.netDiscount;

  body.netTax = convertAmountByRate(
    Number(body.netTax),
    conversionRate,
    roundOptions
  );

  body.goodReceiveDetails = body.goodReceiveDetails?.map((detail) => ({
    ...detail,
    purchasedPrice: convertAmountByRate(
      Number(detail.purchasedPrice),
      conversionRate,
      roundOptions
    ),
    totalAmount: convertAmountByRate(
      Number(detail.totalAmount),
      conversionRate,
      roundOptions
    ),
    netAmount: convertAmountByRate(
      Number(detail.netAmount),
      conversionRate,
      roundOptions
    ),
    netDiscount: convertAmountByRate(
      Number(detail.netDiscount),
      conversionRate,
      roundOptions
    ),

    discount:
      detail.discountMethod === DiscMethod.FIXED
        ? detail.discount
          ? convertAmountByRate(
              Number(detail.discount),
              conversionRate,
              roundOptions
            )
          : detail.discount
        : detail.discount,

    netTax: convertAmountByRate(
      Number(detail.netTax),
      conversionRate,
      roundOptions
    ),
  }));

  return body;
};

export const applyGrnReturnRateConversion = (
  body: CreateGrnReturnInput,
  roundOptions: RateConversionRoundOptions
): CreateGrnReturnInput => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = convertAmountByRate(
    Number(body.totalAmount),
    conversionRate,
    roundOptions
  );
  body.paidAmount = body.paidAmount
    ? convertAmountByRate(Number(body.paidAmount), conversionRate, roundOptions)
    : body.paidAmount;
  body.netTotal = convertAmountByRate(
    Number(body.netTotal),
    conversionRate,
    roundOptions
  );
  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? convertAmountByRate(
            Number(body.discount),
            conversionRate,
            roundOptions
          )
        : body.discount
      : body.discount;
  body.netDiscount = body.netDiscount
    ? convertAmountByRate(
        Number(body.netDiscount),
        conversionRate,
        roundOptions
      )
    : body.netDiscount;
  body.netTax = convertAmountByRate(
    Number(body.netTax),
    conversionRate,
    roundOptions
  );

  body.goodReceiveReturnDetails = body.goodReceiveReturnDetails?.map(
    (detail) => ({
      ...detail,
      purchasedPrice: convertAmountByRate(
        Number(detail.purchasedPrice),
        conversionRate,
        roundOptions
      ),
      totalAmount: convertAmountByRate(
        Number(detail.totalAmount),
        conversionRate,
        roundOptions
      ),
      netAmount: convertAmountByRate(
        Number(detail.netAmount),
        conversionRate,
        roundOptions
      ),
      netDiscount: convertAmountByRate(
        Number(detail.netDiscount),
        conversionRate,
        roundOptions
      ),
      discount:
        detail.discountMethod === DiscMethod.FIXED
          ? detail.discount
            ? convertAmountByRate(
                Number(detail.discount),
                conversionRate,
                roundOptions
              )
            : detail.discount
          : detail.discount,
      netTax: convertAmountByRate(
        Number(detail.netTax),
        conversionRate,
        roundOptions
      ),
    })
  );

  return body;
};

export const applyGrnRateReverseConversion = (
  body: GrnPdfDTO,
  roundOptions: RateConversionRoundOptions
): GrnPdfDTO => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = reverseConvertAmountByRate(
    Number(body.totalAmount),
    conversionRate,
    roundOptions
  );

  body.paidAmount = body.paidAmount
    ? reverseConvertAmountByRate(
        Number(body.paidAmount),
        conversionRate,
        roundOptions
      )
    : body.paidAmount;

  body.returnedAmount = body.returnedAmount
    ? reverseConvertAmountByRate(
        Number(body.returnedAmount),
        conversionRate,
        roundOptions
      )
    : body.returnedAmount;

  body.netTotal = reverseConvertAmountByRate(
    Number(body.netTotal),
    conversionRate,
    roundOptions
  );

  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? reverseConvertAmountByRate(
            Number(body.discount),
            conversionRate,
            roundOptions
          )
        : body.discount
      : body.discount;

  body.netDiscount = body.netDiscount
    ? reverseConvertAmountByRate(
        Number(body.netDiscount),
        conversionRate,
        roundOptions
      )
    : body.netDiscount;

  body.netTax = reverseConvertAmountByRate(
    Number(body.netTax),
    conversionRate,
    roundOptions
  );

  body.goodReceiveDetails = body.goodReceiveDetails?.map((detail) => ({
    ...detail,
    purchasedPrice: reverseConvertAmountByRate(
      Number(detail.purchasedPrice),
      conversionRate,
      roundOptions
    ),
    totalAmount: reverseConvertAmountByRate(
      Number(detail.totalAmount),
      conversionRate,
      roundOptions
    ),
    netAmount: reverseConvertAmountByRate(
      Number(detail.netAmount),
      conversionRate,
      roundOptions
    ),
    netDiscount: reverseConvertAmountByRate(
      Number(detail.netDiscount),
      conversionRate,
      roundOptions
    ),

    discount:
      detail.discountMethod === DiscMethod.FIXED
        ? detail.discount
          ? reverseConvertAmountByRate(
              Number(detail.discount),
              conversionRate,
              roundOptions
            )
          : detail.discount
        : detail.discount,

    netTax: reverseConvertAmountByRate(
      Number(detail.netTax),
      conversionRate,
      roundOptions
    ),
  }));

  return body;
};

export const applyGrnReturnRateReverseConversion = (
  body: GoodReceiveReturnDTO,
  roundOptions: RateConversionRoundOptions
): GoodReceiveReturnDTO => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = reverseConvertAmountByRate(
    Number(body.totalAmount),
    conversionRate,
    roundOptions
  );
  body.paidAmount = body.paidAmount
    ? reverseConvertAmountByRate(
        Number(body.paidAmount),
        conversionRate,
        roundOptions
      )
    : body.paidAmount;
  body.netTotal = reverseConvertAmountByRate(
    Number(body.netTotal),
    conversionRate,
    roundOptions
  );
  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? Number(
            reverseConvertAmountByRate(
              body.discount,
              conversionRate,
              roundOptions
            )
          )
        : body.discount
      : body.discount;
  body.netDiscount = body.netDiscount
    ? reverseConvertAmountByRate(
        Number(body.netDiscount),
        conversionRate,
        roundOptions
      )
    : body.netDiscount;
  body.netTax = reverseConvertAmountByRate(
    Number(body.netTax),
    conversionRate,
    roundOptions
  );

  body.goodReceiveReturnDetails = body.goodReceiveReturnDetails?.map(
    (detail) => ({
      ...detail,
      totalAmount: reverseConvertAmountByRate(
        Number(detail.totalAmount),
        conversionRate,
        roundOptions
      ),
      netAmount: reverseConvertAmountByRate(
        Number(detail.netAmount),
        conversionRate,
        roundOptions
      ),
      netDiscount: reverseConvertAmountByRate(
        Number(detail.netDiscount),
        conversionRate,
        roundOptions
      ),
      discount:
        detail.discountMethod === DiscMethod.FIXED
          ? detail.discount
            ? reverseConvertAmountByRate(
                Number(detail.discount),
                conversionRate,
                roundOptions
              )
            : detail.discount
          : detail.discount,
      netTax: reverseConvertAmountByRate(
        Number(detail.netTax),
        conversionRate,
        roundOptions
      ),
    })
  );

  return body;
};

export const applyPurchaseOrderRateConversion = (
  body: CreatePurchaseOrderInput,
  roundOptions: RateConversionRoundOptions
): CreatePurchaseOrderInput => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.grandTotal = convertAmountByRate(
    Number(body.grandTotal),
    conversionRate,
    roundOptions
  );

  body.purchaseOrderDetails = body.purchaseOrderDetails?.map((detail) => ({
    ...detail,
    purchasedPrice: convertAmountByRate(
      Number(detail.purchasedPrice),
      conversionRate,
      roundOptions
    ),
    totalAmount: convertAmountByRate(
      Number(detail.totalAmount),
      conversionRate,
      roundOptions
    ),
  }));

  return body;
};

export const applyPurchaseOrderReverseRateConversion = (
  body: PurchaseOrderPdfDTO,
  roundOptions: RateConversionRoundOptions
): PurchaseOrderPdfDTO => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.grandTotal = reverseConvertAmountByRate(
    Number(body.grandTotal),
    conversionRate,
    roundOptions
  );

  body.purchaseOrderDetails = body.purchaseOrderDetails?.map((detail) => ({
    ...detail,
    purchasedPrice: reverseConvertAmountByRate(
      Number(detail.purchasedPrice),
      conversionRate,
      roundOptions
    ),
    totalAmount: reverseConvertAmountByRate(
      Number(detail.totalAmount),
      conversionRate,
      roundOptions
    ),
  }));

  return body;
};
