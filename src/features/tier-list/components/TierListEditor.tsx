"use client";

import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { NoopKeyboardSensor } from "../utils/NoopKeyboardSensor";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Pencil, Undo2, Redo2, ArrowDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTierStore, useTemporalStore, useCurrentList } from "../store";
import { useSettingsStore } from "../store/settings-store";
import { TIER_DEFAULTS, MAX_TITLE_LENGTH } from "../constants";
import { TierRow } from "./TierRow";
import { TierItem } from "./TierItem";
import { ItemPool } from "./ItemPool";
import { ImageUpload } from "./ImageUpload";
import { TextItemInput } from "./TextItemInput";
import { ExportButton } from "./ExportButton";
import { ShareDialog } from "./ShareDialog";
import { EditorMenu } from "./EditorMenu";
import { FloatingActionBar } from "./FloatingActionBar";

// Code split SettingsDialog - only load when user opens settings
const SettingsDialog = dynamic(
  () =>
    import("./SettingsDialog").then((mod) => ({ default: mod.SettingsDialog })),
  { ssr: false }
);
import { useTierListDnd } from "../hooks/useTierListDnd";
import { createTierListKeyboardCoordinates } from "../utils/tierListKeyboardCoordinates";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
// import { cn } from "@/lib/utils"; // Unused for now

export function TierListEditor() {
  const exportRef = useRef<HTMLDivElement>(null);

  // Use proper reactive selector for current list
  const currentList = useCurrentList();

  // Settings dialog state (for EditorMenu to open it)
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Action selectors (stable references, won't cause re-renders)
  const updateList = useTierStore((state) => state.updateList);
  const moveItem = useTierStore((state) => state.moveItem);
  const reorderTiers = useTierStore((state) => state.reorderTiers);
  const reorderItemsInContainer = useTierStore(
    (state) => state.reorderItemsInContainer
  );
  const addCustomTier = useTierStore((state) => state.addCustomTier);

  const settings = useSettingsStore((state) => state.settings);

  const {
    activeItem,
    activeRow,
    activeDragType,
    // overId, // Unused for now
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    collisionDetection,
  } = useTierListDnd({
    currentList,
    moveItem,
    reorderTiers,
    reorderItemsInContainer,
  });

  // Custom keyboard coordinate getter for mixed layout navigation
  const keyboardCoordinates = useMemo(
    () =>
      createTierListKeyboardCoordinates(() => {
        if (!currentList) return null;
        return {
          rows: currentList.rows.map((row) => ({
            id: row.id,
            items: row.items.map((item) => ({ id: item.id })),
          })),
          unassignedItems: currentList.unassignedItems.map((item) => ({
            id: item.id,
          })),
        };
      }),
    [currentList]
  );

  // Always create all 3 sensors - avoid array size changes for performance
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(
      settings.enableKeyboardNavigation ? KeyboardSensor : NoopKeyboardSensor,
      settings.enableKeyboardNavigation
        ? { coordinateGetter: keyboardCoordinates }
        : {}
    )
  );

  // Track if currently dragging (for disabling undo during drag)
  const isDraggingRef = useRef(false);

  // Update ref in useEffect to avoid render-phase updates
  useEffect(() => {
    isDraggingRef.current = activeDragType !== null;
  }, [activeDragType]);

  // Undo/Redo state (reactive)
  const canUndo = useTemporalStore((state) => state.pastStates.length > 0);
  const canRedo = useTemporalStore((state) => state.futureStates.length > 0);

  // Add tier handler - memoized for performance
  const handleAddTier = useCallback(() => {
    if (!currentList) return;
    const existingNames = new Set(currentList.rows.map((r) => r.name));
    const nextIndex = currentList.rows.length % TIER_DEFAULTS.length;
    const baseName = TIER_DEFAULTS[nextIndex].name;
    let newName: string = baseName;
    let counter = 1;
    while (existingNames.has(newName)) {
      newName = `${baseName}${counter}`;
      counter++;
    }
    addCustomTier(newName, TIER_DEFAULTS[nextIndex].color);
    toast.success(`Added tier "${newName}"`);
  }, [currentList, addCustomTier]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!settings.enableUndoRedo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore during drag operations
      if (isDraggingRef.current) return;

      // Ignore if user is typing in an input/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac =
        typeof navigator !== "undefined" && navigator.platform.includes("Mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useTierStore.temporal.getState().undo();
      }
      if (modifier && e.key === "y") {
        e.preventDefault();
        useTierStore.temporal.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings.enableUndoRedo]);

  // Clear undo history when entering/leaving editor (prevents cross-list confusion)
  useEffect(() => {
    // Clear on mount (fresh start for this list)
    useTierStore.temporal.getState().clear();

    // Clear on unmount (free memory)
    return () => {
      useTierStore.temporal.getState().clear();
    };
  }, []);

  // Memoized values - must be before early return
  const rowIds = useMemo(
    () => currentList?.rows.map((row) => `row-${row.id}`) ?? [],
    [currentList?.rows]
  );

  const totalItems = useMemo(
    () =>
      currentList
        ? currentList.rows.reduce((acc, row) => acc + row.items.length, 0) +
          currentList.unassignedItems.length
        : 0,
    [currentList]
  );

  // ContentEditable callbacks - extracted for stable references
  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      const newTitle =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- textContent can be null
        (e.currentTarget.textContent ?? "").trim().slice(0, MAX_TITLE_LENGTH) ||
        "Untitled Tier List";
      if (currentList && newTitle !== currentList.title) {
        updateList({ title: newTitle });
      }
    },
    [currentList, updateList]
  );

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
        return;
      }
      // Prevent typing if at max length (allow delete/backspace/arrows)
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- textContent can be null
      const currentLength = (e.currentTarget.textContent ?? "").length;
      if (
        currentLength >= MAX_TITLE_LENGTH &&
        !allowedKeys.includes(e.key) &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        toast.error(`Title limited to ${MAX_TITLE_LENGTH} characters`);
      }
    },
    [] // All values accessed from event
  );

  const handleTitlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      const currentText = e.currentTarget.textContent || "";
      const selection = window.getSelection();
      // Calculate how many chars we can add
      const selectedLength = selection?.toString().length ?? 0;
      const availableSpace =
        MAX_TITLE_LENGTH - currentText.length + selectedLength;
      const truncatedText = text.slice(0, availableSpace);

      if (truncatedText && selection?.rangeCount) {
        selection.deleteFromDocument();
        selection
          .getRangeAt(0)
          .insertNode(document.createTextNode(truncatedText));
        selection.collapseToEnd();
      }
      if (text.length > truncatedText.length) {
        toast.error(`Title limited to ${MAX_TITLE_LENGTH} characters`);
      }
    },
    []
  );

  // Select all text on focus for easier editing
  const handleTitleFocus = useCallback(() => {
    const selection = window.getSelection();
    const range = document.createRange();
    const target = document.activeElement;
    if (selection && target) {
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  if (!currentList) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Only sticky on desktop, scrolls on mobile to maximize content space */}
      <div className="bg-background md:supports-backdrop-filter:bg-background/80 md:bg-background/95 -mx-4 flex flex-col gap-2 border-b px-4 py-3 sm:py-4 md:sticky md:top-14 md:z-40 md:flex-row md:items-center md:justify-between md:gap-4 md:backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          {/* Title row with mobile undo/redo */}
          <div className="flex items-center justify-between gap-2">
            <div className="group relative inline-flex min-w-0 flex-1 items-center gap-2">
              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={handleTitleBlur}
                onFocus={handleTitleFocus}
                onKeyDown={handleTitleKeyDown}
                onPaste={handleTitlePaste}
                className="hover:border-muted-foreground/30 focus:border-primary/50 focus:bg-muted/20 max-w-full cursor-text break-words rounded-md border-2 border-transparent px-2 py-1 text-xl font-bold outline-hidden transition-all hover:border-dashed focus:border-solid sm:text-2xl md:max-w-[600px] md:text-3xl"
              >
                {currentList.title}
              </h1>
              <Pencil className="text-muted-foreground pointer-events-none h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
            </div>

            {/* Mobile undo/redo - hidden on md+ */}
            {settings.enableUndoRedo && (
              <div className="flex shrink-0 items-center gap-1 md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  disabled={!canUndo || activeDragType !== null}
                  onClick={() => useTierStore.temporal.getState().undo()}
                  aria-label="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  disabled={!canRedo || activeDragType !== null}
                  onClick={() => useTierStore.temporal.getState().redo()}
                  aria-label="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 px-2">
            <p className="text-muted-foreground text-xs">
              {totalItems === 0
                ? "No items yet — upload some images to get started"
                : `${totalItems} ${totalItems === 1 ? "item" : "items"} • ${currentList.rows.length} ${currentList.rows.length === 1 ? "tier" : "tiers"}`}
            </p>
            {/* Tier color strip */}
            <div className="flex gap-0.5">
              {currentList.rows.slice(0, 8).map((row) => (
                <div
                  key={row.id}
                  className="h-1.5 w-3 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: row.color }}
                  title={row.name ?? row.level}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 md:flex md:gap-2">
          {/* History group with subtle bg */}
          {settings.enableUndoRedo && (
            <div className="bg-muted/40 flex items-center rounded-lg p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 md:h-9 md:w-9"
                    disabled={!canUndo || activeDragType !== null}
                    onClick={() => useTierStore.temporal.getState().undo()}
                    aria-label="Undo last action"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 md:h-9 md:w-9"
                    disabled={!canRedo || activeDragType !== null}
                    onClick={() => useTierStore.temporal.getState().redo()}
                    aria-label="Redo last undone action"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo (Ctrl+Shift+Z)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Separator - only show when undo/redo is visible */}
          {settings.enableUndoRedo && (
            <div className="bg-border hidden h-5 w-px sm:block" />
          )}

          {/* Actions group - simplified layout */}
          <ExportButton
            targetRef={exportRef}
            filename={currentList.title.toLowerCase().replace(/\s+/g, "-")}
            hasItems={currentList.rows.some((row) => row.items.length > 0)}
          />
          <ShareDialog tierList={currentList} />
          <EditorMenu
            tierList={currentList}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {/* Settings dialog (controlled by EditorMenu) */}
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            showTrigger={false}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={(event) => {
          // Pause undo history during drag to prevent flooding
          useTierStore.temporal.getState().pause();
          handleDragStart(event);
        }}
        onDragOver={handleDragOver}
        onDragEnd={(event) => {
          // Resume undo history after drag
          useTierStore.temporal.getState().resume();
          handleDragEnd(event);
        }}
        onDragCancel={() => {
          // Resume undo history on cancel
          useTierStore.temporal.getState().resume();
          handleDragCancel();
        }}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.WhileDragging,
          },
        }}
      >
        {/* Tier List - Export Target */}
        <div
          ref={exportRef}
          data-export-target
          className="bg-background overflow-hidden rounded-xl border shadow-md"
        >
          {/* Title - Hidden in editor (shows in header), visible in export */}
          <div
            data-export-title
            className="from-muted/80 to-muted/40 hidden border-b bg-linear-to-r px-4 py-3"
          >
            <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">
              {currentList.title}
            </h2>
          </div>

          {/* Tier Rows with Sortable Context for row reordering */}
          <SortableContext
            items={rowIds}
            strategy={verticalListSortingStrategy}
          >
            {!settings.reduceAnimations ? (
              <AnimatePresence mode="popLayout" initial={false}>
                {currentList.rows.map((row) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    layout
                  >
                    <TierRow
                      row={row}
                      isRowDragging={activeDragType === "row"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              currentList.rows.map((row) => (
                <TierRow
                  key={row.id}
                  row={row}
                  isRowDragging={activeDragType === "row"}
                />
              ))
            )}
          </SortableContext>

          {/* Add Tier Button - Inside tier box, hidden during export */}
          <div
            data-hide-export
            className="border-muted-foreground/20 border-t border-dashed p-3"
          >
            <Button
              variant="ghost"
              className="group text-muted-foreground hover:bg-primary/5 hover:text-foreground w-full gap-2 py-2.5 transition-all"
              onClick={handleAddTier}
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              Add New Tier
            </Button>
          </div>
        </div>

        {/* Empty state hint - when no items uploaded */}
        {totalItems === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-6 text-center"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-muted-foreground"
            >
              <ArrowDown className="h-6 w-6" />
            </motion.div>
            <p className="text-muted-foreground text-sm">
              Drop images below to start ranking
            </p>
          </motion.div>
        )}

        {/* Unassigned Items Pool - Close to tiers for easy drag */}
        <ItemPool items={currentList.unassignedItems} />

        {/* Image Upload - At the bottom for adding new items */}
        <ImageUpload />

        {/* Text-only item input */}
        <div className="flex items-center gap-4">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <TextItemInput />

        {/* Drag Overlay - always show for drag feedback, only disable animation */}
        <DragOverlay
          dropAnimation={
            settings.reduceAnimations
              ? null
              : {
                  duration: 250,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }
          }
        >
          {activeDragType === "item" && activeItem ? (
            <TierItem item={activeItem} containerId={null} isOverlay />
          ) : null}
          {activeDragType === "row" && activeRow ? (
            <TierRow row={activeRow} isRowOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Help text */}
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t pt-4 text-[10px] sm:gap-x-6 sm:text-xs">
        <span className="flex items-center gap-1.5">
          <Kbd>Drag</Kbd>
          items to rank
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Space</Kbd>
          to grab,
          <Kbd>Arrows</Kbd>
          to move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Ctrl+Z</Kbd>
          undo
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <Kbd>Ctrl+Shift+Z</Kbd>
          redo
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Kbd>Esc</Kbd>
          to cancel
        </span>
      </div>

      {/* Mobile Floating Action Bar - only visible <768px */}
      <FloatingActionBar
        exportTargetRef={exportRef}
        filename={currentList.title.toLowerCase().replace(/\s+/g, "-")}
        hasItems={currentList.rows.some((row) => row.items.length > 0)}
        tierList={currentList}
      />
    </div>
  );
}
