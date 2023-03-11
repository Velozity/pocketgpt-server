import Verifier from "google-play-billing-validator";

const verifier = new Verifier({
  email: process.env.GOOGLE_SERVICE_EMAIL || "",
  key: process.env.GOOGLE_SERVICE_KEY || "",
});

export async function verifySubscription(
  packageName: string,
  productId: string,
  purchaseToken: string
) {
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
