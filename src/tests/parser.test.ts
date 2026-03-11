import { describe, expect, it } from "vitest";
import { queryParser } from "../engine/queryParser";

describe("queryParser", () => {
  it("parses query operation with root field and selections", () => {
    const result = queryParser(`query GetUsers { users { id name role } }`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.parsed.operationType).toBe("query");
    expect(result.parsed.operationName).toBe("GetUsers");
    expect(result.parsed.rootField).toBe("users");
    expect(result.parsed.selections).toEqual(["id", "name", "role"]);
  });

  it("parses mutation operation type", () => {
    const result = queryParser(`mutation UpdateUser { user(id: "1") { id } }`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.parsed.operationType).toBe("mutation");
    expect(result.parsed.arguments.id).toBe("1");
  });

  it("returns parser errors for missing braces", () => {
    const result = queryParser(`query users id name`);

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors[0]).toContain("Missing selection set");
  });
});
