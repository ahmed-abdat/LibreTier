"use client";

import { useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTierStore } from "../store";
import { toast } from "sonner";

interface TextItemInputProps {
  className?: string;
}

export function TextItemInput({ className }: TextItemInputProps) {
  const [value, setValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const addItem = useTierStore((state) => state.addItem);
  const getCurrentList = useTierStore((state) => state.getCurrentList);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const currentList = getCurrentList();
      if (!currentList) {
        toast.error("Please create a tier list first");
        return;
      }

      const trimmed = value.trim();
      if (!trimmed) {
        toast.error("Please enter a name");
        return;
      }

      if (trimmed.length > 50) {
        toast.error("Name must be 50 characters or less");
        return;
      }

      addItem({ name: trimmed });
      setValue("");
      toast.success(`Added "${trimmed}"`);
    },
    [value, addItem, getCurrentList]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setValue("");
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={className}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Text Item
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Item name..."
        maxLength={50}
        autoFocus
        className="h-9"
      />
      <Button type="submit" size="sm" disabled={!value.trim()}>
        Add
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => {
          setValue("");
          setIsExpanded(false);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </form>
  );
}
