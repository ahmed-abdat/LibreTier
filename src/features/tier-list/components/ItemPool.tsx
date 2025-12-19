"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { TierItem as TierItemType } from "../index";
import { TierItem } from "./TierItem";

interface ItemPoolProps {
  items: TierItemType[];
  isOver?: boolean;
}

export function ItemPool({ items, isOver: isOverProp }: ItemPoolProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: "unassigned-pool",
    data: {
      type: "pool",
      tierId: null,
    },
  });

  const itemIds = items.map((item) => item.id);
  const showDropHighlight = isOverProp || isDroppableOver;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Package className="h-4 w-4" />
          Unassigned Items
        </h3>
        {items.length > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {items.length}
          </span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[5rem] rounded-xl border-2 border-dashed p-4 transition-all duration-200",
          showDropHighlight
            ? "scale-[1.01] border-primary bg-primary/10 ring-2 ring-primary/30"
            : "border-muted-foreground/20 bg-muted/20",
          items.length === 0 && "flex items-center justify-center"
        )}
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <TierItem key={item.id} item={item} containerId={null} />
              ))}
            </div>
          ) : showDropHighlight ? (
            <p className="animate-pulse text-sm font-medium text-primary">
              Drop here to unassign
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50">
              Upload images below to get started
            </p>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
