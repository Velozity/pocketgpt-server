// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createSubscription } from "@/lib/api/subscription";
import { verifySubscription } from "@/lib/google";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
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

      if (!validate) {
        logger.error(validate);
        return res.status(200).end();
      }

      const { isSuccessful, errorMessage, payload } = validate;
      if (!isSuccessful) {
        logger.error(validate);
        logger.error(errorMessage);
        return res.status(200).end();
      }

      const {
        latestOrderId,
        startTime,

        autoRenewing,
        regionCode,
        developerPayload,
        externalAccountIdentifiers,
        lineItems,
      } = payload;
      const { obfuscatedExternalAccountId } = externalAccountIdentifiers;

      const { success } = await createSubscription(
        obfuscatedExternalAccountId,
        "androidSubscription",
        purchaseToken,
        latestOrderId,
        subscriptionId,
        7.99,
        regionCode,
        startTime,
        lineItems[0].expiryTime
      );

      if (success) {
      } else {
        logger.error("FAILED TO CREATE SUBSCRIPTION BUT ITS VALID.");
        logger.error(payload);
      }
    } else if (notificationType === 13) {
      // EXPIRED SUBSCRIPTION
      await prisma.subscription.update({
        where: {
          externalOrderId: purchaseToken,
        },
        data: {
          status: "expired",
        },
      });
    } else if (notificationType === 3) {
      // CANCELLED SUBSCRIPTION
      await prisma.subscription.update({
        where: {
          externalOrderId: purchaseToken,
        },
        data: {
          status: "cancelled",
        },
      });
    } else if (notificationType === 6) {
      // GRACE PERIOD ENTERED
      await prisma.subscription.update({
        where: {
          externalOrderId: purchaseToken,
        },
        data: {
          status: "grace",
        },
      });
    } else if (notificationType === 7) {
      // SUBSCRIPTION RESTORED
      await prisma.subscription.update({
        where: {
          externalOrderId: purchaseToken,
        },
        data: {
          status: "active",
        },
      });
    } else if (notificationType === 12) {
      // REVOKED FROM USER
      await prisma.subscription.update({
        where: {
          externalOrderId: purchaseToken,
        },
        data: {
          endDate: new Date(),
          status: "revoked",
        },
      });
    } else if (notificationType === 2) {
      // RENEWED
      const validate = await verifySubscription(
        packageName,
        subscriptionId,
        purchaseToken
      ).catch((e) => e);

      if (!validate) {
        logger.error(validate);
        return res.status(200).end();
      }

      const { isSuccessful, errorMessage, payload } = validate;
      if (!isSuccessful) {
        logger.error(validate);
        logger.error(errorMessage);
        return res.status(200).end();
      }

      const {
        latestOrderId,
        expiryTimeMillis,
        priceCurrencyCode,
        externalAccountIdentifiers,
        lineItems,
      } = payload;
      const { obfuscatedExternalAccountId } = externalAccountIdentifiers;
      await prisma.subscription.update({
        where: {
          externalOrderId: purchaseToken,
        },
        data: {
          endDate: new Date(lineItems[0].expiryTime),
          status: "active",
          Transaction: {
            create: {
              accountId: obfuscatedExternalAccountId,
              method: "androidSubscription",
              merchantOrderId: latestOrderId,
              amount: 7.99,
              amountCurrencyCode: priceCurrencyCode,
            },
          },
        },
      });

      logger.info("Subscription renewed for " + obfuscatedExternalAccountId);
    }

    res.status(200).end();
  } catch (err) {
    console.log("bad req:");
    console.log(err);
    res.status(400).end();
  }
}
