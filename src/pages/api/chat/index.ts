import { findAccount } from "@lib/api/account";
import { NextApiRequest, NextApiResponse } from "next";
import { JWTAuthenticator } from "@lib/JWTAuthenticator";
import { createChat, findChat } from "@/lib/api/chat";
import { validateSubscription } from "@/lib/api/subscription";
import { applicationConfiguration } from "@/lib/config";
import prisma from "@/lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let account;
  try {
    account = await JWTAuthenticator.validate(
      req.headers?.authorization?.split("Bearer ")[1] || ""
    );
  } catch {
    return res.status(501).end();
  }

  if (!account) {
    return res.status(501).end();
  }

  const { method } = req;
  switch (method) {
    case "POST":
      const subscription = await validateSubscription(account.id);
      if (!subscription.success) {
        return res.json({
          error: "Failed to verify your account subscription.",
        });
      }

      if (!subscription.isSubscribed) {
        const acc = await prisma.account.findFirst({
          where: { id: account.id },
          select: {
            chatsCreated: true,
          },
        });
        if (
          !acc ||
          acc?.chatsCreated >=
            applicationConfiguration.unsubscribedUsers.maxChatsCreated
        ) {
          return res.json({
            error: `You have reached your limit for creating chats as a free user. ${applicationConfiguration.unsubscribedUsers.maxChatsCreated}`,
          });
        }
      }

      return res.json(await createChat(account.id));
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
