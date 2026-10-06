import { describe, expect, it } from "vitest";
import { buildApiUrl, isUnauthorized } from "./api";

describe("buildApiUrl", () => {
  it("joins base URL and path with a single slash", () => {
    expect(buildApiUrl("/api/users", "http://api.test")).toBe("http://api.test/api/users");
    expect(buildApiUrl("api/users", "http://api.test")).toBe("http://api.test/api/users");
  });
});

describe("isUnauthorized", () => {
  it.each([401, 403])("flags %i as unauthorized", (status) => {
    expect(isUnauthorized({ status })).toBe(true);
  });

  it.each([200, 400, 404, 409, 500])("does not flag %i", (status) => {
    expect(isUnauthorized({ status })).toBe(false);
  });
});
