export type ParsedQuery = {
  operationType: "query" | "mutation";
  operationName?: string;
  rootField: string;
  selections: string[];
  arguments: Record<string, string | number>;
};

export type ParseResult =
  | { ok: true; parsed: ParsedQuery; errors: [] }
  | { ok: false; parsed?: undefined; errors: string[] };

export function parseQuery(query: string): ParseResult {
  const sanitized = query
    .split("\n")
    .map((line) => line.replace(/#.*/, "").trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) {
    return { ok: false, errors: ["Query is empty."] };
  }

  const openIndex = sanitized.indexOf("{");
  if (openIndex < 0) {
    return { ok: false, errors: ["Missing selection set '{ ... }'."] };
  }

  const prefix = sanitized.slice(0, openIndex).trim();
  const rootBlock = extractBalancedBlock(sanitized, openIndex);
  if (!rootBlock) {
    return { ok: false, errors: ["Unbalanced braces in query."] };
  }

  const opMatch = prefix.match(/^(query|mutation)?\s*([A-Za-z_][A-Za-z0-9_]*)?$/);
  const operationType = (opMatch?.[1] as "query" | "mutation" | undefined) ?? "query";
  const operationName = opMatch?.[2];

  const root = parseRoot(rootBlock.content);
  if (!root.ok) {
    return { ok: false, errors: [root.error] };
  }

  return {
    ok: true,
    errors: [],
    parsed: {
      operationType,
      operationName,
      rootField: root.rootField,
      selections: root.selections,
      arguments: root.arguments,
    },
  };
}

function parseRoot(content: string):
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
  const argumentsRaw = fieldMatch[3] ?? "";
  const hasNestedSelection = fieldMatch[4] === "{";

  const args = parseArgs(argumentsRaw);

  if (!hasNestedSelection) {
    return { ok: true, rootField, selections: [], arguments: args };
  }

  const nestedOpen = trimmed.indexOf("{");
  const nestedBlock = extractBalancedBlock(trimmed, nestedOpen);
  if (!nestedBlock) {
    return { ok: false, error: "Nested selection set is unbalanced." };
  }

  const selections = Array.from(nestedBlock.content.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g)).map(
    (match) => match[1]
  );

  return {
    ok: true,
    rootField,
    selections: selections.filter((value, idx, all) => all.indexOf(value) === idx),
    arguments: args,
  };
}

function parseArgs(raw: string): Record<string, string | number> {
  if (!raw.trim()) {
    return {};
  }

  const args: Record<string, string | number> = {};

  raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [name, valueRaw] = part.split(":").map((item) => item.trim());
      if (!name || !valueRaw) {
        return;
      }

      if (/^".*"$/.test(valueRaw)) {
        args[name] = valueRaw.slice(1, -1);
        return;
      }

      const asNumber = Number(valueRaw);
      args[name] = Number.isNaN(asNumber) ? valueRaw : asNumber;
    });

  return args;
}

function extractBalancedBlock(input: string, openIndex: number): { content: string } | null {
  if (input[openIndex] !== "{") {
    return null;
  }

  let depth = 0;

  for (let index = openIndex; index < input.length; index += 1) {
    const char = input[index];

    if (char === "{") {
      depth += 1;
    }
    if (char === "}") {
      depth -= 1;
    }

    if (depth === 0) {
      return { content: input.slice(openIndex + 1, index) };
    }
  }

  return null;
}