import { mockData } from "../data/schema";
import type { ParsedQuery } from "./parser";

export type GraphQLResult = {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string }>;
};

export function resolveQuery(parsed: ParsedQuery): GraphQLResult {
  if (parsed.rootField === "users") {
    return {
      data: {
        users: mockData.users.map((user) => pickFields(user, parsed.selections)),
      },
    };
  }

  if (parsed.rootField === "user") {
    const id = String(parsed.arguments.id ?? "");
    const user = mockData.users.find((item) => item.id === id);

    return {
      data: {
        user: user ? pickFields(user, parsed.selections) : null,
      },
    };
  }

  if (parsed.rootField === "posts") {
    return {
      data: {
        posts: mockData.posts.map((post) => pickFields(post, parsed.selections)),
      },
    };
  }

  return {
    errors: [{ message: `Unknown root field '${parsed.rootField}'.` }],
  };
}

function pickFields(item: Record<string, unknown>, selections: string[]): Record<string, unknown> {
  if (selections.length === 0) {
    return item;
  }

  return selections.reduce<Record<string, unknown>>((acc, key) => {
    if (key in item) {
      acc[key] = item[key];
    }
    return acc;
  }, {});
}