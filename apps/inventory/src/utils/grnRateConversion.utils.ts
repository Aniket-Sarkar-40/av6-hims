import { CreateGrnInput, GrnDTO } from "@/types/grn/grn.js";
import {
  CreateGrnReturnInput,
  GoodReceiveReturnDTO,
} from "@/types/grn/grnReturn.js";
import { DiscMethod } from "@repo/db/generated/prisma/enums.js";
import { applyRound, RoundFormat } from "av6-utils";

type GrnRateConversionRoundOptions = {
  roundFormat: RoundFormat;
  precision: number;
};

const convertGrnAmountByRate = (
  amount: number,
  conversionRate: number,
  roundOptions: GrnRateConversionRoundOptions
): number => {
  return applyRound(
    amount * conversionRate,
    roundOptions.roundFormat,
    roundOptions.precision
  );
};

const reverseConvertGrnAmountByRate = (
  amount: number,
  conversionRate: number,
  roundOptions: GrnRateConversionRoundOptions
): number => {
  return applyRound(
    amount / conversionRate,
    roundOptions.roundFormat,
    roundOptions.precision
  );
};

export const applyGrnRateConversion = (
  body: CreateGrnInput,
  roundOptions: GrnRateConversionRoundOptions
): CreateGrnInput => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = convertGrnAmountByRate(
    body.totalAmount,
    conversionRate,
    roundOptions
  );

  body.paidAmount = body.paidAmount
    ? convertGrnAmountByRate(body.paidAmount, conversionRate, roundOptions)
    : body.paidAmount;

  body.returnedAmount = body.returnedAmount
    ? convertGrnAmountByRate(body.returnedAmount, conversionRate, roundOptions)
    : body.returnedAmount;

  body.netTotal = convertGrnAmountByRate(
    body.netTotal,
    conversionRate,
    roundOptions
  );

  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? convertGrnAmountByRate(body.discount, conversionRate, roundOptions)
        : body.discount
      : body.discount;

  body.netDiscount = body.netDiscount
    ? convertGrnAmountByRate(body.netDiscount, conversionRate, roundOptions)
    : body.netDiscount;

  body.netTax = convertGrnAmountByRate(
    body.netTax,
    conversionRate,
    roundOptions
  );

  body.goodReceiveDetails = body.goodReceiveDetails?.map((detail) => ({
    ...detail,
    purchasedPrice: convertGrnAmountByRate(
      detail.purchasedPrice,
      conversionRate,
      roundOptions
    ),
    totalAmount: convertGrnAmountByRate(
      detail.totalAmount,
      conversionRate,
      roundOptions
    ),
    netAmount: convertGrnAmountByRate(
      detail.netAmount,
      conversionRate,
      roundOptions
    ),
    netDiscount: convertGrnAmountByRate(
      detail.netDiscount,
      conversionRate,
      roundOptions
    ),

    discount:
      detail.discountMethod === DiscMethod.FIXED
        ? detail.discount
          ? convertGrnAmountByRate(
              detail.discount,
              conversionRate,
              roundOptions
            )
          : detail.discount
        : detail.discount,

    netTax: convertGrnAmountByRate(detail.netTax, conversionRate, roundOptions),
  }));

  return body;
};

export const applyGrnReturnRateConversion = (
  body: CreateGrnReturnInput,
  roundOptions: GrnRateConversionRoundOptions
): CreateGrnReturnInput => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = convertGrnAmountByRate(
    body.totalAmount,
    conversionRate,
    roundOptions
  );
  body.paidAmount = body.paidAmount
    ? convertGrnAmountByRate(body.paidAmount, conversionRate, roundOptions)
    : body.paidAmount;
  body.netTotal = convertGrnAmountByRate(
    body.netTotal,
    conversionRate,
    roundOptions
  );
  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? convertGrnAmountByRate(body.discount, conversionRate, roundOptions)
        : body.discount
      : body.discount;
  body.netDiscount = body.netDiscount
    ? convertGrnAmountByRate(body.netDiscount, conversionRate, roundOptions)
    : body.netDiscount;
  body.netTax = convertGrnAmountByRate(
    body.netTax,
    conversionRate,
    roundOptions
  );

  body.goodReceiveReturnDetails = body.goodReceiveReturnDetails?.map(
    (detail) => ({
      ...detail,
      purchasedPrice: convertGrnAmountByRate(
        detail.purchasedPrice,
        conversionRate,
        roundOptions
      ),
      totalAmount: convertGrnAmountByRate(
        detail.totalAmount,
        conversionRate,
        roundOptions
      ),
      netAmount: convertGrnAmountByRate(
        detail.netAmount,
        conversionRate,
        roundOptions
      ),
      netDiscount: convertGrnAmountByRate(
        detail.netDiscount,
        conversionRate,
        roundOptions
      ),
      discount:
        detail.discountMethod === DiscMethod.FIXED
          ? detail.discount
            ? convertGrnAmountByRate(
                detail.discount,
                conversionRate,
                roundOptions
              )
            : detail.discount
          : detail.discount,
      netTax: convertGrnAmountByRate(
        detail.netTax,
        conversionRate,
        roundOptions
      ),
    })
  );

  return body;
};

export const applyGrnRateReverseConversion = (
  body: GrnDTO,
  roundOptions: GrnRateConversionRoundOptions
): GrnDTO => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = reverseConvertGrnAmountByRate(
    body.totalAmount,
    conversionRate,
    roundOptions
  );

  body.paidAmount = body.paidAmount
    ? reverseConvertGrnAmountByRate(
        body.paidAmount,
        conversionRate,
        roundOptions
      )
    : body.paidAmount;

  body.returnedAmount = body.returnedAmount
    ? reverseConvertGrnAmountByRate(
        body.returnedAmount,
        conversionRate,
        roundOptions
      )
    : body.returnedAmount;

  body.netTotal = reverseConvertGrnAmountByRate(
    body.netTotal,
    conversionRate,
    roundOptions
  );

  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? reverseConvertGrnAmountByRate(
            body.discount,
            conversionRate,
            roundOptions
          )
        : body.discount
      : body.discount;

  body.netDiscount = body.netDiscount
    ? reverseConvertGrnAmountByRate(
        body.netDiscount,
        conversionRate,
        roundOptions
      )
    : body.netDiscount;

  body.netTax = reverseConvertGrnAmountByRate(
    body.netTax,
    conversionRate,
    roundOptions
  );

  body.goodReceiveDetails = body.goodReceiveDetails?.map((detail) => ({
    ...detail,
    purchasedPrice: reverseConvertGrnAmountByRate(
      detail.purchasedPrice,
      conversionRate,
      roundOptions
    ),
    totalAmount: reverseConvertGrnAmountByRate(
      detail.totalAmount,
      conversionRate,
      roundOptions
    ),
    netAmount: reverseConvertGrnAmountByRate(
      detail.netAmount,
      conversionRate,
      roundOptions
    ),
    netDiscount: reverseConvertGrnAmountByRate(
      detail.netDiscount,
      conversionRate,
      roundOptions
    ),

    discount:
      detail.discountMethod === DiscMethod.FIXED
        ? detail.discount
          ? reverseConvertGrnAmountByRate(
              detail.discount,
              conversionRate,
              roundOptions
            )
          : detail.discount
        : detail.discount,

    netTax: reverseConvertGrnAmountByRate(
      detail.netTax,
      conversionRate,
      roundOptions
    ),
  }));

  return body;
};

export const applyGrnReturnRateReverseConversion = (
  body: GoodReceiveReturnDTO,
  roundOptions: GrnRateConversionRoundOptions
): GoodReceiveReturnDTO => {
  if (!body.conversionRate) return body;

  const conversionRate = Number(body.conversionRate);

  body.totalAmount = reverseConvertGrnAmountByRate(
    body.totalAmount,
    conversionRate,
    roundOptions
  );
  body.paidAmount = body.paidAmount
    ? reverseConvertGrnAmountByRate(
        body.paidAmount,
        conversionRate,
        roundOptions
      )
    : body.paidAmount;
  body.netTotal = reverseConvertGrnAmountByRate(
    body.netTotal,
    conversionRate,
    roundOptions
  );
  body.discount =
    body.discountMethod === DiscMethod.FIXED
      ? body.discount
        ? reverseConvertGrnAmountByRate(
            body.discount,
            conversionRate,
            roundOptions
          )
        : body.discount
      : body.discount;
  body.netDiscount = body.netDiscount
    ? reverseConvertGrnAmountByRate(
        body.netDiscount,
        conversionRate,
        roundOptions
      )
    : body.netDiscount;
  body.netTax = reverseConvertGrnAmountByRate(
    body.netTax,
    conversionRate,
    roundOptions
  );

  body.goodReceiveReturnDetails = body.goodReceiveReturnDetails?.map(
    (detail) => ({
      ...detail,
      totalAmount: reverseConvertGrnAmountByRate(
        detail.totalAmount,
        conversionRate,
        roundOptions
      ),
      netAmount: reverseConvertGrnAmountByRate(
        detail.netAmount,
        conversionRate,
        roundOptions
      ),
      netDiscount: reverseConvertGrnAmountByRate(
        detail.netDiscount,
        conversionRate,
        roundOptions
      ),
      discount:
        detail.discountMethod === DiscMethod.FIXED
          ? detail.discount
            ? reverseConvertGrnAmountByRate(
                detail.discount,
                conversionRate,
                roundOptions
              )
            : detail.discount
          : detail.discount,
      netTax: reverseConvertGrnAmountByRate(
        detail.netTax,
        conversionRate,
        roundOptions
      ),
    })
  );

  return body;
};
