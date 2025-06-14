import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

beforeEach(() => {
  localStorage.clear();
});

// Vitest may run inside a Bun environment that lacks `process.channel.unref`.
// Provide a noop implementation to avoid runtime errors from dependencies like
// Tinypool.
// Avoid explicit `any` to satisfy Biome's lint rules.
const channel = process.channel as unknown as
  | { unref?: () => void }
  | undefined;
if (channel && typeof channel.unref !== "function") {
  channel.unref = () => {};
}
