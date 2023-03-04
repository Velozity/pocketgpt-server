import { NextApiRequest, NextApiResponse } from "next";
import { JWTAuthenticator } from "@lib/JWTAuthenticator";
import { createMessage } from "@/lib/api/message";
import OpenAIClient from "@/services/OpenAIClient";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { validateSubscription } from "@/lib/api/subscription";
import { applicationConfiguration } from "@/lib/config";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let account;
  try {
    console.time("jwt auth");
    account = await JWTAuthenticator.validate(
      req.headers?.authorization?.split("Bearer ")[1] || ""
    );
    console.timeEnd("jwt auth");
  } catch {
    return res.status(501).end();
  }

  if (!account) {
    return res.status(501).end();
  }

  const { method } = req;
  const { chatId } = req.query;
  switch (method) {
    case "POST":
      const text = req.body.text as string;
      if (!chatId || !text) return res.status(400).end();

      try {
        console.time("Checks");
        const subscription = await validateSubscription(account.id);
        if (!subscription.success) {
          console.timeEnd("Checks");
          return res.json({
            error: "Failed to verify your account subscription.",
          });
        }

        console.timeEnd("Checks");
        console.time("Create user message");
        const message = await createMessage(text, chatId as string, account.id);

        if (message.error) {
          logger.error(message);
          return res.status(400).end();
        }

        if (
          !subscription.isSubscribed &&
          message.chatMessages &&
          message?.chatMessages?.length >=
            applicationConfiguration.unsubscribedUsers.maxPromptsPerChat
        ) {
          console.timeEnd("Create user message");
          return res.json({
            error: `You have reached your limit for messages as a free user. (${applicationConfiguration.unsubscribedUsers.maxPromptsPerChat})`,
          });
        }
        console.timeEnd("Create user message");

        if (!message.chatMessages || message.chatMessages.length === 0) {
          logger.error("no chatMessages");
          return res.status(400);
        }
        console.time("Create prompt");

        const textResponse = await OpenAIClient.completeChatPrompt(
          message.chatMessages.map((m) => {
            return { role: m.isHuman ? "user" : "assistant", content: m.text };
          }),
          {
            titleEmpty: message.titleEmpty,
          }
        );
        console.timeEnd("Create prompt");
        console.time("After prompt");
        // res.write(JSON.stringify(textResponse));
        if (textResponse && textResponse.text && textResponse.title) {
          await prisma.chat.update({
            where: {
              id: chatId as string,
            },
            data: {
              title: textResponse.title,
            },
          });
        }
        await createMessage(textResponse.text as string, chatId as string);
        console.timeEnd("After prompt");
        return res.json(textResponse);
      } catch (err) {
        console.log(err);
        return res.status(500).end();
      }
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;