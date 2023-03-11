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

    if (chat) {
      prisma.account.update({
        where: {
          id: accountId,
        },
        data: {
          chatsCreated: { increment: 1 },
        },
      });
    }

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

export async function findChat(
  id: string,
  page: number = 1,
  pageSize: number
): Promise<any> {
  try {
    let findChat: any = await prisma.chat.findUnique({
      where: {
        id,
      },
      include: {
        Message: {
          orderBy: { createdAt: "desc" },
          skip: pageSize * (page - 1),
          take: pageSize,
        },
      },
    });

    const count = await prisma.message.count({
      where: {
        chatId: id,
      },
    });

    if (findChat && (count === 0 || Math.ceil(count / pageSize) === page)) {
      findChat.Message.push({
        type: "convoStart",
        createdAt: findChat.createdAt,
      });
    }

    return findChat || undefined;
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
    await prisma.message
      .deleteMany({
        where: {
          OR: chatIds.map((c) => {
            return { chatId: c, Chat: { accountId } };
          }),
        },
      })
      .catch((e) => e);

    const del = await prisma.chat
      .deleteMany({
        where: {
          OR: chatIds.map((c) => {
            return { id: c, accountId };
          }),
        },
      })
      .catch((e) => e);

    return !del ? 0 : del.count;
  } catch (err) {
    logger.error(err);
    return 0;
  }
}
