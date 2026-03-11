import { mockData } from "../data/schema";
import type { ParsedQuery } from "./queryParser";

type GraphQLResponse = {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string }>;
};

export function mockResolver(parsed: ParsedQuery): GraphQLResponse {
  const field = parsed.rootField;

  if (field === "users") {
    return {
      data: {
        users: mockData.users.map((user) => projectFields(user, parsed.selections)),
      },
    };
  }

  if (field === "user") {
    const id = String(parsed.arguments.id ?? "");
    const user = mockData.users.find((item) => item.id === id);

    return {
      data: {
        user: user ? projectFields(user, parsed.selections) : null,
      },
    };
  }

  if (field === "posts") {
    return {
      data: {
        posts: mockData.posts.map((post) => projectFields(post, parsed.selections)),
      },
    };
  }

  return {
    errors: [{ message: `Unknown root field '${field}'.` }],
  };
}

function projectFields(
  item: Record<string, unknown>,
  selections: string[]
): Record<string, unknown> {
  if (selections.length === 0) return item;

  return selections.reduce<Record<string, unknown>>((result, field) => {
    if (field in item) {
      result[field] = item[field];
    }
    return result;
  }, {});
}
