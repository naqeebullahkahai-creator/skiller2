import { useState, useRef, useEffect } from "react";
import { Check, X, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVisualEdit } from "@/contexts/VisualEditContext";

interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

const InlineEditableText = ({
  value,
  onSave,
  className,
  placeholder = "Click to edit...",
  multiline = false,
}: InlineEditableTextProps) => {
  const { isEditMode, canEdit } = useVisualEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // If not in edit mode or can't edit, show normal text
  if (!isEditMode || !canEdit) {
    return <span className={className}>{value || placeholder}</span>;
  }

  // Editing state
  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-2 animate-in fade-in duration-200">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-background border-2 border-primary rounded-md px-2 py-1 min-w-[200px] resize-none",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              className
            )}
            rows={3}
            disabled={isSaving}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-background border-2 border-primary rounded-md px-2 py-1 min-w-[150px]",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              className
            )}
            disabled={isSaving}
          />
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1.5 bg-destructive text-white rounded-full hover:bg-destructive/80 transition-colors disabled:opacity-50"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Edit mode but not editing - show clickable with edit indicator
  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer relative group inline-block",
        "hover:bg-primary/10 rounded px-1 -mx-1 transition-all duration-200",
        "ring-2 ring-dashed ring-primary/30 hover:ring-primary/60",
        className
      )}
    >
      {value || placeholder}
      <Edit3
        size={12}
        className="absolute -top-2 -right-2 text-primary bg-background rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </span>
  );
};

export default InlineEditableText;
