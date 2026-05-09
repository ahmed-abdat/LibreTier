"use client";

import { useRouter } from "next/navigation";
import type { TierList } from "@/features/tier-list";
import { useTierStore } from "@/features/tier-list/store";
import { SharedTierView } from "./shared-tier-view";

interface SharedTierClientProps {
  tierList: TierList;
}

/**
 * Client wrapper that owns the "Clone to My Lists" side effect (write to the
 * Zustand store, navigate to /editor/[id]). Used by the server-rendered
 * /share/[id] page.
 */
export function SharedTierClient({ tierList }: SharedTierClientProps) {
  const router = useRouter();
  const importList = useTierStore((state) => state.importList);

  const handleClone = (list: TierList) => {
    const newListId = importList({
      ...list,
      title: `${list.title} (Copy)`,
    });
    if (newListId) router.push(`/editor/${newListId}`);
  };

  return <SharedTierView tierList={tierList} onClone={handleClone} />;
}
