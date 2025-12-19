"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SortAsc, LayoutGrid } from "lucide-react";
import { useTierStore } from "../store";
import { EmptyState } from "./EmptyState";
import { TierListCard } from "./TierListCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type SortOption = "updated" | "created" | "name";

export function TierListGallery() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [mounted, setMounted] = useState(false);

  const {
    tierLists,
    createList,
    selectList,
    duplicateList,
    deleteList,
    clearCurrentList,
  } = useTierStore();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    clearCurrentList();
  }, [clearCurrentList]);

  // Filter and sort tier lists
  const filteredAndSortedLists = tierLists
    .filter((list) =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

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

  const handleDeleteList = (id: string) => {
    deleteList(id);
    toast.success("Tier list deleted");
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your tier lists...</p>
        </div>
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
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Your Tier Lists
            </h2>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {tierLists.length === 1
              ? "You have 1 tier list"
              : `You have ${tierLists.length} tier lists`}
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="group h-11 w-full gap-2 shadow-lg transition-all hover:shadow-xl hover:shadow-primary/20 sm:h-10 sm:w-auto"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          Create New
        </Button>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tier lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 border-muted-foreground/20 bg-muted/30 pl-10 transition-colors focus:bg-background"
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
          className="text-sm text-muted-foreground"
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
              onDelete={() => handleDeleteList(list.id)}
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <Search className="h-8 w-8 text-muted-foreground/50" />
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
