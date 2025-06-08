import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { commonTags } from "@/constants/tags";
import { uiText } from "@/constants/uiText";
import { X } from "lucide-react";
import type { TagList } from "../hooks/useTagList";

interface TagSelectorProps {
  tagList: TagList;
  label?: string;
  allowCustom?: boolean;
  suggestions?: string[];
}

export function TagSelector({
  tagList,
  label = "Tags",
  allowCustom = true,
  suggestions,
}: TagSelectorProps) {
  const { tags, customTag, setCustomTag, toggleTag, addCustomTag, removeTag } =
    tagList;

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(suggestions ?? commonTags).map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <Button
                key={tag}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(tag)}
                className={
                  isSelected ? "bg-purple-600 hover:bg-purple-700" : ""
                }
              >
                {tag}
              </Button>
            );
          })}
        </div>

        {allowCustom && (
          <div className="flex gap-2">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder={uiText.tagSelector.customTagPlaceholder}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomTag}>
              {uiText.tagSelector.addButton}
            </Button>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
