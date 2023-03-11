// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message, subscription } = req.body;
  const { data } = message;

  console.log(subscription);
  console.log(message.messageId);
  console.log(data);
  res.status(200).end();
}
