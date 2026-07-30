export * from "./constants";
export * from "./schemas";
export * from "./utils";
export * from "./promotion";

/** Server Action egységes válasz. */
export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> };
