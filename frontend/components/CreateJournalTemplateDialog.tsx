import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import backend from "~backend/client";
import type { JournalTemplate } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";

interface CreateJournalTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated?: (tmpl: JournalTemplate) => void;
}

export function CreateJournalTemplateDialog({
  open,
  onOpenChange,
  onTemplateCreated,
}: CreateJournalTemplateDialogProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const { showSuccess, showError } = useToast();

  const { loading: submitting, execute: createTemplate } = useAsyncOperation(
    async () => {
      if (!title.trim()) {
        throw new Error("Title is required");
      }
      const tmpl = await backend.task.createJournalTemplate({
        title: title.trim(),
        text: text.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onTemplateCreated?.(tmpl);
      setTitle("");
      setText("");
      setTags("");
      return tmpl;
    },
    () => {
      showSuccess("Journal template created!");
      onOpenChange(false);
    },
    (err) => showError(err, "Failed to Create Template"),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="create-journal-template-desc" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Journal Template</DialogTitle>
        </DialogHeader>
        <DialogDescription id="create-journal-template-desc" className="sr-only">
          Fill out the form to create a journal template.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tmplTitle">Title</Label>
            <Input
              id="tmplTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tmplText">Text</Label>
            <Textarea
              id="tmplText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="tmplTags">Tags (comma separated)</Label>
            <Input
              id="tmplTags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
