import jwt from "jsonwebtoken";
import crypto from "crypto";
import { SECRET_KEY_TOKEN } from "../global/config";
import { IUser } from "@models/database/user.model";
import { IBusinessUnit } from "@models/database/businessUnit.model";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  UserRole,
} from "@global/definitions";

//TOKEN TYPE STRING LITERALS EMBEDDED IN JWT PAYLOADS
export const TOKEN_TYPE_USER_ACCESS = "user-access";
export const TOKEN_TYPE_BUSINESS_ACCESS = "business-access";
export const TOKEN_TYPE_REFRESH = "refresh";

export interface RefreshTokenPayload {
  userID: string;
  jti: string;
  type: typeof TOKEN_TYPE_REFRESH;
}

export interface GeneratedRefreshToken {
  token: string;
  jti: string;
  expiresAt: Date;
}

export default class TokenUtils {

  /** Verify if is a valid token */
  static verifyToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, SECRET_KEY_TOKEN);
      return {
        valid: true,
        expired: false,
        decoded,
      };
    } catch (e: any) {
      return {
        valid: false,
        expired: e.message === "jwt expired",
        decoded: null,
      };
    }
  }

  /** Verify a refresh token and enforce type === 'refresh' */
  static verifyRefreshToken = (token: string) => {
    const result = TokenUtils.verifyToken(token);
    if (!result.valid || result.decoded == null) return result;

    const decoded = result.decoded as any;
    if (decoded.type !== TOKEN_TYPE_REFRESH) {
      return { valid: false, expired: false, decoded: null };
    }

    return result;
  }

  /** Generate a short-lived user access token (15 min) */
  static generateUserAccessToken = (user: IUser) => {
    return jwt.sign(
      {
        userID: user._id,
        type: TOKEN_TYPE_USER_ACCESS,
      },
      SECRET_KEY_TOKEN,
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS })
  }

  /** Generate a short-lived business access token (15 min) */
  static generateBusinessAccessToken = (userID: string, role: UserRole, businessUnit: IBusinessUnit) => {
    return jwt.sign(
      {
        userID,
        role,
        businessUnitID: businessUnit != undefined ? businessUnit._id : null,
        type: TOKEN_TYPE_BUSINESS_ACCESS,
      },
      SECRET_KEY_TOKEN,
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS })
  }

  /** Generate a long-lived refresh token (30 days). Returns raw JWT + jti + expiresAt. */
  static generateRefreshToken = (userID: string): GeneratedRefreshToken => {
    const jti = crypto.randomUUID();
    const token = jwt.sign(
      {
        userID,
        jti,
        type: TOKEN_TYPE_REFRESH,
      },
      SECRET_KEY_TOKEN,
      { expiresIn: REFRESH_TOKEN_TTL_SECONDS });

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    return { token, jti, expiresAt };
  }

  /** sha256 hex digest of a raw JWT — server stores only the hash */
  static hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * @deprecated Use generateUserAccessToken. Alias kept for backward-compat.
   */
  static generateUserToken = (user: IUser) => {
    return TokenUtils.generateUserAccessToken(user);
  }

  /**
   * @deprecated Use generateBusinessAccessToken. Alias kept for backward-compat.
   */
  static generateBusinessToken = (userID: string, role: UserRole, businessUnit: IBusinessUnit) => {
    return TokenUtils.generateBusinessAccessToken(userID, role, businessUnit);
  }

}
