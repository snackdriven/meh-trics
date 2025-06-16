import type React from "react";

interface EditableCopyProps {
  defaultText: string;
  as?: React.ElementType;
  className?: string;
}

export function EditableCopy({ defaultText, as: Component = "p", className }: EditableCopyProps) {
  return <Component className={className}>{defaultText}</Component>;
}
