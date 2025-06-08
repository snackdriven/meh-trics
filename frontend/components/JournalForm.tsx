import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface JournalFormProps {
  initialText?: string;
  initialTags?: string[];
  initialDate?: string;
  submitting: boolean;
  onSubmit: (data: { text: string; tags: string[]; date?: string }) => void;
}

export function JournalForm({
  initialText = "",
  initialTags = [],
  initialDate,
  submitting,
  onSubmit,
}: JournalFormProps) {
  const [text, setText] = useState(initialText);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [entryDate, setEntryDate] = useState(
    initialDate ?? new Date().toISOString().split("T")[0],
  );

  useEffect(() => setText(initialText), [initialText]);
  useEffect(() => setTags(initialTags.join(", ")), [initialTags]);
  useEffect(() => {
    if (initialDate) setEntryDate(initialDate);
  }, [initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      text,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      date: entryDate,
    });
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-2xl">Capture Moment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="momentText" className="flex flex-col gap-1">
              <span className="text-base font-medium">Journal Entry</span>
            </Label>
            <Textarea
              id="momentText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="bg-white/50 border-purple-200 focus:border-purple-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="momentDate" className="flex flex-col gap-1">
              <span className="text-base font-medium">Date (optional)</span>
            </Label>
            <Input
              id="momentDate"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="momentTags" className="flex flex-col gap-1">
              <span className="text-base font-medium">
                Tags (comma separated)
              </span>
            </Label>
            <Input
              id="momentTags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            size="lg"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Saving...
              </>
            ) : (
              "Capture Moment"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
