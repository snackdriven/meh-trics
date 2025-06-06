export const uiText = {
  createHabit: {
    dialogTitle: 'Create New Habit',
    emojiLabel: 'Emoji',
    nameLabel: 'Habit Name',
    namePlaceholder: 'e.g., Drink 8 glasses of water',
    descriptionLabel: 'Description (optional)',
    descriptionPlaceholder: 'Why is this habit important to you?',
    frequencyLabel: 'Frequency',
    targetCountLabel: 'Target Count',
    targetCountPlaceholder: '1',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date (optional)',
    cancel: 'Cancel',
    submit: 'Create Habit',
    submitting: 'Creating...'
  },
  editHabit: {
    dialogTitle: 'Edit Habit',
    emojiLabel: 'Emoji',
    nameLabel: 'Habit Name',
    namePlaceholder: 'e.g., Drink 8 glasses of water',
    descriptionLabel: 'Description (optional)',
    descriptionPlaceholder: 'Why is this habit important to you?',
    frequencyLabel: 'Frequency',
    targetCountLabel: 'Target Count',
    targetCountPlaceholder: '1',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date (optional)',
    cancel: 'Cancel',
    submit: 'Update Habit',
    submitting: 'Updating...'
  },
  createRecurringTask: {
    dialogTitle: 'Create Recurring Task Template',
    titleLabel: 'Title',
    titlePlaceholder: 'What task should be created regularly?',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Any additional details...',
    frequencyLabel: 'Frequency',
    priorityLabel: 'Priority',
    maxOccurrencesLabel: 'Times / cycle',
    energyLevelLabel: 'Energy Level',
    energySelectPlaceholder: 'Select energy',
    nextDueDateLabel: 'Next Due Date',
    tagLabel: 'Tags',
    customTagPlaceholder: 'Add custom tag...',
    addButton: 'Add',
    cancel: 'Cancel',
    submit: 'Create Template',
    submitting: 'Creating...'
  }
} as const;
export type UiText = typeof uiText;
