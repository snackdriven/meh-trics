import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCopyEditing } from "@/hooks/useCopyEditing";
import { useState } from "react";

interface CustomizableCreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CustomizableCreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
}: CustomizableCreateTaskDialogProps) {
  const { getText, tags } = useCopyEditing();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit({ title, description });
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getText("createTask", "dialogTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{getText("createTask", "titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getText("createTask", "titlePlaceholder")}
            />
          </div>

          <div>
            <Label>{getText("createTask", "descriptionLabel")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getText("createTask", "descriptionPlaceholder")}
            />
          </div>

          <div>
            <Label>{getText("createTask", "tagLabel")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.slice(0, 6).map((tag) => (
                <Button key={tag} variant="outline" size="sm">
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {getText("createTask", "cancel")}
          </Button>
          <Button onClick={handleSubmit}>{getText("createTask", "submit")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Example usage comment:
// This component demonstrates how any form dialog can be made customizable
// by using the getText() function and custom tags from useCopyEditing()
//
// To integrate into existing components:
// 1. Import useCopyEditing hook
// 2. Replace hardcoded strings with getText('section', 'key') calls
// 3. Use tags array instead of hardcoded commonTags
// 4. Use moodOptions for mood-related components
