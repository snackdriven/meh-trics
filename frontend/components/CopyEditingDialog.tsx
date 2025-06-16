import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  defaultMoodOptions,
  defaultTierInfo,
  type MoodOptions,
  type TierInfo,
  type MoodOption,
} from "@/constants/moods";
import { commonTags } from "@/constants/tags";
import { uiText, type UiText } from "@/constants/uiText";

interface CopyEditingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CopyEditingData) => void;
}

export interface CopyEditingData {
  moodOptions: MoodOptions;
  tierInfo: TierInfo;
  tags: string[];
  uiText: UiText;
}

export function CopyEditingDialog({ open, onOpenChange, onSave }: CopyEditingDialogProps) {
  const [moodOptions, setMoodOptions] = useState<MoodOptions>(defaultMoodOptions);
  const [tierInfo, setTierInfo] = useState<TierInfo>(defaultTierInfo);
  const [tags, setTags] = useState<string[]>(commonTags);
  const [customTag, setCustomTag] = useState("");
  const [editableUiText, setEditableUiText] = useState<UiText>(uiText);

  // Load saved data from localStorage
  useEffect(() => {
    if (open) {
      const savedData = localStorage.getItem("copy-editing-data");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setMoodOptions(parsed.moodOptions || defaultMoodOptions);
          setTierInfo(parsed.tierInfo || defaultTierInfo);
          setTags(parsed.tags || commonTags);
          setEditableUiText(parsed.uiText || uiText);
        } catch (e) {
          console.error("Failed to load copy editing data:", e);
        }
      }
    }
  }, [open]);

  const handleSave = () => {
    const data: CopyEditingData = {
      moodOptions,
      tierInfo,
      tags,
      uiText: editableUiText,
    };

    // Save to localStorage
    localStorage.setItem("copy-editing-data", JSON.stringify(data));

    onSave(data);
    onOpenChange(false);
  };

  const updateMoodOption = (
    tier: keyof MoodOptions,
    index: number,
    updates: Partial<MoodOption>
  ) => {
    setMoodOptions((prev) => ({
      ...prev,
      [tier]: prev[tier].map((mood, i) => (i === index ? { ...mood, ...updates } : mood)),
    }));
  };

  const addMoodOption = (tier: keyof MoodOptions) => {
    setMoodOptions((prev) => ({
      ...prev,
      [tier]: [...prev[tier], { emoji: "😐", label: "New Mood", hidden: false }],
    }));
  };

  const removeMoodOption = (tier: keyof MoodOptions, index: number) => {
    setMoodOptions((prev) => ({
      ...prev,
      [tier]: prev[tier].filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags((prev) => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const updateUiText = (section: keyof UiText, key: string, value: string) => {
    setEditableUiText((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const resetToDefaults = () => {
    setMoodOptions(defaultMoodOptions);
    setTierInfo(defaultTierInfo);
    setTags(commonTags);
    setEditableUiText(uiText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit App Content & Copy</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="moods" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="moods">Moods</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="ui-text">UI Text</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="moods" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Mood Categories</h3>
                {Object.entries(tierInfo).map(([tier, info]) => (
                  <div key={tier} className="space-y-2 mb-4">
                    <Label>{tier.charAt(0).toUpperCase() + tier.slice(1)} Title</Label>
                    <Input
                      value={info.title}
                      onChange={(e) =>
                        setTierInfo((prev) => ({
                          ...prev,
                          [tier]: { ...prev[tier as keyof TierInfo], title: e.target.value },
                        }))
                      }
                    />
                    <Label>Subtitle</Label>
                    <Input
                      value={info.subtitle}
                      onChange={(e) =>
                        setTierInfo((prev) => ({
                          ...prev,
                          [tier]: { ...prev[tier as keyof TierInfo], subtitle: e.target.value },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {Object.entries(moodOptions).map(([tier, moods]) => (
                <div key={tier} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} Moods
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addMoodOption(tier as keyof MoodOptions)}
                    >
                      Add Mood
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {moods.map((mood, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded">
                        <Input
                          value={mood.emoji}
                          onChange={(e) =>
                            updateMoodOption(tier as keyof MoodOptions, index, {
                              emoji: e.target.value,
                            })
                          }
                          className="w-16 text-center"
                          placeholder="😊"
                        />
                        <Input
                          value={mood.label}
                          onChange={(e) =>
                            updateMoodOption(tier as keyof MoodOptions, index, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Mood label"
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!mood.hidden}
                            onCheckedChange={(checked) =>
                              updateMoodOption(tier as keyof MoodOptions, index, {
                                hidden: !checked,
                              })
                            }
                          />
                          <Label className="text-sm">Visible</Label>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMoodOption(tier as keyof MoodOptions, index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Available Tags</h3>

              <div className="flex gap-2 mb-4">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add new tag..."
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag}>Add Tag</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ui-text" className="space-y-4">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">UI Text & Labels</h3>

              {Object.entries(editableUiText).map(([section, texts]) => (
                <div key={section} className="space-y-3">
                  <h4 className="text-md font-medium capitalize">
                    {section.replace(/([A-Z])/g, " $1")}
                  </h4>

                  <div className="grid gap-3 ml-4">
                    {Object.entries(texts).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-1 gap-2">
                        <Label className="text-sm text-gray-600">{key}</Label>
                        {value.length > 50 ? (
                          <Textarea
                            value={value}
                            onChange={(e) =>
                              updateUiText(section as keyof UiText, key, e.target.value)
                            }
                            rows={2}
                          />
                        ) : (
                          <Input
                            value={value}
                            onChange={(e) =>
                              updateUiText(section as keyof UiText, key, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Energy Levels & Categories</h3>

              <div className="space-y-4">
                <div>
                  <Label>Energy Level Options</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Customize the energy level options available for tasks
                  </p>
                  <div className="grid gap-2">
                    <Input defaultValue="Low" placeholder="Energy level option" />
                    <Input defaultValue="Medium" placeholder="Energy level option" />
                    <Input defaultValue="High" placeholder="Energy level option" />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Priority Levels</Label>
                  <p className="text-sm text-gray-600 mb-2">Customize priority level labels</p>
                  <div className="grid gap-2">
                    <Input defaultValue="Low Priority" placeholder="Priority level" />
                    <Input defaultValue="Medium Priority" placeholder="Priority level" />
                    <Input defaultValue="High Priority" placeholder="Priority level" />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Frequency Options</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Customize frequency options for habits and recurring tasks
                  </p>
                  <div className="grid gap-2">
                    <Input defaultValue="Daily" placeholder="Frequency option" />
                    <Input defaultValue="Weekly" placeholder="Frequency option" />
                    <Input defaultValue="Monthly" placeholder="Frequency option" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
