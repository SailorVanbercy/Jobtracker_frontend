import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH, validateNewPassword } from "./validation";

describe("validateNewPassword", () => {
  const validPassword = "a".repeat(MIN_PASSWORD_LENGTH);

  it("rejects passwords shorter than the minimum length", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    expect(validateNewPassword(short, short)).toMatch(/au moins/);
  });

  it("rejects mismatching confirmation", () => {
    expect(validateNewPassword(validPassword, `${validPassword}x`)).toMatch(/correspondent pas/);
  });

  it("accepts a valid matching pair", () => {
    expect(validateNewPassword(validPassword, validPassword)).toBeNull();
  });
});
