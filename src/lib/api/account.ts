import { Account, Prisma } from "@prisma/client";
import prisma from "../prisma";
import argon2 from "argon2";
import logger from "../logger";

export async function createAccount(
  createInput: Prisma.AccountCreateInput
): Promise<{
  success?: boolean;
  accountId?: string;
  error?: string;
}> {
  try {
    const account = await prisma.account.create({
      data: createInput,
      select: {
        id: true,
      },
    });
    return {
      success: true,
      accountId: account.id,
    };
  } catch (err: any) {
    if (err.code === "P2002") {
      return {
        error: "Email is taken.",
      };
    }

    return {
      error: "An unexpected error occurred.",
    };
  }
}
export async function findAccount(
  id: string
): Promise<Partial<Account> | undefined> {
  try {
    const findUser = await prisma.account.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        Subscription: {
          where: {
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
          },
        },
      },
    });

    const user = {
      id: findUser?.id,
      email: findUser?.email,
      emailVerified: findUser?.emailVerified,
      createdAt: findUser?.createdAt,
      activeSubscription: findUser?.Subscription[0],
    };

    return user.id ? user : undefined;
  } catch (err) {
    logger.error(err);
  }
}

export async function validateAccount(
  email: string,
  password: string
): Promise<{ error?: string; account?: any; success?: boolean }> {
  try {
    const findUser = await prisma.account.findUnique({
      where: {
        email,
      },
    });
    if (!findUser || !findUser.password) {
      return {
        error: "You don't have an account.",
      };
    }

    if (!(await argon2.verify(findUser.password, password))) {
      return {
        error: "Invalid password.",
      };
    }

    prisma.account.update({
      data: {
        lastLogin: new Date(),
      },
      where: {
        id: findUser.id,
      },
    });

    return {
      success: true,
      account: findUser,
      // error: !findUser.emailVerified ? "EMAIL_VERIFY" : undefined,
    };
  } catch (err) {
    return {
      error: "Something went wrong, please try again soon.",
    };
  }
}
