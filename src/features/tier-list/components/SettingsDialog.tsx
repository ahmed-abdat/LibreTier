"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "../store/settings-store";
import { toast } from "sonner";

type ApiKeyStatus = "idle" | "validating" | "valid" | "invalid";

interface ValidationResponse {
  valid: boolean;
  error?: string;
  message?: string;
}

async function validateApiKey(apiKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch("/api/upload/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    return (await response.json()) as ValidationResponse;
  } catch {
    return { valid: false, error: "Network error" };
  }
}

function SettingsContent({ onClose }: { onClose?: () => void }) {
  const { settings, updateSettings, resetToDefaults } = useSettingsStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(settings.imgbbApiKey ?? "");
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>(
    settings.imgbbApiKey ? "valid" : "idle"
  );
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const {
    enableKeyboardNavigation = false,
    enableUndoRedo = false,
    reduceAnimations = true,
  } = settings ?? {};

  const handleReset = () => {
    resetToDefaults();
    setApiKeyInput("");
    setApiKeyStatus("idle");
    setApiKeyError(null);
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
    toast.success(checked ? "Animations reduced" : "Animations enabled");
  };

  const handleApiKeyChange = useCallback((value: string) => {
    setApiKeyInput(value);
    setApiKeyStatus("idle");
    setApiKeyError(null);
  }, []);

  const handleValidateApiKey = useCallback(() => {
    if (!apiKeyInput.trim()) {
      setApiKeyError("Please enter an API key");
      return;
    }

    setApiKeyStatus("validating");
    setApiKeyError(null);

    void validateApiKey(apiKeyInput.trim()).then((result) => {
      if (result.valid) {
        setApiKeyStatus("valid");
        setApiKeyError(null);
        updateSettings({ imgbbApiKey: apiKeyInput.trim() });
        toast.success("API key is valid and saved!");
      } else {
        setApiKeyStatus("invalid");
        setApiKeyError(result.error ?? "Invalid API key");
        toast.error(result.error ?? "Invalid API key");
      }
    });
  }, [apiKeyInput, updateSettings]);

  const handleClearApiKey = useCallback(() => {
    setApiKeyInput("");
    setApiKeyStatus("idle");
    setApiKeyError(null);
    updateSettings({ imgbbApiKey: "" });
    toast.success("API key removed, using default");
  }, [updateSettings]);

  return (
    <>
      <div className="space-y-6 px-1 py-4">
        {/* Keyboard Navigation */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="keyboard-nav" className="text-base">
              Keyboard Navigation
            </Label>
            <p className="text-muted-foreground text-sm">
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
            <p className="text-muted-foreground text-sm">
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
            <p className="text-muted-foreground text-sm">
              Disable animations for better performance
            </p>
          </div>
          <Switch
            id="reduce-motion"
            checked={reduceAnimations}
            onCheckedChange={handleAnimationsToggle}
          />
        </div>

        {/* Separator */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-medium">Image Hosting (Optional)</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="imgbb-api-key" className="text-sm">
                ImgBB API Key
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="imgbb-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Leave empty to use default"
                    className={`pr-10 font-mono text-xs ${
                      apiKeyStatus === "valid"
                        ? "border-green-500 focus-visible:ring-green-500"
                        : apiKeyStatus === "invalid"
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleValidateApiKey}
                  disabled={
                    !apiKeyInput.trim() || apiKeyStatus === "validating"
                  }
                  className="shrink-0"
                >
                  {apiKeyStatus === "validating" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : apiKeyStatus === "valid" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : apiKeyStatus === "invalid" ? (
                    <X className="h-4 w-4 text-red-500" />
                  ) : (
                    "Test"
                  )}
                </Button>
              </div>

              {/* Status message */}
              {apiKeyStatus === "valid" && (
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    API key is valid
                  </p>
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-muted-foreground hover:text-destructive text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
              {apiKeyStatus === "invalid" && apiKeyError && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <X className="h-3 w-3" />
                  {apiKeyError}
                </p>
              )}
              {apiKeyStatus === "idle" && !apiKeyInput && (
                <p className="text-muted-foreground text-xs">
                  Using default API key for sharing.{" "}
                  <a
                    href="https://api.imgbb.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-0.5 hover:underline"
                  >
                    Get your own free key
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
              {apiKeyStatus === "idle" && apiKeyInput && (
                <p className="text-muted-foreground text-xs">
                  Click &quot;Test&quot; to validate and save your API key
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-between">
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
              <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="default" onClick={onClose}>
          Close
        </Button>
      </div>
    </>
  );
}

export function SettingsDialog({ isMobile = false }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);

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

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className={isMobile ? "h-11 w-11" : "h-10 w-10 sm:h-9 sm:w-9"}
      aria-label="Settings"
    >
      <Settings className="h-4 w-4" />
    </Button>
  );

  // Use Drawer on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editor Settings</DrawerTitle>
            <DrawerDescription>
              Quick toggles for your tier list editor
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <SettingsContent onClose={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>{triggerButton}</DialogTrigger>
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
        <SettingsContent onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
