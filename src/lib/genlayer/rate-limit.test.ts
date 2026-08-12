import { describe, expect, it } from "vitest";
import { dedupedRequest } from "./rate-limit";

describe("dedupedRequest", () => {
  it("coalesces concurrent reads under one RPC key", async () => {
    let calls = 0;
    const run = async () => { calls += 1; return "chain-result"; };
    await expect(Promise.all([dedupedRequest("lab:1", run), dedupedRequest("lab:1", run)])).resolves.toEqual(["chain-result", "chain-result"]);
    expect(calls).toBe(1);
  });
});
