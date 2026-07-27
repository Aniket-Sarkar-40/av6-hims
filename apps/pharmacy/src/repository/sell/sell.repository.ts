import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  Appointment,
  PaymentTransaction,
  SellByRefNoResponse,
  sellExcelFilter,
  SellInput,
  SellResponse,
  UpdateSellCopayInput,
  ValSellResponse,
} from "@/types/sell/sell.js";
import {
  createOrUpdateInsurerInvoice,
  handleClientPlanInvoiceForOpd,
} from "../opd/opdList.repository.js";
import { subItemStock } from "../stock/stock.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-core-v2";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  PmsUinShortCode,
  Prisma,
  SELL_STATUS,
} from "@repo/db/generated/prisma/client";
import { featureFlagService } from "@/services/feature/feature.service.js";
import { emailConfigService } from "@/services/master/emailConfig.service.js";

export const createSellInDb = async (
  input: SellInput,
): Promise<SellResponse> => {
  logger.info("entering::createSell::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedSale = customOmit<
    SellInput,
    "sellDetails" | "existingSell" | "isPrint" | "patient" | "client"
  >(input, ["sellDetails", "existingSell", "isPrint", "patient", "client"]);
  const { sellDetails } = omittedSale.omitted;

  return await db.$transaction(
    async (tx) => {
      const sellUin = await uinServiceFactory.generateUIN(PmsUinShortCode.SELL);
      let billNo = await uinServiceFactory.generateUIN(PmsUinShortCode.BILL);
      if (omittedSale.omitted.patient?.patientUniqueId) {
        billNo = billNo.replace(
          "{PATIENT_UNQ_ID}",
          omittedSale.omitted.patient?.patientUniqueId.toString(),
        );
      }

      const createdSell = await tx.pmsSell.create({
        data: {
          ...omittedSale.rest,
          sellRefNo: sellUin,
          billNo,
          paidAmount: input.paidAmount ?? 0,
          paymentStatus: input.paymentStatus ?? undefined,
          status: input.status ?? undefined,
          patientUniqueId: omittedSale.omitted.patient?.patientUniqueId,
          createdBy: currentUser,
          sellDetails: {
            create: sellDetails.map((detail) => ({
              ...detail,
              expiryDate: new Date(detail.expiryDate),
              createdBy: currentUser,
            })),
          },
        },
        include: {
          sellDetails: {
            where: {
              isActive: true,
            },
          },
          cc: true,
          customer: true,
          insurance: true,
          corporateClient: true,
          doctor: {
            select: {
              id: true,
              name: true,
              surname: true,
              designation: true,
              employeeId: true,
              department: true,
              email: true,
            },
          },
        },
      });

      //If status is completed, then update stock
      if (input.status === SELL_STATUS.COMPLETED) {
        const feature = await featureFlagService.getFeatureFlagByShortCode(
          "SELL_STOCK_ADJ",
          true,
        );
        if (
          !feature ||
          feature.isEnabled === false ||
          input.paymentStatus === "PAID"
        ) {
          for (const detail of createdSell.sellDetails) {
            await subItemStock(
              tx,
              {
                itemId: detail.itemId,
                quantity: detail.quantity,
                batchNo: detail.batchNo,
                expiryDate: detail.expiryDate ?? undefined,
                branchId: input.ccId,
                isFoc: detail.isFoc,
              },
              {
                operation: "SELL",
                refId: createdSell.id,
                refDetailsId: detail.id,
                refNo: createdSell.sellRefNo,
                refDate: createdSell.billDate,
                refApprovedBy: undefined,
                refApprovedAt: undefined,
              },
            );
          }
          await tx.pmsSell.update({
            where: {
              id: createdSell.id,
            },
            data: {
              isStockAdjusted: true,
            },
          });
        }
        console.log("aptId:", input.aptId, typeof input.aptId);
        if (input.aptId) {
          //     const affected = await tx.$executeRawUnsafe(
          //       `UPDATE appointments_table
          //  SET med_status = 'Success'
          //  WHERE id = ?`,
          //       input.aptId
          //     );
          //     console.log(`appointments_table rows updated: ${affected}`);
          await tx.$executeRaw`
            INSERT INTO patient_medicine_master
              (apt_id, apt_no, sell_id, sell_ref_no, is_active, created_by, updated_by, created_at, updated_at, deleted_at, deleted_by)
            VALUES
              (${input.aptId}, ${createdSell.aptNo}, ${createdSell.id}, ${createdSell.sellRefNo}, TRUE, ${currentUser}, NULL, NOW(3), NOW(3), NULL, NULL)
          `;

          const itemIds = createdSell.sellDetails.map((d) => d.itemId);
          const uniqueItemIds = Array.from(new Set(itemIds));

          await tx.$queryRaw(Prisma.sql`UPDATE patient_medicine
            SET sell_id = ${createdSell.id}, sell_ref_no = ${
              createdSell.sellRefNo
            }
            WHERE appointment_id = ${input.aptId} AND med_id IN (${Prisma.join(
              uniqueItemIds,
            )}) and sell_id IS NULL
            `);
        }

        if (input.insuranceId && input.patientInsuranceId) {
          await createOrUpdateInsurerInvoice(tx, {
            caseId: createdSell.sellRefNo,
            coPayment: createdSell.coPayAmount.toNumber(),
            grossTotal: createdSell.netAmount.toNumber(),
            discountAmount: createdSell.netDiscount.toNumber(),
            netTotal: createdSell.customerPayAmount.toNumber(),
            insurerId: input.insuranceId,
          });
        }

        logger.info("Created Sell--------->" + JSON.stringify(createdSell));
        logger.info(
          "Created Sell By User --------->" + JSON.stringify(store?.user),
        );

        if (input.corporateClientId) {
          await handleClientPlanInvoiceForOpd(tx, {
            clientId: input.corporateClientId,
            clientPlan: omittedSale.omitted.client?.customerPlan,
            coPayAmount: createdSell.coPayAmount.toNumber(),
            sellRefNo: createdSell.sellRefNo,
            totalAmount: createdSell.netAmount.toNumber(),
          });
        }
      }

      const patient = omittedSale.omitted.patient;
      const feature = await featureFlagService.getFeatureFlagByShortCode(
        "SELL_NOTIFICATION",
        true,
      );

      if (patient?.email && feature?.isEnabled) {
        const emailTemplate = await emailConfigService.getEventEmail();

        // if (emailTemplate && emailTemplate.emailBody && store?.user?.email) {
        //   sendTemplatedEmail({
        //     template: emailTemplate,
        //     to: [patient.email],
        //     variables: {
        //       name: store.user.userName || "User",
        //       companyDetails: "Aerial View-6 Infotech Pvt. Ltd.",
        //       message: `Sell Done.`,
        //       signature: `Aerial View-6 Pvt. Ltd.`,
        //     },
        //   })
        //     .then(() => {
        //       logger.info("Email Sent Successfully.");
        //     })
        //     .catch((e) => logger.error(`Email Failed:: ${e.message} `));
        // }

        // TODO: Send notification
      }

      return createdSell;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getSellFromDb = async (): Promise<SellResponse[]> => {
  logger.info("entering::getSellFromDb::repository");
  return db.pmsSell.findMany({
    where: {
      isActive: true,
    },
    include: {
      sellDetails: {
        where: {
          isActive: true,
        },
      },
      cc: true,
      customer: true,
      insurance: true,
      corporateClient: true,
      doctor: {
        select: {
          id: true,
          name: true,
          surname: true,
          designation: true,
          employeeId: true,
          department: true,
          email: true,
        },
      },
    },
  });
};

export const getSellByIdFromDb = async (
  id: number,
): Promise<SellResponse | null> => {
  logger.info("entering::getSellByIdFromDb::repository");
  return db.pmsSell.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      sellDetails: {
        where: {
          isActive: true,
        },
      },
      cc: true,
      customer: true,
      doctor: {
        select: {
          id: true,
          name: true,
          surname: true,
          designation: true,
          employeeId: true,
          department: true,
          email: true,
        },
      },
      insurance: true,
      corporateClient: true,
    },
  });
};

export const valSellByIdFromDb = async (
  id: number,
): Promise<ValSellResponse | null> => {
  logger.info("entering::getSellByIdFromDb::repository");
  return db.pmsSell.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      sellDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

//Sell status update(DRAFT TO COMPLETED)
export const updateSellStatusInDb = async (
  input: SellInput,
): Promise<SellResponse> => {
  logger.info("entering::updateSellStatusInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedSale = customOmit<
    SellInput,
    "sellDetails" | "existingSell" | "id" | "isPrint" | "patient" | "client"
  >(input, [
    "sellDetails",
    "existingSell",
    "id",
    "isPrint",
    "patient",
    "client",
  ]);

  const { sellDetails, existingSell, id } = omittedSale.omitted;

  const toUpdate = sellDetails.filter(
    (d): d is typeof d & { id: number } => typeof d.id === "number",
  );
  const toCreate = sellDetails.filter((d) => typeof d.id !== "number");
  const toDelete = existingSell.sellDetails.filter(
    (d) => !sellDetails.some((item) => item.id === d.id),
  );

  return db.$transaction(
    async (tx) => {
      const updatedSell = await tx.pmsSell.update({
        where: { id },

        data: {
          ...omittedSale.rest,
          discountNote: input.discountNote ?? undefined,
          paidAmount: input.paidAmount ?? 0,
          paymentMode: input.paymentMode ?? undefined,
          paymentStatus: input.paymentStatus ?? undefined,
          status: "COMPLETED",
          staffId: currentUser,
          updatedBy: currentUser,
          patientUniqueId: omittedSale.omitted.patient?.patientUniqueId,

          sellDetails: {
            create: toCreate.map((d) => ({
              ...d,
              expiryDate: new Date(d.expiryDate),
              createdBy: currentUser,
            })),
            update: toUpdate.map((d) => ({
              where: { id: d.id },
              data: {
                ...d,
                expiryDate: new Date(d.expiryDate),
                updatedBy: currentUser,
              },
            })),
            updateMany: {
              where: { id: { in: toDelete.map((d) => d.id) } },
              data: {
                isActive: false,
                deletedAt: new Date(),
                deletedBy: currentUser,
              },
            },
          },
        },

        include: {
          sellDetails: { where: { isActive: true } },
          cc: true,
          customer: true,
          insurance: true,
          corporateClient: true,
          doctor: {
            select: {
              id: true,
              name: true,
              surname: true,
              designation: true,
              employeeId: true,
              department: true,
              email: true,
            },
          },
        },
      });

      if (input.aptId) {
        // await tx.$executeRawUnsafe(
        //   `UPDATE appointments_table
        //      SET med_status = 'Success'
        //    WHERE id = ?`,
        //   input.aptId
        // );
        await tx.$executeRaw`
            INSERT INTO patient_medicine_master
              (apt_id, apt_no, sell_id, sell_ref_no, is_active, created_by, updated_by, created_at, updated_at, deleted_at, deleted_by)
            VALUES
              (${input.aptId}, ${updatedSell.aptNo}, ${updatedSell.id}, ${updatedSell.sellRefNo}, TRUE, ${currentUser}, NULL, NOW(3), NOW(3), NULL, NULL)
          `;

        const itemIds = updatedSell.sellDetails.map((d) => d.itemId);
        const uniqueItemIds = Array.from(new Set(itemIds));

        await tx.$queryRaw(Prisma.sql`UPDATE patient_medicine
            SET sell_id = ${updatedSell.id}, sell_ref_no = ${
              updatedSell.sellRefNo
            }
            WHERE appointment_id = ${input.aptId} AND med_id IN (${Prisma.join(
              uniqueItemIds,
            )}) and sell_id IS NULL
            `);
      }

      if (input.insuranceId && input.patientInsuranceId) {
        await createOrUpdateInsurerInvoice(tx, {
          caseId: updatedSell.sellRefNo,
          coPayment: updatedSell.coPayAmount.toNumber(),
          grossTotal: updatedSell.totalAmount.toNumber(),
          discountAmount: updatedSell.netDiscount.toNumber(),
          netTotal: updatedSell.netAmount.toNumber(),
          insurerId: input.insuranceId,
        });
      }

      if (input.corporateClientId) {
        await handleClientPlanInvoiceForOpd(tx, {
          clientId: input.corporateClientId,
          clientPlan: omittedSale.omitted.client?.customerPlan,
          coPayAmount: updatedSell.coPayAmount.toNumber(),
          sellRefNo: updatedSell.sellRefNo,
          totalAmount: updatedSell.totalAmount.toNumber(),
        });
      }

      return updatedSell;
    },
    { timeout: API_TIMEOUT },
  );
};

export const getLastPaymentTransaction = async (
  sellId: number,
): Promise<PaymentTransaction | null> => {
  logger.info("entering::getPaymentTransaction::repository");

  const response = await db.$queryRaw<PaymentTransaction[]>`
    select
      ppt.id,
      ppt.created_at as transactionDate,
      ppt.collector_id as collectorId,
      ppt.payment_mode as paymentMode,
      ppt.payment_type as paymentType,
      s.name as collectorName
    from
      pms_payment_transactions as ppt
    left join staff as s on s.id = ppt.collector_id
    where
      ppt.sell_id = ${sellId}
      and ppt.payment_type = "Credit"
    order by
      ppt.created_at desc
    limit 1
  `;

  return response.length > 0 ? response[0] : null;
};

export const getPaymentTransactionsBySell = async (
  sellId: number,
): Promise<PaymentTransaction[]> => {
  logger.info("entering::getPaymentTransactionsBySell::repository");

  const response = await db.$queryRaw<PaymentTransaction[]>`
    select
          ppt.id,
          ppt.created_at as transactionDate,
          ppt.collector_id as collectorId,
          ppt.payment_mode as paymentMode,
          ppt.payment_type as paymentType,
          s.name as collectorName,
          ppt.paid_amount as paidAmount,
          ppt.refund_amount as refundAmount 
    from
      pms_payment_transactions as ppt
    left join staff as s on s.id = ppt.collector_id
    where
    ppt.sell_id = ${sellId}
    order by ppt.created_at 
  `;

  return response;
};

export const getAppointment = async (
  id: number,
): Promise<Appointment | null> => {
  logger.info("entering::getSellByIdForReceipt::repository");
  const response = db.$queryRaw<Appointment[] | null>`
    SELECT at2.id, at2.bill_id as billId, at2.booked_by as bookedBy, at2.referred_by as referredBy, at2.visit_id as visitId, at2.vip_type as vipType  from appointments_table at2 where at2.id=${id}
  `;
  return response.then((result) => result?.[0] ?? null);
};

export const getSellExcelFromDb = async (
  input: sellExcelFilter,
): Promise<SellResponse[]> => {
  logger.info("entering::getSellExcelFromDb::repository");
  return db.pmsSell.findMany({
    where: {
      id: input.id,
      sellRefNo: input.sellRefNo,
      ccId: input.branchId,
      staffId: input.staffId,
      deliveryType: input.deliveryType,
      paymentMode: input.paymentMode,
      isHomeDelivery: input.isHomeDelivery,
      customerId: input.customerId,
      billingFor: input.billingFor,
      doctorId: input.doctorId,
      billDate: {
        gte: input.startDate ? new Date(input.startDate) : undefined,
        lte: input.endDate ? new Date(input.endDate) : undefined,
      },
      isActive: true,
    },
    include: {
      sellDetails: {
        where: {
          isActive: true,
        },
      },
      cc: true,
      customer: true,
      insurance: true,
      corporateClient: true,
      doctor: {
        select: {
          id: true,
          name: true,
          surname: true,
          designation: true,
          employeeId: true,
          department: true,
          email: true,
        },
      },
    },
    orderBy: {
      billDate: "desc",
    },
  });
};

export const deleteSellFromDb = async (id: number) => {
  logger.info(`entering::deleteSellFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.pmsSell.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      sellDetails: {
        updateMany: {
          where: { sellId: id },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
  });

  logger.info(
    `exiting::deleteSellFromDb::repository id=${id} (deletedBy=${currentUser})`,
  );
};

export const getSellBySellNo = async (
  sellRefNo: string,
): Promise<SellByRefNoResponse | null> => {
  logger.info("entering::getSaleBySaleNo::repository");

  return db.pmsSell.findFirst({
    where: {
      sellRefNo,
      isActive: true,
    },
    include: {
      sellDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getSellByAppointmentNo = async (
  appointmentNo: string,
): Promise<SellByRefNoResponse | null> => {
  logger.info("entering::getSaleBySaleNo::repository");

  return db.pmsSell.findFirst({
    where: {
      aptNo: appointmentNo,
      isActive: true,
    },
    include: {
      sellDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const updateSellCopay = async (
  sellUpdateInput: UpdateSellCopayInput,
): Promise<void> => {
  logger.info("entering::updateSellCopay::repository");
  await db.$transaction(
    async (tx) => {
      await tx.pmsSell.update({
        where: { id: sellUpdateInput.id },
        data: {
          coPayAmount: sellUpdateInput.coPay,
          customerPayAmount: sellUpdateInput.patientPay,
          totalAmount: sellUpdateInput.totalAmount,
          netDiscount: sellUpdateInput.netDiscount,
          netAmount: sellUpdateInput.netAmount,
          netTax: sellUpdateInput.netTax,
          paymentStatus: sellUpdateInput.paymentStatus,
          refundedAmount: sellUpdateInput.refundAmount,
          sellDetails: {
            update: sellUpdateInput.details.map((d) => {
              return {
                where: { id: d.id },
                data: {
                  coPayAmount: d.coPay,
                  customerPayAmount: d.patientPay,
                  totalAmount: d.totalAmount,
                  netDiscount: d.netDiscount,
                  netAmount: d.netAmount,
                  netTax: d.netTax,
                  mrp: d.mrp,
                },
              };
            }),
          },
        },
      });

      if (sellUpdateInput.insurerId) {
        await createOrUpdateInsurerInvoice(tx, {
          caseId: sellUpdateInput.sellRefNo,
          coPayment: sellUpdateInput.coPay,
          grossTotal: sellUpdateInput.totalAmount,
          discountAmount: sellUpdateInput.netDiscount,
          netTotal: sellUpdateInput.netAmount,
          insurerId: sellUpdateInput.insurerId,
        });
      }

      if (sellUpdateInput.clientId) {
        await handleClientPlanInvoiceForOpd(tx, {
          clientId: sellUpdateInput.clientId,
          clientPlan: sellUpdateInput.clientPlan,
          coPayAmount: sellUpdateInput.coPay,
          sellRefNo: sellUpdateInput.sellRefNo,
          totalAmount: sellUpdateInput.totalAmount,
        });
      }
    },
    { timeout: API_TIMEOUT },
  );
};
