import { findAccount } from "@lib/api/account";
import { NextApiRequest, NextApiResponse } from "next";
import { JWTAuthenticator } from "@lib/JWTAuthenticator";
import { deleteChats, findAccountChats, findChat } from "@/lib/api/chat";

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
    case "GET":
      return res.json(await findAccountChats(account.id));
    case "DELETE":
      let { chatIds } = req.query;
      if (!chatIds) return res.status(401).end();
      try {
        chatIds = JSON.parse(chatIds as string);
      } catch {
        return res.status(401).end();
      }

      return res.json({
        success: true,
        deleteCount: await deleteChats(account.id, chatIds as string[]),
      });
    default:
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
