import { describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));

import { getReflectionPrompts } from "./get_reflection_prompts";

describe("getReflectionPrompts", () => {
  it("returns a list of prompts", async () => {
    const res = await getReflectionPrompts();
    expect(res.prompts.length).toBeGreaterThan(0);
  });
});
