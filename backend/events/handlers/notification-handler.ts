import type { AppEvent, EventHandler } from "../types";

// Smart notification handler for task deadlines
export class TaskDeadlineNotificationHandler implements EventHandler {
  eventType = "task.created" as const;

  async handle(event: AppEvent): Promise<void> {
    if (event.type !== "task.created") return;

    const { taskId, userId, title, dueDate, priority } = event.data;

    if (dueDate) {
      const now = new Date();
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Schedule notifications based on priority and time
      if (priority === "high" && hoursDiff <= 24) {
        await this.scheduleNotification(userId, {
          title: "High Priority Task Due Soon",
          message: `"${title}" is due in ${Math.round(hoursDiff)} hours`,
          taskId,
          scheduledFor: new Date(now.getTime() + (hoursDiff / 2) * 60 * 60 * 1000),
        });
      } else if (hoursDiff <= 2) {
        await this.scheduleNotification(userId, {
          title: "Task Due Soon",
          message: `"${title}" is due in ${Math.round(hoursDiff)} hours`,
          taskId,
          scheduledFor: new Date(now.getTime() + 30 * 60 * 1000), // 30 min reminder
        });
      }
    }
  }

  private async scheduleNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      taskId: string;
      scheduledFor: Date;
    }
  ): Promise<void> {
    console.log(`Scheduling notification for user ${userId}:`, notification);
    // Here we would integrate with a notification service or queue
  }
}

// Habit streak notification handler
export class HabitStreakNotificationHandler implements EventHandler {
  eventType = "habit.completed" as const;

  async handle(event: AppEvent): Promise<void> {
    if (event.type !== "habit.completed") return;

    const { habitId, userId, success } = event.data;

    if (success) {
      // Check if this creates a milestone streak (3, 7, 14, 30, 100 days)
      const streakMilestones = [3, 7, 14, 30, 100];
      // In a real implementation, we'd fetch the current streak from the database
      const currentStreak = await this.getCurrentStreak(habitId);

      if (streakMilestones.includes(currentStreak)) {
        await this.sendStreakCelebration(userId, currentStreak, habitId);
      }
    }
  }

  private async getCurrentStreak(_habitId: string): Promise<number> {
    // Mock implementation - would query the database
    return Math.floor(Math.random() * 10) + 1;
  }

  private async sendStreakCelebration(
    userId: string,
    streak: number,
    _habitId: string
  ): Promise<void> {
    const messages = {
      3: "Great start! You're building momentum! 🔥",
      7: "One week strong! You're on fire! 🎉",
      14: "Two weeks of consistency! Amazing! ⭐",
      30: "30 days! You've built a real habit! 🏆",
      100: "100 days! You're a habit master! 👑",
    };

    console.log(
      `Streak celebration for user ${userId}: ${streak} days - ${messages[streak as keyof typeof messages]}`
    );
  }
}

// Mood check-in reminder handler
export class MoodReminderHandler implements EventHandler {
  eventType = "mood.created" as const;

  async handle(event: AppEvent): Promise<void> {
    if (event.type !== "mood.created") return;

    const { userId } = event.data;

    // Schedule next mood check-in reminder (e.g., 8 hours later)
    const nextReminder = new Date(Date.now() + 8 * 60 * 60 * 1000);

    console.log(`Scheduling next mood check-in reminder for user ${userId} at ${nextReminder}`);
    // Would integrate with notification scheduling service
  }
}
