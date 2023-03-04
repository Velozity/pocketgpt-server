import { NextApiRequest, NextApiResponse } from "next";
import { JWTAuthenticator } from "@lib/JWTAuthenticator";
import { findChat } from "@/lib/api/chat";

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
  const { chatId } = req.query;
  switch (method) {
    case "GET":
      return res.json(await findChat(chatId as string));
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
