import type {
  KeyboardCoordinateGetter,
  DroppableContainer,
} from "@dnd-kit/core";
import { closestCorners, getFirstCollision } from "@dnd-kit/core";

interface TierListContextItem {
  id: string;
}

interface TierListContextRow {
  id: string;
  items: TierListContextItem[];
}

interface TierListContext {
  rows: TierListContextRow[];
  unassignedItems: TierListContextItem[];
}

/**
 * Keyboard codes for navigation.
 * We use a custom coordinate getter (not sortableKeyboardCoordinates) because
 * the tier list has a mixed layout: vertical tiers with horizontal items.
 */
const KEYBOARD_CODES = {
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
} as const;

type KeyboardDirection = (typeof KEYBOARD_CODES)[keyof typeof KEYBOARD_CODES];

const DIRECTIONS: KeyboardDirection[] = Object.values(KEYBOARD_CODES);

/**
 * Get all valid droppable IDs for items and containers
 */
function getAllDroppableIds(tierContext: TierListContext): Set<string> {
  const ids = new Set<string>();

  // Add tier droppables
  tierContext.rows.forEach((row) => {
    ids.add(`tier-${row.id}`);
    row.items.forEach((item) => ids.add(item.id));
  });

  // Add pool
  ids.add("unassigned-pool");
  tierContext.unassignedItems.forEach((item) => ids.add(item.id));

  return ids;
}

/**
 * Creates a custom keyboard coordinate getter for tier list navigation.
 *
 * Handles mixed layout:
 * - Arrow Left/Right: Move horizontally within same row
 * - Arrow Up/Down: Move to row above/below
 *
 * Uses position-based filtering (like sortableKeyboardCoordinates)
 * but with tier-aware droppable filtering.
 */
export function createTierListKeyboardCoordinates(
  getTierListContext: () => TierListContext | null
): KeyboardCoordinateGetter {
  return (event, { active, context }) => {
    const {
      active: activeNode,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
    } = context;

    if (!DIRECTIONS.includes(event.code as KeyboardDirection)) {
      return undefined;
    }

    event.preventDefault();

    if (!activeNode || !collisionRect) {
      return undefined;
    }

    // UniqueIdentifier can be string | number, convert to string for prefix check
    const activeIdStr = String(active);

    // Don't interfere with row dragging (rows have "row-" prefix)
    if (activeIdStr.startsWith("row-")) {
      return undefined;
    }

    const tierContext = getTierListContext();
    if (!tierContext) return undefined;

    // Get all valid tier item/container IDs
    const validIds = getAllDroppableIds(tierContext);

    // Filter containers based on:
    // 1. Must be a valid tier droppable (item or container)
    // 2. Must be in the correct direction from current position
    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry.disabled) return;

      const entryId = String(entry.id);

      // Skip if not a valid tier droppable (e.g., row droppables)
      if (!validIds.has(entryId)) return;

      // Skip row droppables for item movement
      if (entryId.startsWith("row-")) return;

      const rect = droppableRects.get(entry.id);
      if (!rect) return;

      // Filter by direction (position-based)
      let include = false;

      switch (event.code) {
        case KEYBOARD_CODES.DOWN:
          // Include containers that are below the current position
          if (collisionRect.top < rect.top) {
            include = true;
          }
          break;

        case KEYBOARD_CODES.UP:
          // Include containers that are above the current position
          if (collisionRect.top > rect.top) {
            include = true;
          }
          break;

        case KEYBOARD_CODES.LEFT:
          // Include containers that are to the left
          // But only if they're roughly on the same row (similar top position)
          if (collisionRect.left > rect.left) {
            const verticalOverlap =
              Math.abs(collisionRect.top - rect.top) < collisionRect.height;
            if (verticalOverlap) {
              include = true;
            }
          }
          break;

        case KEYBOARD_CODES.RIGHT:
          // Include containers that are to the right
          // But only if they're roughly on the same row (similar top position)
          if (collisionRect.left < rect.left) {
            const verticalOverlap =
              Math.abs(collisionRect.top - rect.top) < collisionRect.height;
            if (verticalOverlap) {
              include = true;
            }
          }
          break;
      }

      if (include) {
        filteredContainers.push(entry);
      }
    });

    if (filteredContainers.length === 0) {
      return undefined;
    }

    // For vertical movement (up/down), we should prioritize:
    // 1. First, find the closest tier container (including empty ones)
    // 2. Then find items within that tier
    const isVerticalMove =
      event.code === KEYBOARD_CODES.UP || event.code === KEYBOARD_CODES.DOWN;

    if (isVerticalMove) {
      // Find closest tier container first
      const tierContainers = filteredContainers.filter(
        (c) => String(c.id).startsWith("tier-") || c.id === "unassigned-pool"
      );

      if (tierContainers.length > 0) {
        // Find the closest tier by vertical distance
        let closestTier = tierContainers[0];
        let closestDistance = Infinity;

        tierContainers.forEach((container) => {
          const rect = droppableRects.get(container.id);
          if (rect) {
            const distance = Math.abs(rect.top - collisionRect.top);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestTier = container;
            }
          }
        });

        // Get the tier's rect
        const tierRect = droppableRects.get(closestTier.id);
        if (tierRect) {
          // Find items that are within this tier's vertical range
          const itemsInTier = filteredContainers.filter((c) => {
            if (String(c.id).startsWith("tier-") || c.id === "unassigned-pool")
              return false;
            const itemRect = droppableRects.get(c.id);
            if (!itemRect) return false;
            // Check if item is within tier's vertical range
            const itemCenter = itemRect.top + itemRect.height / 2;
            return (
              itemCenter >= tierRect.top &&
              itemCenter <= tierRect.top + tierRect.height
            );
          });

          if (itemsInTier.length > 0) {
            // Find closest item horizontally (prefer same position)
            let closestItem = itemsInTier[0];
            let closestHDist = Infinity;

            itemsInTier.forEach((item) => {
              const itemRect = droppableRects.get(item.id);
              if (itemRect) {
                const dist = Math.abs(itemRect.left - collisionRect.left);
                if (dist < closestHDist) {
                  closestHDist = dist;
                  closestItem = item;
                }
              }
            });

            const itemRect = droppableRects.get(closestItem.id);
            if (itemRect) {
              return {
                x: itemRect.left,
                y: itemRect.top,
              };
            }
          }

          // No items in tier - target the tier itself
          return {
            x: tierRect.left + tierRect.width / 2 - collisionRect.width / 2,
            y: tierRect.top,
          };
        }
      }
    }

    // For horizontal movement or fallback, use closestCorners
    const collisions = closestCorners({
      active: activeNode,
      collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null,
    });

    let closestId = getFirstCollision(collisions, "id");

    // If the closest is already "over", try the second one
    if (closestId === over?.id && collisions.length > 1) {
      closestId = collisions[1].id;
    }

    if (closestId != null) {
      const newRect = droppableRects.get(closestId);

      if (newRect) {
        // Calculate offset to ensure we move past overlapping items
        // This is simplified from the original sortableKeyboardCoordinates
        let offsetX = 0;
        let offsetY = 0;

        // Check if moving to a position that might overlap with current
        const isMovingDown = event.code === KEYBOARD_CODES.DOWN;
        const isMovingUp = event.code === KEYBOARD_CODES.UP;
        const isMovingRight = event.code === KEYBOARD_CODES.RIGHT;
        const isMovingLeft = event.code === KEYBOARD_CODES.LEFT;

        // Add small offset in the direction of movement to ensure proper collision
        if (isMovingDown && newRect.height < collisionRect.height) {
          offsetY = collisionRect.height - newRect.height;
        }
        if (isMovingUp && newRect.height < collisionRect.height) {
          offsetY = -(collisionRect.height - newRect.height);
        }
        if (isMovingRight && newRect.width < collisionRect.width) {
          offsetX = collisionRect.width - newRect.width;
        }
        if (isMovingLeft && newRect.width < collisionRect.width) {
          offsetX = -(collisionRect.width - newRect.width);
        }

        return {
          x: newRect.left - offsetX,
          y: newRect.top - offsetY,
        };
      }
    }

    return undefined;
  };
}
