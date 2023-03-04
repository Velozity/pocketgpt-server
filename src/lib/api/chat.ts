import { Chat, Message } from "@prisma/client";
import prisma from "../prisma";
import logger from "../logger";

export async function createChat(accountId: string): Promise<{
  success?: boolean;
  chat?: any;
  error?: string;
}> {
  try {
    const chat = await prisma.chat.create({
      data: {
        accountId,
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
      },
    });
    return {
      success: true,
      chat,
    };
  } catch (err) {
    logger.error(err);
    return {
      error: "An unknown error occurred.",
    };
  }
}

export async function findChat(id: string): Promise<any> {
  try {
    const findChats = await prisma.chat.findUnique({
      where: {
        id,
      },
      include: {
        Message: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return findChats || undefined;
  } catch (err) {
    logger.error(err);
  }
}

export async function findAccountChats(
  accountId: string
): Promise<Partial<Chat>[] | undefined> {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        accountId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Message: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return chats.map((c: any) => {
      c.Message = c.Message[0] || null;
      return c;
    });
  } catch (err) {
    logger.error(err);
  }
}

export async function deleteChats(
  accountId: string,
  chatIds: string[]
): Promise<number> {
  try {
    const del = await prisma.chat.deleteMany({
      where: {
        OR: chatIds.map((c) => {
          return { id: c, accountId };
        }),
      },
    });

    return del.count;
  } catch (err) {
    logger.error(err);
    return 0;
  }
}
