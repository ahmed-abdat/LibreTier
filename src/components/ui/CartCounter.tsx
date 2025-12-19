"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type CartCounterProps = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
  size?: "sm" | "default";
};

const CartCounter = ({
  value,
  onIncrement,
  onDecrement,
  className,
  size = "default",
}: CartCounterProps) => {
  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-full bg-secondary",
        isSmall
          ? "min-w-[90px] max-w-[90px] px-3 py-2"
          : "min-w-[110px] max-w-[110px] px-4 py-3 sm:max-w-[170px] sm:px-5 md:py-3.5",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className={cn(
          "hover:bg-transparent",
          isSmall ? "h-5 w-5" : "h-5 w-5 text-xl sm:h-6 sm:w-6",
          value === 1 && "cursor-not-allowed opacity-50"
        )}
        onClick={onDecrement}
        disabled={value === 1}
        aria-label="Decrease quantity"
      >
        <Minus className={cn(isSmall ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4")} />
      </Button>
      <span
        className={cn(
          "font-medium",
          isSmall ? "text-sm" : "text-sm sm:text-base"
        )}
      >
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className={cn(
          "hover:bg-transparent",
          isSmall ? "h-5 w-5" : "h-5 w-5 text-xl sm:h-6 sm:w-6"
        )}
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus className={cn(isSmall ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4")} />
      </Button>
    </div>
  );
};

export default CartCounter;
