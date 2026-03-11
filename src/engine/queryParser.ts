export type ParsedQuery = {
  operationType: "query" | "mutation";
  operationName?: string;
  rootField: string;
  selections: string[];
  arguments: Record<string, string | number>;
  raw: string;
};

export type ParseResult =
  | { ok: true; parsed: ParsedQuery; errors: [] }
  | { ok: false; parsed?: undefined; errors: string[] };

export function queryParser(query: string): ParseResult {
  const sanitized = sanitizeQuery(query);
  if (!sanitized) {
    return { ok: false, errors: ["Query is empty."] };
  }

  const openingBrace = sanitized.indexOf("{");
  if (openingBrace < 0) {
    return { ok: false, errors: ["Missing selection set '{ ... }'."] };
  }

  const prefix = sanitized.slice(0, openingBrace).trim();
  const block = extractBalancedBlock(sanitized, openingBrace);
  if (!block) {
    return { ok: false, errors: ["Unbalanced braces in query."] };
  }

  const operation = parseOperationPrefix(prefix);
  const root = parseRootField(block.content);
  if (!root.ok) {
    return { ok: false, errors: [root.error] };
  }

  return {
    ok: true,
    errors: [],
    parsed: {
      operationType: operation.operationType,
      operationName: operation.operationName,
      rootField: root.rootField,
      selections: root.selections,
      arguments: root.arguments,
      raw: sanitized,
    },
  };
}

function sanitizeQuery(query: string): string {
  return query
    .split("\n")
    .map((line) => line.replace(/#.*/, "").trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOperationPrefix(prefix: string): {
  operationType: "query" | "mutation";
  operationName?: string;
} {
  const match = prefix.match(/^(query|mutation)?\s*([A-Za-z_][A-Za-z0-9_]*)?$/);
  if (!match) {
    return { operationType: "query" };
  }

  return {
    operationType: (match[1] as "query" | "mutation") ?? "query",
    operationName: match[2],
  };
}

function parseRootField(content: string):
  | { ok: true; rootField: string; selections: string[]; arguments: Record<string, string | number> }
  | { ok: false; error: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false, error: "Selection set is empty." };
  }

  const fieldMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)(\s*\(([^)]*)\))?\s*(\{)?/);
  if (!fieldMatch) {
    return { ok: false, error: "Unable to parse root field." };
  }

  const rootField = fieldMatch[1];
  const argsRaw = fieldMatch[3] ?? "";
  const hasNestedSelections = fieldMatch[4] === "{";

  const args = parseArguments(argsRaw);

  if (!hasNestedSelections) {
    return {
      ok: true,
      rootField,
      selections: [],
      arguments: args,
    };
  }

  const openIndex = trimmed.indexOf("{");
  const nestedBlock = extractBalancedBlock(trimmed, openIndex);
  if (!nestedBlock) {
    return { ok: false, error: "Nested selection set is unbalanced." };
  }

  const selections = Array.from(
    nestedBlock.content.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g)
  ).map((match) => match[1]);

  return {
    ok: true,
    rootField,
    selections: selections.filter((value, index, array) => array.indexOf(value) === index),
    arguments: args,
  };
}

function parseArguments(argsRaw: string): Record<string, string | number> {
  if (!argsRaw.trim()) return {};

  const entries = argsRaw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const args: Record<string, string | number> = {};

  for (const entry of entries) {
    const [name, valueRaw] = entry.split(":").map((item) => item.trim());
    if (!name || !valueRaw) continue;

    if (/^".*"$/.test(valueRaw)) {
      args[name] = valueRaw.slice(1, -1);
      continue;
    }

    const asNumber = Number(valueRaw);
    args[name] = Number.isNaN(asNumber) ? valueRaw : asNumber;
  }

  return args;
}

function extractBalancedBlock(input: string, openIndex: number): { content: string; end: number } | null {
  if (input[openIndex] !== "{") return null;

  let depth = 0;

  for (let index = openIndex; index < input.length; index += 1) {
    const char = input[index];

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return {
        content: input.slice(openIndex + 1, index),
        end: index,
      };
    }
  }

  return null;
}
