import { NextApiRequest, NextApiResponse } from "next";
import logger from "@/lib/logger";
import { validateAccount } from "@/lib/api/account";
import { JWTAuthenticator } from "@/lib/JWTAuthenticator";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "POST":
      try {
        const { email, password } = req.body;
        if (!email || !password)
          return res.json({
            error: "Invalid fields",
          });

        const ip = req.headers["X-Forwarded-For"] ?? email;

        const findUser = await validateAccount(email, password);
        if (
          !findUser ||
          !findUser.success ||
          findUser.error ||
          !findUser.account
        ) {
          return res.json({ error: findUser.error });
        }

        const token = JWTAuthenticator.authenticate(findUser.account);

        return res.json({ success: true, token, account: findUser.account });
      } catch (error) {
        logger.error(error);
        res.json({ error: "An unexpected error occurred" });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
