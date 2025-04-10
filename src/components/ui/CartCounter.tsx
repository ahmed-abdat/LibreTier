"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FaMinus, FaPlus } from "react-icons/fa6";
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
        "bg-secondary rounded-full flex items-center justify-between",
        isSmall
          ? "min-w-[90px] max-w-[90px] py-2 px-3"
          : "min-w-[110px] max-w-[110px] sm:max-w-[170px] py-3 md:py-3.5 px-4 sm:px-5",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className={cn(
          "hover:bg-transparent",
          isSmall ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6 text-xl",
          value === 1 && "opacity-50 cursor-not-allowed"
        )}
        onClick={onDecrement}
        disabled={value === 1}
        aria-label="Decrease quantity"
      >
        <FaMinus
          className={cn(isSmall ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4")}
        />
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
          isSmall ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6 text-xl"
        )}
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <FaPlus className={cn(isSmall ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4")} />
      </Button>
    </div>
  );
};

export default CartCounter;
