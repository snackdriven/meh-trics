import { useCallback } from "react";

/**
 * Returns a function to trigger a celebratory confetti burst.
 * Loads the lightweight canvas-confetti library on demand.
 */
export function useConfetti() {
  return useCallback(async () => {
    // Explicitly reference the ESM build to avoid resolution issues
    const confetti = (await import("canvas-confetti/dist/confetti.module.mjs"))
      .default;
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);
}
