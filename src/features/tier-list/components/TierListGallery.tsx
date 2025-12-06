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

  const { tierLists, createList, selectList, duplicateList, deleteList, clearCurrentList } =
    useTierStore();

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Your Tier Lists</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {tierLists.length === 1
              ? "You have 1 tier list"
              : `You have ${tierLists.length} tier lists`}
          </p>
        </div>
        <Button onClick={handleCreateNew} className="w-full sm:w-auto gap-2 group shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all h-11 sm:h-10">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
          Create New
        </Button>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tier lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
          />
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="w-full sm:w-auto gap-2 h-11 justify-center sm:justify-start">
              <SortAsc className="h-4 w-4" />
              <span>{sortLabels[sortBy]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setSortBy("updated")} className="gap-2">
              Last updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("created")} className="gap-2">
              Date created
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name")} className="gap-2">
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
          className="text-center py-16 space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-muted-foreground/50" />
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
