import { cn } from "@/lib/utils";
import * as React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  CelebrationActions,
  CelebrationCard,
  CelebrationContainer,
  CelebrationIcon,
  CelebrationMessage,
  CelebrationProgress,
  CelebrationTitle,
  ConfettiOverlay,
  SuccessIndicator,
} from "./ui/celebration";

interface CelebrationData {
  id: string;
  trigger:
    | "first_completion"
    | "streak_milestone"
    | "weekly_goal"
    | "monthly_goal"
    | "comeback"
    | "consistency_boost";
  title: string;
  message: string;
  milestone?: string;
  celebrationType: "confetti" | "sparkles" | "badges" | "gentle";
  entityType: "habit" | "task";
  successType?: "full" | "partial" | "minimum";
  progress?: {
    current: number;
    total: number;
    label: string;
  };
}

interface CelebrationToastProps {
  celebration: CelebrationData;
  onDismiss: (id: string) => void;
  autoDisappear?: boolean;
  duration?: number;
}

const celebrationEmojis = {
  first_completion: "🎉",
  streak_milestone: "🔥",
  weekly_goal: "📅",
  monthly_goal: "🏆",
  comeback: "💪",
  consistency_boost: "⭐",
};

const celebrationVariants = {
  confetti: "exciting",
  sparkles: "milestone",
  badges: "milestone",
  gentle: "gentle",
} as const;

export const CelebrationToast = memo<CelebrationToastProps>(function CelebrationToast({
  celebration,
  onDismiss,
  autoDisappear = true,
  duration = 5000,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss(celebration.id), 300); // Allow exit animation
  }, [celebration.id, onDismiss]);

  useEffect(() => {
    // Trigger entrance animation
    const animationTimer = setTimeout(() => setIsAnimating(true), 100);

    // Auto-dismiss if enabled
    let dismissTimer: NodeJS.Timeout;
    if (autoDisappear) {
      dismissTimer = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      clearTimeout(animationTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [autoDisappear, duration, handleDismiss]);

  const emoji = useMemo(() => celebrationEmojis[celebration.trigger], [celebration.trigger]);
  const variant = useMemo(() => celebrationVariants[celebration.celebrationType], [celebration.celebrationType]);

  if (!isVisible) {
    return null;
  }

  return (
    <CelebrationContainer
      type={celebration.celebrationType}
      className={cn(
        "transition-all duration-300 ease-out",
        isAnimating ? "animate-in slide-in-from-bottom-5" : "opacity-0 translate-y-5"
      )}
    >
      {celebration.celebrationType === "confetti" && <ConfettiOverlay duration={duration} />}

      <CelebrationCard variant={variant}>
        <CelebrationIcon size="lg">{emoji}</CelebrationIcon>

        <CelebrationTitle>{celebration.title}</CelebrationTitle>

        <CelebrationMessage>{celebration.message}</CelebrationMessage>

        {celebration.milestone && (
          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-sm font-medium">
              {celebration.milestone}
            </span>
          </div>
        )}

        {celebration.successType && (
          <div className="mt-3 flex justify-center">
            <SuccessIndicator type={celebration.successType} achieved={true} />
          </div>
        )}

        {celebration.progress && (
          <CelebrationProgress
            current={celebration.progress.current}
            total={celebration.progress.total}
            label={celebration.progress.label}
          />
        )}

        <CelebrationActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            Awesome! 👍
          </Button>
        </CelebrationActions>
      </CelebrationCard>
    </CelebrationContainer>
  );
});

/**
 * Hook to manage celebration toasts
 */
export function useCelebrations() {
  const [celebrations, setCelebrations] = useState<CelebrationData[]>([]);

  const addCelebration = React.useCallback((celebration: Omit<CelebrationData, "id">) => {
    const newCelebration: CelebrationData = {
      ...celebration,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setCelebrations((prev) => [...prev, newCelebration]);
  }, []);

  const dismissCelebration = React.useCallback((id: string) => {
    setCelebrations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const triggerCelebration = React.useCallback(
    (data: {
      trigger: CelebrationData["trigger"];
      entityType: "habit" | "task";
      entityName: string;
      milestone?: string;
      successType?: "full" | "partial" | "minimum";
      progress?: CelebrationData["progress"];
    }) => {
      const celebrationMessages = {
        first_completion: {
          title: "First Success! 🎉",
          message: `You completed "${data.entityName}" for the first time! Every journey starts with a single step.`,
          celebrationType: "confetti" as const,
        },
        streak_milestone: {
          title: "Streak Achieved! 🔥",
          message: `${data.milestone} with "${data.entityName}"! You're building powerful habits.`,
          celebrationType: "sparkles" as const,
        },
        weekly_goal: {
          title: "Weekly Goal Reached! 📅",
          message: `You've completed your weekly goal for "${data.entityName}". Consistency is key!`,
          celebrationType: "badges" as const,
        },
        monthly_goal: {
          title: "Monthly Champion! 🏆",
          message: `Outstanding! You've achieved your monthly goal for "${data.entityName}".`,
          celebrationType: "confetti" as const,
        },
        comeback: {
          title: "Welcome Back! 💪",
          message: `Great to see you return to "${data.entityName}". Progress isn't about perfection.`,
          celebrationType: "gentle" as const,
        },
        consistency_boost: {
          title: "Consistency Star! ⭐",
          message: `You're showing amazing consistency with "${data.entityName}". Small steps, big results!`,
          celebrationType: "sparkles" as const,
        },
      };

      const template = celebrationMessages[data.trigger];

      addCelebration({
        trigger: data.trigger,
        title: template.title,
        message: template.message,
        milestone: data.milestone,
        celebrationType: template.celebrationType,
        entityType: data.entityType,
        successType: data.successType,
        progress: data.progress,
      });
    },
    [addCelebration]
  );

  return {
    celebrations,
    addCelebration,
    dismissCelebration,
    triggerCelebration,
  };
}

/**
 * Provider component for celebrations
 */
export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const { celebrations, dismissCelebration } = useCelebrations();

  return (
    <>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        {celebrations.map((celebration) => (
          <CelebrationToast
            key={celebration.id}
            celebration={celebration}
            onDismiss={dismissCelebration}
          />
        ))}
      </div>
    </>
  );
}
