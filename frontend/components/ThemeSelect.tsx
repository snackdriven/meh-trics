import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme, themes } from "@/hooks/useTheme";

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  return (
    <Select value={theme} onValueChange={t => setTheme(t as any)}>
      <SelectTrigger size="sm" className="w-28">
        <SelectValue placeholder="Theme" className="capitalize" />
      </SelectTrigger>
      <SelectContent>
        {themes.map(t => (
          <SelectItem key={t} value={t} className="capitalize">
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
