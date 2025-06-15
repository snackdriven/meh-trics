import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "./button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./dropdown-menu"
import { useTheme } from "../../contexts/ThemeContext"
import { cn } from "../../lib/utils"

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "icon"
  size?: "sm" | "md" | "lg"
  className?: string
  showLabel?: boolean
}

/**
 * Theme Toggle Component
 * 
 * Provides multiple variants for switching between light/dark/system themes
 * with smooth transitions and proper accessibility
 */
export function ThemeToggle({ 
  variant = "dropdown", 
  size = "md",
  className,
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

  // Simple toggle button (switches between light/dark)
  if (variant === "button") {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        onClick={toggleTheme}
        className={cn(
          "transition-all duration-200",
          "hover:bg-[var(--color-compassionate-gentle-subtle)]",
          "focus-visible:ring-[var(--color-compassionate-gentle)]",
          className
        )}
        aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        {showLabel && (
          <span className="ml-2 text-sm">
            {resolvedTheme === "dark" ? "Light" : "Dark"}
          </span>
        )}
      </Button>
    )
  }

  // Icon-only toggle
  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-lg p-2 transition-colors",
          "hover:bg-[var(--color-compassionate-gentle-subtle)]",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[var(--color-compassionate-gentle)]",
          "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
          size === "sm" && "h-8 w-8",
          size === "md" && "h-10 w-10",
          size === "lg" && "h-12 w-12",
          className
        )}
        aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
      >
        {resolvedTheme === "dark" ? (
          <Sun className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-4 w-4", 
            size === "lg" && "h-5 w-5"
          )} />
        ) : (
          <Moon className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-4 w-4",
            size === "lg" && "h-5 w-5"
          )} />
        )}
      </button>
    )
  }

  // Dropdown with all theme options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          className={cn(
            "transition-all duration-200",
            "hover:bg-[var(--color-compassionate-gentle-subtle)]",
            "focus-visible:ring-[var(--color-compassionate-gentle)]",
            className
          )}
          aria-label="Theme options"
        >
          {theme === "system" ? (
            <Monitor className="h-4 w-4" />
          ) : resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          {showLabel && (
            <span className="ml-2 text-sm capitalize">
              {theme === "system" ? "Auto" : theme}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="min-w-[120px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer transition-colors",
            theme === "light" && "bg-[var(--color-compassionate-encouragement-subtle)]"
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-[var(--color-compassionate-encouragement)]" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer transition-colors",
            theme === "dark" && "bg-[var(--color-compassionate-encouragement-subtle)]"
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-[var(--color-compassionate-encouragement)]" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer transition-colors",
            theme === "system" && "bg-[var(--color-compassionate-encouragement-subtle)]"
          )}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Auto</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-[var(--color-compassionate-encouragement)]" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Simplified theme toggle for headers/navigation
 */
export function SimpleThemeToggle({ className }: { className?: string }) {
  return (
    <ThemeToggle 
      variant="icon" 
      size="md" 
      className={className}
    />
  )
}

/**
 * Compact theme toggle with label for settings pages
 */
export function SettingsThemeToggle({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Theme</h4>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Choose your preferred color scheme
        </p>
      </div>
      <ThemeToggle variant="dropdown" showLabel />
    </div>
  )
}

/**
 * Theme selector with visual previews (for onboarding/settings)
 */
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      preview: "bg-[var(--color-background-secondary)] border-[var(--color-border-primary)]"
    },
    {
      value: "dark", 
      label: "Dark",
      icon: Moon,
      preview: "bg-[var(--color-background-inverse)] border-[var(--color-border-secondary)]"
    },
    {
      value: "system",
      label: "Auto",
      icon: Monitor,
      preview: "bg-gradient-to-br from-[var(--color-background-secondary)] to-[var(--color-background-inverse)] border-[var(--color-border-primary)]"
    }
  ] as const

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
        Choose your theme
      </h4>
      
      <div className="grid grid-cols-3 gap-3">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = theme === themeOption.value
          
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "group relative rounded-lg border-2 p-4 transition-all",
                "hover:border-[var(--color-compassionate-gentle)]",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[var(--color-compassionate-gentle)]",
                isSelected 
                  ? "border-[var(--color-compassionate-encouragement)] bg-[var(--color-compassionate-encouragement-subtle)]" 
                  : "border-[var(--color-border-secondary)] bg-[var(--color-background-secondary)]"
              )}
              aria-label={`Select ${themeOption.label} theme`}
            >
              <div className={cn(
                "mx-auto mb-2 h-8 w-12 rounded border",
                themeOption.preview
              )} />
              
              <div className="flex items-center justify-center gap-2">
                <Icon className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {themeOption.label}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--color-compassionate-encouragement)]" />
              )}
            </button>
          )
        })}
      </div>
      
      <p className="text-xs text-[var(--color-text-tertiary)]">
        Auto mode follows your system preference
      </p>
    </div>
  )
}