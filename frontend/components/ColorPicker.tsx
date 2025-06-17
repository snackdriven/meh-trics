/**
 * Color Picker Component
 *
 * Interactive color picker for theme customization.
 * Supports hex, RGB, and HSL color formats.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Check, Copy, Palette } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Common color presets for quick selection
const colorPresets = [
  // Primary brand colors
  { name: "Purple", value: "#9333ea" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },

  // Neutral colors
  { name: "Gray 900", value: "#111827" },
  { name: "Gray 800", value: "#1f2937" },
  { name: "Gray 700", value: "#374151" },
  { name: "Gray 600", value: "#4b5563" },
  { name: "Gray 500", value: "#6b7280" },
  { name: "Gray 400", value: "#9ca3af" },
  { name: "Gray 300", value: "#d1d5db" },
  { name: "Gray 200", value: "#e5e7eb" },
  { name: "Gray 100", value: "#f3f4f6" },
  { name: "Gray 50", value: "#f9fafb" },

  // Light backgrounds
  { name: "White", value: "#ffffff" },
  { name: "Slate 50", value: "#f8fafc" },
  { name: "Zinc 50", value: "#fafafa" },

  // Dark backgrounds
  { name: "Slate 900", value: "#0f172a" },
  { name: "Slate 800", value: "#1e293b" },
  { name: "Black", value: "#000000" },
];

export function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValidColor, setIsValidColor] = useState(true);
  const { showSuccess } = useToast();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Validate and normalize color input
  const validateColor = useCallback((color: string): boolean => {
    // Test if it's a valid hex color
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexPattern.test(color)) return true;

    // Test if it's a valid rgb/rgba color
    const rgbPattern =
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0|1|0?\.\d+))?\s*\)$/;
    if (rgbPattern.test(color)) return true;

    // Test if it's a valid hsl/hsla color
    const hslPattern =
      /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(0|1|0?\.\d+))?\s*\)$/;
    if (hslPattern.test(color)) return true;

    return false;
  }, []);

  // Convert color to hex format for consistency
  const normalizeColor = useCallback((color: string): string => {
    // If already hex, return as-is
    if (color.startsWith("#")) return color;

    // Create a temporary element to use browser's color parsing
    const div = document.createElement("div");
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    // Parse RGB values and convert to hex
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${Number(r).toString(16).padStart(2, "0")}${Number(g).toString(16).padStart(2, "0")}${Number(b).toString(16).padStart(2, "0")}`;
    }

    return color;
  }, []);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    const isValid = validateColor(newValue);
    setIsValidColor(isValid);

    if (isValid) {
      const normalizedColor = normalizeColor(newValue);
      onChange(normalizedColor);
    }
  };

  const handlePresetClick = (presetValue: string) => {
    setInputValue(presetValue);
    setIsValidColor(true);
    onChange(presetValue);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showSuccess("Color copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy color:", error);
    }
  };

  // Convert hex to RGB for display
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null;
  };

  const rgb = hexToRgb(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-12 h-12 p-1 border-2" disabled={disabled}>
          <div
            className="w-full h-full rounded border"
            style={{ backgroundColor: value }}
            title={value}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="font-medium">Color Picker</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-input">Color Value</Label>
            <div className="flex gap-2">
              <Input
                id="color-input"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="#000000"
                className={!isValidColor ? "border-red-500" : ""}
              />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {!isValidColor && (
              <p className="text-sm text-red-600">Please enter a valid color (hex, rgb, or hsl)</p>
            )}
          </div>

          {/* Color preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-3 p-3 rounded border">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: value }} />
              <div className="text-sm space-y-1">
                <div className="font-mono">{value}</div>
                {rgb && (
                  <div className="text-[var(--color-text-secondary)]">
                    RGB({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Color presets */}
          <div className="space-y-2">
            <Label>Quick Colors</Label>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  className="w-8 h-8 p-0 relative group"
                  onClick={() => handlePresetClick(preset.value)}
                  title={`${preset.name} (${preset.value})`}
                >
                  <div
                    className="w-full h-full rounded-sm"
                    style={{ backgroundColor: preset.value }}
                  />
                  {value === preset.value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-sm">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* HTML5 color picker */}
          <div className="space-y-2">
            <Label htmlFor="native-picker">Visual Picker</Label>
            <input
              id="native-picker"
              type="color"
              value={value}
              onChange={(e) => handlePresetClick(e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
