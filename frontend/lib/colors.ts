/**
 * Semantic Color Utilities for Compassionate Productivity
 * 
 * Maps business logic (priority, status, energy) to design tokens
 * ensuring theme-aware colors with proper contrast
 */

import { cn } from "./utils"

/**
 * Priority color mapping using design tokens
 */
export const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 5: // Urgent
      return "bg-[var(--color-semantic-error-bg)] text-[var(--color-semantic-error-text)] border-[var(--color-semantic-error-border)]"
    case 4: // High  
      return "bg-[var(--color-semantic-warning-bg)] text-[var(--color-semantic-warning-text)] border-[var(--color-semantic-warning-border)]"
    case 3: // Medium
      return "bg-[var(--color-compassionate-wisdom-subtle)] text-[var(--color-compassionate-wisdom)] border-[var(--color-compassionate-wisdom)]"
    case 2: // Low
      return "bg-[var(--color-compassionate-gentle-subtle)] text-[var(--color-compassionate-gentle)] border-[var(--color-compassionate-gentle)]"
    case 1: // Lowest
      return "bg-[var(--color-compassionate-recovery-subtle)] text-[var(--color-compassionate-recovery)] border-[var(--color-compassionate-recovery)]"
    default:
      return "bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]"
  }
}

/**
 * Status color mapping using design tokens
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "todo":
      return "bg-[var(--color-compassionate-gentle-subtle)] text-[var(--color-compassionate-gentle)] border-[var(--color-compassionate-gentle)]"
    case "in_progress":
      return "bg-[var(--color-compassionate-wisdom-subtle)] text-[var(--color-compassionate-wisdom)] border-[var(--color-compassionate-wisdom)]"
    case "done":
      return "bg-[var(--color-semantic-success-bg)] text-[var(--color-semantic-success-text)] border-[var(--color-semantic-success-border)]"
    case "archived":
      return "bg-[var(--color-compassionate-recovery-subtle)] text-[var(--color-compassionate-recovery)] border-[var(--color-compassionate-recovery)]"
    default:
      return "bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]"
  }
}

/**
 * Energy level color mapping using design tokens
 */
export const getEnergyColor = (energy?: string): string => {
  switch (energy) {
    case "high":
      return "bg-[var(--color-compassionate-encouragement-subtle)] text-[var(--color-compassionate-encouragement)] border-[var(--color-compassionate-encouragement)]"
    case "medium":
      return "bg-[var(--color-compassionate-wisdom-subtle)] text-[var(--color-compassionate-wisdom)] border-[var(--color-compassionate-wisdom)]"
    case "low":
      return "bg-[var(--color-compassionate-gentle-subtle)] text-[var(--color-compassionate-gentle)] border-[var(--color-compassionate-gentle)]"
    default:
      return "bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]"
  }
}

/**
 * Frequency color mapping for habits
 */
export const getFrequencyColor = (frequency: string): string => {
  switch (frequency) {
    case "daily":
      return "bg-[var(--color-compassionate-gentle-subtle)] text-[var(--color-compassionate-gentle)] border-[var(--color-compassionate-gentle)]"
    case "weekly":
      return "bg-[var(--color-compassionate-encouragement-subtle)] text-[var(--color-compassionate-encouragement)] border-[var(--color-compassionate-encouragement)]"
    case "monthly":
      return "bg-[var(--color-compassionate-celebration-subtle)] text-[var(--color-compassionate-celebration)] border-[var(--color-compassionate-celebration)]"
    case "custom":
      return "bg-[var(--color-compassionate-wisdom-subtle)] text-[var(--color-compassionate-wisdom)] border-[var(--color-compassionate-wisdom)]"
    default:
      return "bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]"
  }
}

/**
 * Streak color mapping for progress indicators
 */
export const getStreakColor = (streak: number): string => {
  if (streak >= 30) return "text-[var(--color-compassionate-celebration)]"
  if (streak >= 14) return "text-[var(--color-compassionate-encouragement)]"
  if (streak >= 7) return "text-[var(--color-compassionate-gentle)]"
  if (streak >= 3) return "text-[var(--color-compassionate-wisdom)]"
  return "text-[var(--color-text-secondary)]"
}

/**
 * Mood color mapping for mood tracking
 */
export const getMoodColor = (mood: string, isSelected = false): string => {
  const baseClasses = "transition-all duration-200 border-2"
  
  if (isSelected) {
    return cn(
      baseClasses,
      "bg-[var(--color-compassionate-celebration)] text-white border-[var(--color-compassionate-celebration)]",
      "hover:bg-[var(--color-compassionate-celebration)] shadow-[var(--shadow-interactive-celebration-sparkles)]"
    )
  }
  
  return cn(
    baseClasses,
    "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border-[var(--color-border-primary)]",
    "hover:bg-[var(--color-compassionate-gentle-subtle)] hover:border-[var(--color-compassionate-gentle)]"
  )
}

/**
 * Progress color mapping for completion indicators
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return "bg-[var(--color-compassionate-encouragement)]"
  if (percentage >= 75) return "bg-gradient-to-r from-[var(--color-compassionate-gentle)] to-[var(--color-compassionate-encouragement)]"
  if (percentage >= 50) return "bg-[var(--color-compassionate-gentle)]"
  if (percentage >= 25) return "bg-[var(--color-compassionate-wisdom)]"
  return "bg-[var(--color-compassionate-recovery)]"
}

/**
 * Tag color mapping for contextual labels
 */
export const getTagColor = (tag?: string): string => {
  // Use a simple hash to consistently assign colors to tags
  if (!tag) return "bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]"
  
  const hash = tag.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const colors = [
    "bg-[var(--color-compassionate-gentle-subtle)] text-[var(--color-compassionate-gentle)] border-[var(--color-compassionate-gentle)]",
    "bg-[var(--color-compassionate-encouragement-subtle)] text-[var(--color-compassionate-encouragement)] border-[var(--color-compassionate-encouragement)]",
    "bg-[var(--color-compassionate-celebration-subtle)] text-[var(--color-compassionate-celebration)] border-[var(--color-compassionate-celebration)]",
    "bg-[var(--color-compassionate-wisdom-subtle)] text-[var(--color-compassionate-wisdom)] border-[var(--color-compassionate-wisdom)]",
    "bg-[var(--color-compassionate-recovery-subtle)] text-[var(--color-compassionate-recovery)] border-[var(--color-compassionate-recovery)]"
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Utility for empty states and placeholder text
 */
export const getEmptyStateColor = (): string => {
  return "text-[var(--color-text-tertiary)]"
}

/**
 * Utility for card backgrounds
 */
export const getCardColor = (isHighlighted = false): string => {
  if (isHighlighted) {
    return "bg-[var(--color-compassionate-gentle-subtle)] border-[var(--color-compassionate-gentle)]"
  }
  return "bg-[var(--color-background-secondary)] border-[var(--color-border-primary)]"
}