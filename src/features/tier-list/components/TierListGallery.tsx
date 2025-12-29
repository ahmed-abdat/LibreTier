"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SortAsc, LayoutGrid } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTierStore, useTierLists } from "../store";
import { EmptyState } from "./EmptyState";
import { TierListCard } from "./TierListCard";
import { ImportJSONButton } from "./ImportJSONButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteImages } from "@/lib/services/imgbb";
import { logger } from "@/lib/logger";

const log = logger.child("TierListGallery");

type SortOption = "updated" | "created" | "name";

export function TierListGallery() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [mounted, setMounted] = useState(false);

  // Get tierLists from store
  const rawTierLists = useTierLists();

  // Helper to check if an image URL is hosted on imgbb
  const isImgbbUrl = useCallback(
    (url: string | undefined) => url?.includes("ibb.co") ?? false,
    []
  );

  // Compute metadata outside selector to avoid infinite loops
  const tierLists = useMemo(
    () =>
      rawTierLists.map((list) => {
        const allItems = [
          ...list.unassignedItems,
          ...list.rows.flatMap((r) => r.items),
        ];
        const hostedImageDeleteUrls = allItems
          .filter((item) => item.imageDeleteUrl ?? isImgbbUrl(item.imageUrl))
          .map((item) => item.imageDeleteUrl)
          .filter((url): url is string => !!url);

        return {
          id: list.id,
          title: list.title,
          createdAt: list.createdAt.getTime(),
          updatedAt: list.updatedAt.getTime(),
          itemCount:
            list.rows.reduce((acc, r) => acc + r.items.length, 0) +
            list.unassignedItems.length,
          rowCount: list.rows.length,
          previewColors: list.rows.slice(0, 4).map((r) => r.color),
          hasHostedImages: hostedImageDeleteUrls.length > 0,
          hostedImageDeleteUrls,
        };
      }),
    [rawTierLists, isImgbbUrl]
  );

  const createList = useTierStore((state) => state.createList);
  const selectList = useTierStore((state) => state.selectList);
  const duplicateList = useTierStore((state) => state.duplicateList);
  const deleteList = useTierStore((state) => state.deleteList);
  const clearCurrentList = useTierStore((state) => state.clearCurrentList);

  // Handle hydration
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- Required for SSR hydration
    clearCurrentList();
  }, [clearCurrentList]);

  // Filter and sort tier lists - memoized for performance
  const filteredAndSortedLists = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return tierLists
      .filter((list) => list.title.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        switch (sortBy) {
          case "updated":
            return b.updatedAt - a.updatedAt;
          case "created":
            return b.createdAt - a.createdAt;
          case "name":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [tierLists, searchQuery, sortBy]);

  const handleCreateNew = () => {
    const id = createList("Untitled Tier List");
    router.push(`/editor/${id}`);
  };

  const handleSelectList = (id: string) => {
    selectList(id);
    router.push(`/editor/${id}`);
  };

  const handleDuplicateList = (id: string) => {
    const newId = duplicateList(id);
    if (newId) {
      toast.success("Tier list duplicated!");
    }
  };

  const handleDeleteList = async (
    id: string,
    cleanupHostedImages?: boolean
  ) => {
    // Find the tier list metadata to get delete URLs
    const listMetadata = tierLists.find((l) => l.id === id);

    // Delete from store first
    deleteList(id);
    toast.success("Tier list deleted");

    // If cleanup requested and there are hosted images, delete them in background
    if (
      cleanupHostedImages &&
      listMetadata?.hostedImageDeleteUrls &&
      listMetadata.hostedImageDeleteUrls.length > 0
    ) {
      try {
        const result = await deleteImages(listMetadata.hostedImageDeleteUrls);
        if (result.deletedCount > 0) {
          toast.success(`Cleaned up ${result.deletedCount} hosted image(s)`);
        }
        if (result.errors.length > 0) {
          log.warn("Some images failed to delete", { errors: result.errors });
        }
      } catch (error) {
        log.error("Failed to cleanup hosted images", error as Error);
        // Don't show error toast - the tier list is already deleted
      }
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading your tier lists..." />
      </div>
    );
  }

  // Show empty state if no tier lists
  if (tierLists.length === 0) {
    return <EmptyState onCreateNew={handleCreateNew} />;
  }

  const sortLabels: Record<SortOption, string> = {
    updated: "Last updated",
    created: "Date created",
    name: "Name",
  };

  return (
    <div className="space-y-8">
      {/* Hero Section for returning users */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-primary h-5 w-5" />
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Your Tier Lists
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {tierLists.length === 1
              ? "You have 1 tier list"
              : `You have ${tierLists.length} tier lists`}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <ImportJSONButton />
          <Button
            onClick={handleCreateNew}
            className="group hover:shadow-primary/20 h-11 flex-1 gap-2 shadow-lg transition-all hover:shadow-xl sm:h-10 sm:flex-none"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Create New
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search tier lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-muted-foreground/20 bg-muted/30 focus:bg-background h-11 pl-10 transition-colors"
          />
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="h-11 w-full justify-center gap-2 sm:w-auto sm:justify-start"
            >
              <SortAsc className="h-4 w-4" />
              <span>{sortLabels[sortBy]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setSortBy("updated")}
              className="gap-2"
            >
              Last updated
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("created")}
              className="gap-2"
            >
              Date created
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("name")}
              className="gap-2"
            >
              Name
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results info when searching */}
      {searchQuery && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-sm"
        >
          {filteredAndSortedLists.length === 0
            ? `No results for "${searchQuery}"`
            : `Found ${filteredAndSortedLists.length} tier list${filteredAndSortedLists.length === 1 ? "" : "s"}`}
        </motion.p>
      )}

      {/* Grid of tier list cards */}
      <motion.div
        layout
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedLists.map((list, index) => (
            <TierListCard
              key={list.id}
              tierList={list}
              index={index}
              onSelect={() => handleSelectList(list.id)}
              onDuplicate={() => handleDuplicateList(list.id)}
              onDelete={(cleanup) => {
                void handleDeleteList(list.id, cleanup);
              }}
              hasHostedImages={list.hasHostedImages}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No results message */}
      {filteredAndSortedLists.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 py-16 text-center"
        >
          <div className="bg-muted/50 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Search className="text-muted-foreground/50 h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">No results found</p>
            <p className="text-muted-foreground">
              No tier lists matching &quot;{searchQuery}&quot;
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchQuery("")}
            className="mt-2"
          >
            Clear search
          </Button>
        </motion.div>
      )}
    </div>
  );
}
