import Verifier from "google-play-billing-validator";

const verifier = new Verifier({
  email: process.env.GOOGLE_SERVICE_EMAIL || "",
  key: Buffer.from(process.env.GOOGLE_SERVICE_KEY || "", "base64").toString(
    "utf-8"
  ),
});

export async function verifySubscription(
  packageName: string,
  productId: string,
  purchaseToken: string
) {
  console.log({
    email: process.env.GOOGLE_SERVICE_EMAIL || "",
    key: Buffer.from(process.env.GOOGLE_SERVICE_KEY || "", "base64").toString(
      "utf-8"
    ),
  });
  return verifier
    .verifySub({
      packageName,
      productId,
      purchaseToken,
    })
    .then((response) => {
      // subscription is valid
      console.log("subscription is valid, response:");
      console.log(response);
      return response;
    })
    .catch((e) => {
      console.log(e);
    });
}
