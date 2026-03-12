import { describe, expect, it } from "vitest";
import { parseQuery } from "../engine/parser";

describe("parseQuery", () => {
  it("parses operation, root field, and selections", () => {
    const result = parseQuery(`query GetUsers { users { id name role } }`);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.parsed.operationType).toBe("query");
    expect(result.parsed.operationName).toBe("GetUsers");
    expect(result.parsed.rootField).toBe("users");
    expect(result.parsed.selections).toEqual(["id", "name", "role"]);
  });

  it("parses root arguments", () => {
    const result = parseQuery(`query GetUser { user(id: "1") { id name } }`);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.parsed.arguments.id).toBe("1");
  });

  it("returns error for missing selection block", () => {
    const result = parseQuery(`query users id name`);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.errors[0]).toContain("Missing selection set");
  });

  it("returns error for unbalanced braces", () => {
    const result = parseQuery(`query Broken { users { id name }`);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.errors[0]).toContain("Unbalanced braces");
  });
});