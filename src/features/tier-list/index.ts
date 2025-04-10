import { TierLevel } from "./constants";

// Represents a single item that can be placed in a tier
export interface TierItem {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Represents a row in the tier list
export interface TierRow {
  id: string;
  level: TierLevel;
  color: string;
  items: TierItem[];
  name?: string;
  description?: string;
}

// Represents the complete tier list
export interface TierList {
  id: string;
  title: string;
  description?: string;
  rows: TierRow[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

// State for drag and drop operations
export interface DragState {
  isDragging: boolean;
  draggedItemId?: string;
  sourceRowId?: string;
  targetRowId?: string;
}

// Configuration options for a tier list
export interface TierListConfig {
  allowCustomTiers: boolean;
  maxItemsPerTier: number;
  allowReordering: boolean;
  allowImageUpload: boolean;
  allowPublicSharing: boolean;
}

// Error types for tier list operations
export type TierListError =
  | "TIER_FULL"
  | "INVALID_TIER"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "NETWORK_ERROR";
