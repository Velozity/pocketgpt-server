import { getPlans } from "@/lib/api/plan";
import { NextApiRequest, NextApiResponse } from "next";

async function get(req: NextApiRequest, res: NextApiResponse) {
  return res.json(await getPlans());
}

async function handler(req: any, res: any) {
  const { method } = req;

  switch (method) {
    case "GET":
      await get(req, res);
      return;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).send("Method not allowed");
  }
}

export default handler;
