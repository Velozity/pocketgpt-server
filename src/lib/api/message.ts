import prisma from "../prisma";
import logger from "../logger";
import { Message } from "@prisma/client";

export async function createMessage(
  text: string,
  chatId: string,
  accountId?: string
): Promise<{
  success?: boolean;
  chatId?: string;
  createdAt?: string;
  error?: string;
  titleEmpty?: boolean;
  chatMessages?: Message[];
}> {
  try {
    const message = await prisma.message.create({
      data: {
        chatId,
        isHuman: accountId ? true : false,
        text,
      },
      select: {
        id: true,
        createdAt: true,
        Chat: {
          select: {
            title: true,
            Message: true,
          },
        },
      },
    });

    return {
      success: true,
      createdAt: message.createdAt.toISOString(),
      chatId,
      chatMessages: message.Chat.Message,
      titleEmpty: !message.Chat.title,
    };
  } catch (err) {
    logger.error(err);
    return {
      error: "An unknown error occurred.",
    };
  }
}
