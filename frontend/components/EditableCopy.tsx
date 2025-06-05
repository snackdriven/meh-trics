import { useState } from "react";
import { useCopyEdit } from "../contexts/CopyEditContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditableCopyProps {
  storageKey: string;
  defaultText: string;
  as?: React.ElementType;
  className?: string;
}

export function EditableCopy({
  storageKey,
  defaultText,
  as: Component = "p",
  className,
}: EditableCopyProps) {
  const [text, setText] = useState<string>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored || defaultText;
  });
  const { editAll } = useCopyEdit();
  const [editing, setEditing] = useState(false);
  const isEditing = editAll || editing;

  const save = () => {
    localStorage.setItem(storageKey, text);
    setEditing(false);
  };

  return isEditing ? (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className={className}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between">
      <Component className={className} dangerouslySetInnerHTML={{ __html: text }} />
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        Edit Copy
      </Button>
    </div>
  );
}
