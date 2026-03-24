import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.GITHUB_TOKEN_SECRET, "hex");

export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(encrypted.iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
