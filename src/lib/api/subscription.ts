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
  planId: string
): Promise<{
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
