// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifySubscription } from "@/lib/google";
import logger from "@/lib/logger";
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
    const { purchaseToken, subscriptionId, notificationType } =
      subscriptionNotification;
    console.log(decodedData);
    if (notificationType === 4) {
      const validate = await verifySubscription(
        packageName,
        subscriptionId,
        purchaseToken
      ).catch((e) => e);
      console.log("validate obj:");
      console.log(validate);
      if (!validate) {
        logger.error(validate);
        return res.status(200).end();
      }

      const { isSuccessful, errorMessage, payload } = validate;
      if (!isSuccessful) {
        logger.error(validate);
        return res.status(200).end();
      }

      const {
        orderId,
        startTimeMillis,
        expiryTimeMillis,
        autoRenewing,
        priceCurrencyCode,
        priceAmountMicros,
        developerPayload,
      } = payload;

      console.log({
        purchaseToken,
        priceAmountMicros,
        subscriptionId,
        orderId,
        startTimeMillis,
        expiryTimeMillis,
        autoRenewing,
        priceCurrencyCode,
        developerPayload,
      });
    } else if (notificationType === 13) {
      // EXPIRED SUBSCRIPTION
    }

    res.status(200).end();
  } catch (err) {
    console.log("bad req:");
    console.log(err);
    res.status(400).end();
  }
}
