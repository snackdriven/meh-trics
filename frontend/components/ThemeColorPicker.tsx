import { useAccentColor } from "../hooks/useAccentColor";

const options = [
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Rose", value: "#e11d48" },
  { name: "Emerald", value: "#10b981" },
];

export function ThemeColorPicker() {
  const { color, setColor } = useAccentColor();

  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={color}
      onChange={(e) => setColor(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
