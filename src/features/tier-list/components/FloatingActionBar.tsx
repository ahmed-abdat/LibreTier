"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExportButton } from "./ExportButton";
import { ShareDialog } from "./ShareDialog";
import { EditorMenu } from "./EditorMenu";
import dynamic from "next/dynamic";
import { useSettingsStore } from "../store/settings-store";
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

  const barContent = (
    <div
      data-hide-export
      className="bg-background/95 supports-backdrop-filter:bg-background/80 fixed right-0 bottom-0 left-0 z-30 border-t backdrop-blur-sm md:hidden"
    >
      <div className="container mx-auto flex max-w-5xl items-center justify-center gap-3 px-4 py-3">
        {/* Save Image Button - Mobile optimized */}
        <ExportButton
          targetRef={exportTargetRef}
          filename={filename}
          hasItems={hasItems}
          isMobile
        />

        {/* Share Link Button - Mobile optimized */}
        <ShareDialog
          tierList={tierList}
          isMobile
          captureRef={exportTargetRef}
        />

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
