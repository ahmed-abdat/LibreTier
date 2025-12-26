"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "../store/settings-store";
import { toast } from "sonner";

export function SettingsDialog({ isMobile = false }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const { settings, updateSettings, resetToDefaults } = useSettingsStore();

  // Ensure settings are always defined to avoid controlled/uncontrolled warnings
  const {
    enableKeyboardNavigation = false,
    enableUndoRedo = false,
    reduceAnimations = true,
  } = settings || {};

  // Keyboard shortcut listener (Ctrl+, or Cmd+,)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" && navigator.platform.includes("Mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === ",") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleReset = () => {
    resetToDefaults();
    toast.success("Settings reset to defaults");
  };

  const handleKeyboardNavToggle = (checked: boolean) => {
    updateSettings({ enableKeyboardNavigation: checked });
    toast.success(
      checked ? "Keyboard navigation enabled" : "Keyboard navigation disabled"
    );
  };

  const handleUndoRedoToggle = (checked: boolean) => {
    updateSettings({ enableUndoRedo: checked });
    toast.success(checked ? "Undo/Redo enabled" : "Undo/Redo disabled");
  };

  const handleAnimationsToggle = (checked: boolean) => {
    updateSettings({ reduceAnimations: checked });
    toast.success(
      checked ? "Animations reduced" : "Animations enabled"
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={isMobile ? "h-11 w-11" : "h-10 w-10 sm:h-9 sm:w-9"}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings (Ctrl+,)</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            Quick toggles for your tier list editor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboard-nav" className="text-base">
                Keyboard Navigation
              </Label>
              <p className="text-sm text-muted-foreground">
                Use arrow keys and Space to move items
              </p>
            </div>
            <Switch
              id="keyboard-nav"
              checked={enableKeyboardNavigation}
              onCheckedChange={handleKeyboardNavToggle}
            />
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="undo-redo" className="text-base">
                Undo/Redo
              </Label>
              <p className="text-sm text-muted-foreground">
                Track changes (Ctrl+Z to undo)
              </p>
            </div>
            <Switch
              id="undo-redo"
              checked={enableUndoRedo}
              onCheckedChange={handleUndoRedoToggle}
            />
          </div>

          {/* Reduce Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion" className="text-base">
                Reduce Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Disable animations for better performance
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={reduceAnimations}
              onCheckedChange={handleAnimationsToggle}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restore all settings to their default values. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="default" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
