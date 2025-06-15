# Theme Customization System

This document explains how to use the comprehensive theme customization system built for the Meh-trics application.

## Overview

The theme system provides:
- **Real-time color customization** with live preview
- **Multiple theme management** (create, edit, delete custom themes)
- **Theme import/export** for sharing and backup
- **Automatic light/dark mode** based on system preference
- **Type-safe color tokens** preventing invalid color usage
- **Persistent theme settings** across browser sessions

## Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 2. Add theme controls to your UI

```tsx
import { ThemeModeToggle, ThemeCustomizer } from './components/ThemeIntegration';

function Header() {
  return (
    <header>
      <div className="flex items-center gap-2">
        <ThemeModeToggle />
        <ThemeCustomizer />
      </div>
    </header>
  );
}
```

### 3. Use theme-aware colors in components

```tsx
// Use CSS custom properties for automatic theme switching
<div className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)]">
  Content that adapts to theme
</div>

// Or use semantic color functions
import { getPriorityColor, getStatusColor } from '../lib/colors';

<Badge className={getStatusColor('done')}>Complete</Badge>
<Badge className={getPriorityColor(4)}>High Priority</Badge>
```

## Components

### ThemeCustomizer
The main theme customization interface providing:
- **Theme selection** and switching
- **Color customization** with visual picker
- **Live preview** of changes
- **Import/export** functionality
- **Theme creation** and management

### ColorPicker
Advanced color picker supporting:
- **Hex, RGB, HSL** formats
- **Color presets** for quick selection
- **Visual color picker** (HTML5 input)
- **Copy to clipboard** functionality
- **Real-time validation**

### ThemePreview
Comprehensive preview showing:
- **Button variants** in all states
- **Card layouts** with realistic content
- **Form elements** and inputs
- **Status indicators** and badges
- **Progress bars** and icons

## Color System

### Categories

1. **Primary Colors** - Main brand and interactive colors
   - `--color-primary` - Main brand color
   - `--color-primary-hover` - Hover states

2. **Background Colors** - Page and component backgrounds
   - `--color-background-primary` - Main background
   - `--color-background-secondary` - Card/panel backgrounds
   - `--color-background-tertiary` - Subtle backgrounds

3. **Text Colors** - Typography colors
   - `--color-text-primary` - Main text
   - `--color-text-secondary` - Secondary text
   - `--color-text-tertiary` - Muted text

4. **Semantic Colors** - Status and feedback
   - `--color-semantic-success-*` - Success states
   - `--color-semantic-error-*` - Error states
   - `--color-semantic-warning-*` - Warning states

5. **Compassionate Colors** - Wellbeing and emotional colors
   - `--color-compassionate-celebration` - Achievement colors
   - `--color-compassionate-gentle` - Calming colors

### Adding New Colors

1. **Define the color token:**
```tsx
const newToken: ColorToken = {
  name: 'New Color',
  variable: '--color-new-color',
  value: '#9333ea',
  description: 'Used for new feature highlights',
  category: 'primary'
};
```

2. **Add to theme configuration:**
```tsx
// In ThemeContext.tsx, add to defaultLightColors
'color-new-color': newToken
```

3. **Use in components:**
```tsx
<div className="bg-[var(--color-new-color)]">
  Content with new color
</div>
```

## Advanced Usage

### Creating Custom Themes

```tsx
const { createTheme, updateColorToken } = useTheme();

// Create a new theme
const myTheme = createTheme('My Custom Theme', 'default-light');

// Update specific colors
updateColorToken(myTheme.id, 'color-primary', '#ff6b35');
updateColorToken(myTheme.id, 'color-background-primary', '#fef7f0');
```

### Exporting/Importing Themes

```tsx
const { exportTheme, importTheme } = useTheme();

// Export current theme
const themeData = exportTheme(currentTheme.id);
// Save to file or share

// Import a theme
const importedTheme = importTheme(themeJsonString);
```

### Programmatic Theme Switching

```tsx
const { switchTheme, setThemeMode } = useTheme();

// Switch to specific theme
switchTheme('my-custom-theme-id');

// Set mode preference
setThemeMode('dark'); // 'light' | 'dark' | 'auto'
```

## Best Practices

### 1. Always Use CSS Custom Properties
✅ **Good:**
```tsx
<div className="bg-[var(--color-background-primary)]">
```

❌ **Bad:**
```tsx
<div className="bg-white dark:bg-gray-900">
```

### 2. Use Semantic Color Functions
✅ **Good:**
```tsx
<Badge className={getStatusColor(task.status)}>
```

❌ **Bad:**
```tsx
<Badge className="bg-green-100 text-green-800">
```

### 3. Organize Colors by Category
Keep related colors grouped together and use consistent naming:
- `--color-category-purpose-variant`
- Example: `--color-semantic-success-bg`

### 4. Test in Both Light and Dark Modes
Always verify your color choices work well in both themes.

### 5. Provide Meaningful Descriptions
When adding new color tokens, include clear descriptions of their purpose.

## Accessibility

The theme system includes accessibility considerations:
- **High contrast ratios** for text readability
- **Consistent focus indicators** across themes
- **Reduced motion** support for animations
- **System preference** integration

## Migration Guide

### From Hardcoded Colors

1. **Find hardcoded colors:**
```bash
# Search for hardcoded Tailwind colors
grep -r "bg-purple-600\|text-red-500" src/
```

2. **Replace with design tokens:**
```tsx
// Before
<Button className="bg-purple-600 hover:bg-purple-700">

// After  
<Button> // Uses default design system colors
```

3. **Add semantic functions:**
```tsx
// Before
<Badge className="bg-green-100 text-green-800">

// After
<Badge className={getStatusColor('success')}>
```

## Troubleshooting

### Colors Not Updating
- Ensure `ThemeProvider` wraps your app
- Check browser console for CSS variable errors
- Verify color values are valid CSS colors

### Performance Issues
- Use CSS custom properties instead of inline styles
- Minimize theme switching frequency
- Consider debouncing rapid color changes

### Type Errors
- Ensure proper imports from type definitions
- Check color category values match defined types
- Verify theme configuration structure

## Contributing

When adding new features to the theme system:

1. **Update type definitions** in `types/theme.ts`
2. **Add comprehensive tests** for new functionality
3. **Update documentation** with examples
4. **Ensure backward compatibility** with existing themes
5. **Test across different screen sizes** and devices

## Support

For issues or questions:
- Check existing GitHub issues
- Review component documentation
- Test with minimal reproduction case
- Include theme configuration in bug reports