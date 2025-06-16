import { useCallback, useEffect, useState } from "react";
import { useServiceWorker } from "./useServiceWorker";

interface NotificationConfig {
  habitReminders: boolean;
  moodCheckIns: boolean;
  achievementCelebrations: boolean;
  burnoutWarnings: boolean;
  weeklyReports: boolean;
  customSchedule: {
    morningCheckIn?: string; // HH:MM format
    eveningReflection?: string;
    weeklyReview?: string; // day + time
  };
}

interface SmartNotification {
  id: string;
  type: "reminder" | "achievement" | "warning" | "insight";
  title: string;
  body: string;
  priority: "low" | "normal" | "high";
  actionUrl?: string;
  scheduledFor?: Date;
  context?: {
    habitId?: number;
    taskId?: number;
    moodPattern?: string;
  };
}

export function useSmartNotifications() {
  const [config, setConfig] = useState<NotificationConfig>({
    habitReminders: true,
    moodCheckIns: true,
    achievementCelebrations: true,
    burnoutWarnings: true,
    weeklyReports: true,
    customSchedule: {
      morningCheckIn: "09:00",
      eveningReflection: "20:00",
      weeklyReview: "sunday-19:00",
    },
  });

  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { isSupported, registration } = useServiceWorker();

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (permission === "granted") return true;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [permission]);

  // Schedule intelligent notifications based on user patterns
  const scheduleSmartNotifications = useCallback(async () => {
    if (!isSupported || !registration || permission !== "granted") return;

    try {
      // Cancel existing notifications
      const existingNotifications = await registration.getNotifications();
      existingNotifications.forEach((notification) => notification.close());

      // Schedule based on user patterns and preferences
      const notifications = await generateSmartNotifications(config);

      for (const notification of notifications) {
        if (notification.scheduledFor && notification.scheduledFor > new Date()) {
          // Schedule future notification
          setTimeout(() => {
            void showNotification(notification);
          }, notification.scheduledFor.getTime() - Date.now());
        }
      }
    } catch (error) {
      console.error("Failed to schedule notifications:", error);
    }
  }, [isSupported, registration, permission, config]);

  // Show immediate notification
  const showNotification = useCallback(
    async (notification: SmartNotification) => {
      if (!isSupported || !registration || permission !== "granted") return;

      try {
        await registration.showNotification(notification.title, {
          body: notification.body,
          tag: notification.id,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          data: notification.context,
          actions: notification.actionUrl
            ? [
                { action: "open", title: "Open App" },
                { action: "dismiss", title: "Dismiss" },
              ]
            : undefined,
          requireInteraction: notification.priority === "high",
        });
      } catch (error) {
        console.error("Failed to show notification:", error);
      }
    },
    [isSupported, registration, permission]
  );

  // Update configuration
  const updateConfig = useCallback(
    async (newConfig: Partial<NotificationConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);

      // Save to localStorage
      localStorage.setItem("notificationConfig", JSON.stringify(updatedConfig));

      // Reschedule notifications with new config
      await scheduleSmartNotifications();
    },
    [config, scheduleSmartNotifications]
  );

  // Initialize
  useEffect(() => {
    // Load saved configuration
    const saved = localStorage.getItem("notificationConfig");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (error) {
        console.warn("Failed to load notification config:", error);
      }
    }

    // Check current permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Schedule notifications when config changes
  useEffect(() => {
    if (permission === "granted") {
      void scheduleSmartNotifications();
    }
  }, [permission, scheduleSmartNotifications]);

  return {
    permission,
    config,
    requestPermission,
    updateConfig,
    showNotification,
    scheduleSmartNotifications,
    isSupported: isSupported && "Notification" in window,
  };
}

async function generateSmartNotifications(
  config: NotificationConfig
): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];
  const now = new Date();

  // Morning check-in reminder
  if (config.moodCheckIns && config.customSchedule.morningCheckIn) {
    const [hours, minutes] = config.customSchedule.morningCheckIn.split(":").map(Number);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    notifications.push({
      id: `morning-checkin-${tomorrow.getTime()}`,
      type: "reminder",
      title: "Good morning! 🌅",
      body: "How are you feeling today? Take a moment to check in with yourself.",
      priority: "normal",
      scheduledFor: tomorrow,
      actionUrl: "/mood",
    });
  }

  // Evening reflection reminder
  if (config.moodCheckIns && config.customSchedule.eveningReflection) {
    const [hours, minutes] = config.customSchedule.eveningReflection.split(":").map(Number);
    const tonight = new Date(now);
    tonight.setHours(hours, minutes, 0, 0);

    if (tonight < now) {
      tonight.setDate(tonight.getDate() + 1);
    }

    notifications.push({
      id: `evening-reflection-${tonight.getTime()}`,
      type: "reminder",
      title: "Evening reflection 🌙",
      body: "Take a moment to reflect on your day and log any thoughts.",
      priority: "normal",
      scheduledFor: tonight,
      actionUrl: "/journal",
    });
  }

  // Weekly review (example for Sunday)
  if (config.weeklyReports && config.customSchedule.weeklyReview) {
    const [_day, time] = config.customSchedule.weeklyReview.split("-");
    const [hours, minutes] = time.split(":").map(Number);

    const nextSunday = new Date(now);
    const daysUntilSunday = (7 - nextSunday.getDay()) % 7;
    nextSunday.setDate(nextSunday.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    nextSunday.setHours(hours, minutes, 0, 0);

    notifications.push({
      id: `weekly-review-${nextSunday.getTime()}`,
      type: "insight",
      title: "Weekly Review 📊",
      body: "Your weekly insights are ready! See how your week went.",
      priority: "normal",
      scheduledFor: nextSunday,
      actionUrl: "/analytics",
    });
  }

  return notifications;
}
