import { useCallback } from "react";

/**
 * Returns a function to trigger a celebratory confetti burst.
 * Loads the lightweight canvas-confetti library on demand.
 */
export function useConfetti() {
  return useCallback(async () => {
    // Import canvas-confetti using standard module resolution
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);
}
