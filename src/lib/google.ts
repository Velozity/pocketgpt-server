import Verifier from "google-play-billing-validator";

const verifier = new Verifier({
  email: process.env.GOOGLE_SERVICE_EMAIL || "",
  key: Buffer.from(process.env.GOOGLE_SERVICE_KEY || "", "base64")
    .toString("ascii")
    .replace(/\\n/g, "\n"),
});

export async function verifySubscription(
  packageName: string,
  productId: string,
  purchaseToken: string
) {
  return verifier
    .verifySub(
      {
        packageName,
        productId,
        purchaseToken,
      },
      true
    )
    .then((response) => {
      console.log("full response:");
      console.log(response);
      return response;
    })
    .catch((e) => {
      console.log(e);
    });
}
