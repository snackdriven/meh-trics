import { describe, it, expect } from "vitest";
import {
  evaluateHabitSuccess,
  evaluateTaskSuccess,
  calculateFlexibleCompletionRate,
  determineCelebrationTrigger,
} from "./success-criteria";
import type { FlexibleSuccess } from "../habits/types";

describe("Success Criteria Evaluation", () => {
  describe("evaluateHabitSuccess", () => {
    it("evaluates exact success criteria", () => {
      const criteria: FlexibleSuccess = {
        criteria: "exact",
        targetCount: 5,
        allowPartialStreaks: false,
      };

      // Meeting target exactly
      const result1 = evaluateHabitSuccess(5, 5, criteria);
      expect(result1.isFullSuccess).toBe(true);
      expect(result1.isPartialSuccess).toBe(false);
      expect(result1.countsForStreak).toBe(true);
      expect(result1.successPercentage).toBe(100);

      // Exceeding target
      const result2 = evaluateHabitSuccess(7, 5, criteria);
      expect(result2.isFullSuccess).toBe(true);
      expect(result2.successPercentage).toBe(100);

      // Below target
      const result3 = evaluateHabitSuccess(3, 5, criteria);
      expect(result3.isFullSuccess).toBe(false);
      expect(result3.countsForStreak).toBe(false);
      expect(result3.successPercentage).toBe(60);
    });

    it("evaluates minimum success criteria", () => {
      const criteria: FlexibleSuccess = {
        criteria: "minimum",
        targetCount: 10,
        minimumCount: 5,
        allowPartialStreaks: true,
      };

      // Full success
      const result1 = evaluateHabitSuccess(10, 10, criteria);
      expect(result1.isFullSuccess).toBe(true);
      expect(result1.isPartialSuccess).toBe(false);
      expect(result1.isMinimumSuccess).toBe(true);
      expect(result1.countsForStreak).toBe(true);

      // Partial success
      const result2 = evaluateHabitSuccess(7, 10, criteria);
      expect(result2.isFullSuccess).toBe(false);
      expect(result2.isPartialSuccess).toBe(true);
      expect(result2.isMinimumSuccess).toBe(true);
      expect(result2.countsForStreak).toBe(true);

      // Below minimum
      const result3 = evaluateHabitSuccess(3, 10, criteria);
      expect(result3.isFullSuccess).toBe(false);
      expect(result3.isPartialSuccess).toBe(false);
      expect(result3.isMinimumSuccess).toBe(false);
      expect(result3.countsForStreak).toBe(false);
    });

    it("evaluates flexible success criteria", () => {
      const criteria: FlexibleSuccess = {
        criteria: "flexible",
        targetCount: 10,
        minimumCount: 3,
        allowPartialStreaks: true,
      };

      // Full success
      const result1 = evaluateHabitSuccess(10, 10, criteria);
      expect(result1.isFullSuccess).toBe(true);
      expect(result1.successDescription).toContain("Excellent!");

      // Partial success (70% threshold)
      const result2 = evaluateHabitSuccess(8, 10, criteria);
      expect(result2.isPartialSuccess).toBe(true);
      expect(result2.successDescription).toContain("Great progress");

      // Minimum success (30% threshold)
      const result3 = evaluateHabitSuccess(4, 10, criteria);
      expect(result3.isMinimumSuccess).toBe(true);
      expect(result3.successDescription).toContain("Good start");

      // Below minimum
      const result4 = evaluateHabitSuccess(2, 10, criteria);
      expect(result4.isMinimumSuccess).toBe(false);
      expect(result4.countsForStreak).toBe(false);
    });

    it("handles default criteria when none provided", () => {
      const result = evaluateHabitSuccess(5, 10);
      expect(result.isFullSuccess).toBe(false);
      expect(result.countsForStreak).toBe(false);
    });
  });

  describe("evaluateTaskSuccess", () => {
    it("evaluates completed tasks", () => {
      const result = evaluateTaskSuccess(true);
      expect(result.isFullSuccess).toBe(true);
      expect(result.successPercentage).toBe(100);
      expect(result.countsForStreak).toBe(true);
      expect(result.successDescription).toContain("completed!");
    });

    it("evaluates partial task completion", () => {
      const result = evaluateTaskSuccess(false, 80);
      expect(result.isFullSuccess).toBe(false);
      expect(result.isPartialSuccess).toBe(true);
      expect(result.successPercentage).toBe(80);
      expect(result.countsForStreak).toBe(true);
      expect(result.successDescription).toContain("Almost there");
    });

    it("evaluates minimum task effort", () => {
      const result = evaluateTaskSuccess(false, 40);
      expect(result.isPartialSuccess).toBe(false);
      expect(result.isMinimumSuccess).toBe(true);
      expect(result.successDescription).toContain("Good start");
    });

    it("evaluates no progress", () => {
      const result = evaluateTaskSuccess(false, 0);
      expect(result.isFullSuccess).toBe(false);
      expect(result.isPartialSuccess).toBe(false);
      expect(result.isMinimumSuccess).toBe(false);
      expect(result.countsForStreak).toBe(false);
    });
  });

  describe("calculateFlexibleCompletionRate", () => {
    it("calculates rates with mixed success levels", () => {
      const entries = [
        { count: 10, targetCount: 10 }, // Full success
        { count: 7, targetCount: 10 },  // Partial (with default criteria)
        { count: 3, targetCount: 10 },  // Minimum
        { count: 1, targetCount: 10 },  // No success
      ];

      const result = calculateFlexibleCompletionRate(entries);
      expect(result.totalCompletions).toBe(1); // Only full success
      expect(result.flexibleCompletionRate).toBeGreaterThan(result.fullCompletionRate);
    });

    it("handles empty entries", () => {
      const result = calculateFlexibleCompletionRate([]);
      expect(result.fullCompletionRate).toBe(0);
      expect(result.flexibleCompletionRate).toBe(0);
      expect(result.totalCompletions).toBe(0);
      expect(result.partialCompletions).toBe(0);
    });
  });

  describe("determineCelebrationTrigger", () => {
    const mockEvaluation = {
      isFullSuccess: true,
      isPartialSuccess: false,
      isMinimumSuccess: true,
      successPercentage: 100,
      successDescription: "Completed",
      countsForStreak: true,
    };

    it("triggers first completion celebration", () => {
      const result = determineCelebrationTrigger(
        mockEvaluation,
        1,
        true, // First ever
        false
      );

      expect(result.shouldCelebrate).toBe(true);
      expect(result.trigger).toBe("first_completion");
      expect(result.successType).toBe("full");
    });

    it("triggers comeback celebration", () => {
      const result = determineCelebrationTrigger(
        mockEvaluation,
        1,
        false,
        true // Comeback
      );

      expect(result.shouldCelebrate).toBe(true);
      expect(result.trigger).toBe("comeback");
    });

    it("triggers streak milestone celebration", () => {
      const result = determineCelebrationTrigger(
        mockEvaluation,
        7, // 7-day streak
        false,
        false
      );

      expect(result.shouldCelebrate).toBe(true);
      expect(result.trigger).toBe("streak_milestone");
    });

    it("does not celebrate regular progress", () => {
      const result = determineCelebrationTrigger(
        mockEvaluation,
        2, // Regular day
        false,
        false
      );

      expect(result.shouldCelebrate).toBe(false);
    });

    it("handles partial success correctly", () => {
      const partialEvaluation = {
        ...mockEvaluation,
        isFullSuccess: false,
        isPartialSuccess: true,
      };

      const result = determineCelebrationTrigger(
        partialEvaluation,
        1,
        true,
        false
      );

      expect(result.shouldCelebrate).toBe(true);
      expect(result.successType).toBe("partial");
    });
  });
});

describe("Success Criteria Integration", () => {
  it("provides encouraging messages for different success levels", () => {
    const flexibleCriteria: FlexibleSuccess = {
      criteria: "flexible",
      targetCount: 10,
      allowPartialStreaks: true,
    };

    // Test all levels of success have appropriate messaging
    const fullSuccess = evaluateHabitSuccess(10, 10, flexibleCriteria);
    expect(fullSuccess.successDescription).toContain("🎯");

    const partialSuccess = evaluateHabitSuccess(7, 10, flexibleCriteria);
    expect(partialSuccess.successDescription).toContain("👏");

    const minimumSuccess = evaluateHabitSuccess(4, 10, flexibleCriteria);
    expect(minimumSuccess.successDescription).toContain("✨");
  });

  it("supports progressive difficulty with flexible criteria", () => {
    const criteria: FlexibleSuccess = {
      criteria: "flexible",
      targetCount: 20,
      minimumCount: 5,
      allowPartialStreaks: true,
    };

    // Even small progress should be acknowledged
    const smallProgress = evaluateHabitSuccess(6, 20, criteria);
    expect(smallProgress.isMinimumSuccess).toBe(true);
    expect(smallProgress.countsForStreak).toBe(true);
  });
});