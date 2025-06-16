import type { AppEvent, EventHandler } from "../types";

// Auto-tagging handler for task events
export class TaskTaggingHandler implements EventHandler {
  eventType = "task.created" as const;

  async handle(event: AppEvent): Promise<void> {
    if (event.type !== "task.created") return;

    const { taskId, title, dueDate, priority } = event.data;

    // Generate contextual tags based on task properties
    const suggestedTags = this.generateTags(title, dueDate, priority);

    if (suggestedTags.length > 0) {
      console.log(`Auto-tagging task ${taskId} with tags:`, suggestedTags);
      // Here we would call the tagging service to apply tags
      // await backend.tagging.applyTags({ entityId: taskId, entityType: 'task', tags: suggestedTags });
    }
  }

  private generateTags(title: string, dueDate?: Date, priority?: string): string[] {
    const tags: string[] = [];

    // Time-based tags
    if (dueDate) {
      const now = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) tags.push("urgent");
      else if (diffDays <= 7) tags.push("this-week");
      else if (diffDays <= 30) tags.push("this-month");
    }

    // Priority tags
    if (priority) {
      tags.push(`priority-${priority}`);
    }

    // Content-based tags
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("meeting") || lowerTitle.includes("call")) {
      tags.push("meeting");
    }
    if (lowerTitle.includes("email") || lowerTitle.includes("reply")) {
      tags.push("communication");
    }
    if (lowerTitle.includes("review") || lowerTitle.includes("check")) {
      tags.push("review");
    }
    if (lowerTitle.includes("plan") || lowerTitle.includes("prepare")) {
      tags.push("planning");
    }

    return tags;
  }
}

// Journal entry tagging handler
export class JournalTaggingHandler implements EventHandler {
  eventType = "journal.created" as const;

  async handle(event: AppEvent): Promise<void> {
    if (event.type !== "journal.created") return;

    const { entryId, content, type } = event.data;

    // Generate tags based on journal content
    const suggestedTags = this.generateJournalTags(content, type);

    if (suggestedTags.length > 0) {
      console.log(`Auto-tagging journal entry ${entryId} with tags:`, suggestedTags);
      // Apply tags to journal entry
    }
  }

  private generateJournalTags(content: string, type: string): string[] {
    const tags: string[] = [];

    // Entry type tag
    tags.push(`journal-${type}`);

    // Sentiment analysis (basic)
    const lowerContent = content.toLowerCase();
    const positiveWords = [
      "happy",
      "good",
      "great",
      "amazing",
      "wonderful",
      "excited",
      "accomplished",
    ];
    const negativeWords = ["sad", "bad", "terrible", "awful", "frustrated", "stressed", "worried"];

    const positiveCount = positiveWords.filter((word) => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter((word) => lowerContent.includes(word)).length;

    if (positiveCount > negativeCount) {
      tags.push("positive-mood");
    } else if (negativeCount > positiveCount) {
      tags.push("challenging-day");
    }

    // Activity-based tags
    if (lowerContent.includes("work") || lowerContent.includes("office")) {
      tags.push("work");
    }
    if (lowerContent.includes("family") || lowerContent.includes("home")) {
      tags.push("family");
    }
    if (
      lowerContent.includes("exercise") ||
      lowerContent.includes("gym") ||
      lowerContent.includes("run")
    ) {
      tags.push("fitness");
    }

    return tags;
  }
}
