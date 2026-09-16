import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../crypto.js";

describe("encrypt/decrypt", () => {
  it("round-trips plaintext through AES-256-GCM", () => {
    const plaintext = "gho_super-secret-github-token";
    const encrypted = encrypt(plaintext);

    expect(encrypted).toHaveProperty("iv");
    expect(encrypted).toHaveProperty("content");
    expect(encrypted).toHaveProperty("tag");

    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("produces a different iv/ciphertext on every call (no nonce reuse)", () => {
    const a = encrypt("same input");
    const b = encrypt("same input");

    expect(a.iv).not.toBe(b.iv);
    expect(a.content).not.toBe(b.content);
  });

  it("fails closed when the auth tag has been tampered with", () => {
    const encrypted = encrypt("payload");
    const flipped = encrypted.tag[0] === "0" ? "1" : "0";
    const tampered = { ...encrypted, tag: flipped + encrypted.tag.slice(1) };

    expect(() => decrypt(tampered)).toThrow();
  });
});
