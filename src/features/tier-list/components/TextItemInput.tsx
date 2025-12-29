"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTierStore } from "../store";
import { useSettingsStore } from "../store/settings-store";
import { toast } from "sonner";

interface TextItemInputProps {
  className?: string;
}

export function TextItemInput({ className }: TextItemInputProps) {
  const [value, setValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addItem = useTierStore((state) => state.addItem);
  const getCurrentList = useTierStore((state) => state.getCurrentList);
  const reduceAnimations = useSettingsStore(
    (state) => state.settings.reduceAnimations
  );

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

  const animationProps = reduceAnimations
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: -8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -8 },
        transition: { duration: 0.2, ease: "easeOut" as const },
      };

  return (
    <div className={`flex min-h-10 w-full items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div key="button" {...animationProps}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Text Item
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex w-full items-center justify-center gap-2"
            onAnimationComplete={() => inputRef.current?.focus()}
            {...animationProps}
          >
            <div className="relative flex w-full items-center sm:max-w-md">
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Item name..."
                maxLength={50}
                className="h-10 pr-20"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!value.trim()}
                className="absolute right-1 h-8"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-10 w-10 shrink-0"
              onClick={() => {
                setValue("");
                setIsExpanded(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
