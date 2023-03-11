// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifySubscription } from "@/lib/google";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { message, subscription } = req.body;
    const { data } = message;
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );
    const { packageName, eventTimeMillis, subscriptionNotification } =
      decodedData;
    const { purchaseToken, subscriptionId } = subscriptionNotification;

    console.log(subscription);
    console.log({
      packageName,
      eventTimeMillis,
      purchaseToken,
      subscriptionId,
    });

    await verifySubscription(packageName, subscriptionId, purchaseToken);
    res.status(200).end();
  } catch (err) {
    console.log("bad req:");
    console.log(err);
    res.status(400).end();
  }
}
