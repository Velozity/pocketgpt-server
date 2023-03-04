import { NextApiRequest, NextApiResponse } from "next";
import { createAccount } from "@/lib/api/account";
import logger from "@/lib/logger";
import argon2 from "argon2";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;

  if (!email || !email.includes("@") || !email.includes(".")) {
    res.json({
      error: "Email is invalid.",
    });
    return;
  }

  if (!password || password.length < 8) {
    res.json({
      error: "Password must be atleast 8 characters.",
    });
    return;
  }

  const hash = await argon2.hash(password).catch((e) => e);

  if (!hash) {
    logger.error(hash);
    res.json({
      error: "An unknown error occurred.",
    });
    return;
  }

  const result = await createAccount({
    email,
    password: hash,
  }).catch((e) => e);
  if (!result) {
    return res.json({
      error: "Email is taken.",
    });
  }

  if (!result.error && result.accountId) {
    res.json({
      success: true,
      userId: result.accountId,
    });
    return;
  } else {
    res.json({
      error: result.error ?? "Please try again soon (UN1).",
    });
    return;
  }
}

async function handler(req: any, res: any) {
  const { method } = req;

  switch (method) {
    case "POST":
      await post(req, res);
      return;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).send("Method not allowed");
  }
}

export default handler;
