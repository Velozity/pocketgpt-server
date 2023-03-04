import prisma from "../prisma";
import logger from "../logger";
import { Decimal } from "@prisma/client/runtime";

export async function getPlans(): Promise<{
  success: boolean;
  plans?: {
    name: string;
    amount: Decimal;
    desc: string;
    interval: number;
  }[];
}> {
  try {
    const plans = await prisma.plan.findMany({
      select: {
        name: true,
        desc: true,
        interval: true,
        amount: true,
      },
    });
    return {
      success: true,
      plans,
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
    };
  }
}
