import prisma from "../prisma";
import logger from "../logger";

export async function validateSubscription(accountId: string): Promise<{
  success: boolean;
  isSubscribed?: boolean;
  chatsCreated?: number;
}> {
  try {
    const sub = await prisma.subscription.findFirst({
      where: {
        accountId: accountId,
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
      },
    });
    return {
      success: true,
      isSubscribed: sub?.id ? true : false,
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
    };
  }
}

export async function createSubscription(
  accountId: string,
  method: string,
  externalOrderId: string,
  merchantOrderId: string,
  subscriptionId: string,
  amount: number,
  amountCurrencyCode: string,
  startTimeMillis: any,
  endDateMillis: any
): Promise<{
  success: boolean;
  isSubscribed?: boolean;
  chatsCreated?: number;
}> {
  try {
    const sub = await prisma.subscription.create({
      data: {
        accountId: accountId,
        startDate: new Date(startTimeMillis),
        endDate: new Date(endDateMillis),
        externalOrderId,
        subscriptionId,
        Transaction: {
          create: {
            accountId,
            method,
            merchantOrderId,
            amount,
            amountCurrencyCode,
          },
        },
      },
    });
    return {
      success: sub.id ? true : false,
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
    };
  }
}
