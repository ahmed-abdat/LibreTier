"use client";

import { useState, useCallback, useRef } from "react";
import { Menu, Upload, Download, Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
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
} from "@/components/ui/alert-dialog";
import type { TierList } from "../index";
import { useTierStore } from "../store";
import { createTierListExport } from "../utils/json-export";
import { importTierListFromFile } from "../utils/json-import";
import { toast } from "sonner";

interface EditorMenuProps {
  tierList: TierList | null;
  isMobile?: boolean;
  onOpenSettings?: () => void;
}

export function EditorMenu({
  tierList,
  isMobile = false,
  onOpenSettings,
}: EditorMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearAllItems = useTierStore((state) => state.clearAllItems);
  const importList = useTierStore((state) => state.importList);
  const selectList = useTierStore((state) => state.selectList);

  const handleReset = useCallback(() => {
    if (!tierList) return;
    clearAllItems();
    toast.success("All items have been reset");
    setShowResetDialog(false);
    setIsOpen(false);
  }, [tierList, clearAllItems]);

  const handleExportJSON = useCallback(() => {
    if (!tierList) return;

    try {
      const exportData = createTierListExport(tierList);
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${tierList.title.toLowerCase().replace(/\s+/g, "-")}-backup.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Tier list exported");
    } catch {
      toast.error("Failed to export");
    }
    setIsOpen(false);
  }, [tierList]);

  const handleImportJSON = useCallback(() => {
    fileInputRef.current?.click();
    setIsOpen(false);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const tierListData = await importTierListFromFile(file);

        // Import the list and select it
        const newListId = importList(tierListData);
        selectList(newListId);
        toast.success(`Imported "${tierListData.title}"`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to read file"
        );
      }

      e.target.value = "";
    },
    [importList, selectList]
  );

  const handleOpenSettings = useCallback(() => {
    setIsOpen(false);
    onOpenSettings?.();
  }, [onOpenSettings]);

  const hasContent = tierList !== null;

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className={isMobile ? "h-11 w-11" : "h-10 w-10 sm:h-9 sm:w-9"}
      aria-label="Menu"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json,application/json"
      onChange={(e) => void handleFileChange(e)}
      className="hidden"
      aria-hidden="true"
    />
  );

  const resetDialog = (
    <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Tier List?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all items from all tiers. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Mobile drawer content
  const drawerContent = (
    <div className="flex flex-col gap-1 p-4">
      <Button
        variant="ghost"
        className="h-12 justify-start text-base"
        onClick={handleImportJSON}
      >
        <Upload className="mr-3 h-5 w-5" />
        Import JSON
      </Button>
      <Button
        variant="ghost"
        className="h-12 justify-start text-base"
        onClick={handleExportJSON}
        disabled={!hasContent}
      >
        <Download className="mr-3 h-5 w-5" />
        Export JSON
      </Button>

      <div className="my-2 border-t" />

      <Button
        variant="ghost"
        className="h-12 justify-start text-base"
        onClick={handleOpenSettings}
      >
        <Settings className="mr-3 h-5 w-5" />
        Settings
      </Button>

      <div className="my-2 border-t" />

      <Button
        variant="ghost"
        className="text-destructive hover:text-destructive h-12 justify-start text-base"
        onClick={() => setShowResetDialog(true)}
        disabled={!hasContent}
      >
        <RotateCcw className="mr-3 h-5 w-5" />
        Reset All Items
      </Button>

      <div className="mt-4 border-t pt-4">
        <DrawerClose asChild>
          <Button variant="outline" className="w-full">
            Close
          </Button>
        </DrawerClose>
      </div>
    </div>
  );

  // Desktop dropdown content
  const dropdownContent = (
    <>
      <DropdownMenuItem onClick={handleImportJSON}>
        <Upload className="mr-2 h-4 w-4" />
        Import JSON
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleExportJSON} disabled={!hasContent}>
        <Download className="mr-2 h-4 w-4" />
        Export JSON
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={handleOpenSettings}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => setShowResetDialog(true)}
        disabled={!hasContent}
        className="text-destructive focus:text-destructive"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset All Items
      </DropdownMenuItem>
    </>
  );

  if (isMobile) {
    return (
      <>
        {fileInput}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Menu</p>
            </TooltipContent>
          </Tooltip>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
            </DrawerHeader>
            {drawerContent}
          </DrawerContent>
        </Drawer>
        {resetDialog}
      </>
    );
  }

  return (
    <>
      {fileInput}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Menu</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          {dropdownContent}
        </DropdownMenuContent>
      </DropdownMenu>
      {resetDialog}
    </>
  );
}
