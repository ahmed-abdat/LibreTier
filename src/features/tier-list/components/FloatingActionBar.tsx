"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, Redo2 } from "lucide-react";
import { ExportButton } from "./ExportButton";
import { ShareDialog } from "./ShareDialog";
import { EditorMenu } from "./EditorMenu";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useSettingsStore } from "../store/settings-store";
import { useTierStore, useTemporalStore } from "../store";
import type { TierList } from "../index";

const SettingsDialog = dynamic(
  () =>
    import("./SettingsDialog").then((mod) => ({ default: mod.SettingsDialog })),
  { ssr: false }
);

interface FloatingActionBarProps {
  exportTargetRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  hasItems: boolean;
  tierList: TierList | null;
}

export function FloatingActionBar({
  exportTargetRef,
  filename,
  hasItems,
  tierList,
}: FloatingActionBarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const reduceAnimations = useSettingsStore(
    (state) => state.settings.reduceAnimations
  );
  const enableUndoRedo = useSettingsStore(
    (state) => state.settings.enableUndoRedo
  );

  // Undo/Redo state
  const canUndo = useTemporalStore((state) => state.pastStates.length > 0);
  const canRedo = useTemporalStore((state) => state.futureStates.length > 0);

  const barContent = (
    <div
      data-hide-export
      className="bg-background/95 supports-backdrop-filter:bg-background/80 fixed right-0 bottom-0 left-0 z-30 border-t backdrop-blur-sm md:hidden"
    >
      <div className="container mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 py-3">
        {/* Undo/Redo buttons - only show when enabled */}
        {enableUndoRedo && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              disabled={!canUndo}
              onClick={() => useTierStore.temporal.getState().undo()}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              disabled={!canRedo}
              onClick={() => useTierStore.temporal.getState().redo()}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Save Image Button - Mobile optimized */}
        <ExportButton
          targetRef={exportTargetRef}
          filename={filename}
          hasItems={hasItems}
          isMobile
        />

        {/* Share Link Button - Mobile optimized */}
        <ShareDialog tierList={tierList} isMobile />

        {/* Menu Button - Opens drawer on mobile */}
        <EditorMenu
          tierList={tierList}
          isMobile
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Settings dialog (controlled by EditorMenu) */}
        <SettingsDialog
          isMobile
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          showTrigger={false}
        />
      </div>

      {/* Safe area spacing for iOS notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );

  // Respect reduceAnimations setting
  if (reduceAnimations) {
    return barContent;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {barContent}
      </motion.div>
    </AnimatePresence>
  );
}
