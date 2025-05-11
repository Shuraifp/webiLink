import { createHmac } from "crypto";

export function generateToken(userID: string, expired_ts: number): string {
  const appID = process.env.ZEGO_APP_ID;
  const serverSecret = process.env.ZEGO_SERVER_SECRET;
  if (!appID || !serverSecret) {
    throw new Error("ZegoCloud credentials not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2);
  const payload = `${appID}:${userID}:${nonce}:${timestamp}:${expired_ts}`;
  const signature = createHmac("sha256", serverSecret).update(payload).digest("hex");
  return `${appID}:${timestamp}:${nonce}:${signature}`;
}