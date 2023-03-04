import { Account } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import prisma from "./prisma";

export interface AuthAccount {
  id: string;
  displayName: string;
  email: string;
  updatedAt: Date;
}

export interface Authenticator {
  validate(token: string): Promise<AuthAccount>;
  authenticate(user: Account): string;
}

class _JWTAuthenticator implements Authenticator {
  private secret: string;

  constructor() {
    this.secret = process.env.SESSION_SECRET || "abc123";
  }

  public async validate(token: string): Promise<AuthAccount> {
    try {
      const decode: any = jwt.verify(token, this.secret);

      const account = await prisma.account.findUnique({
        where: { id: decode.id },
      });
      if (account == null) {
        throw new Error(`Account for id: ${decode.id} does not exist`);
      }

      return {
        id: account.id.toString(),
        displayName: account.displayName || "",
        email: account.email,
        updatedAt: account.updatedAt,
      };
    } catch (err: any) {
      throw new Error(err);
    }
  }

  public authenticate(account: Account): string {
    return jwt.sign(
      {
        id: account.id.toString(),
        displayName: account.displayName,
        email: account.email,
        updatedAt: account.updatedAt,
      },
      this.secret,
      {
        expiresIn: "30d",
      }
    );
  }
}

export const JWTAuthenticator = new _JWTAuthenticator();
