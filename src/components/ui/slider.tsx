"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> {
  min: number;
  max: number;
  step?: number;
  defaultValue?: [number, number];
  label?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      min,
      max,
      step = 1,
      defaultValue = [min, max],
      label,
      ...props
    },
    ref
  ) => {
    const [values, setValues] = React.useState<[number, number]>(defaultValue);

    const handleValueChange = (newValues: number[]) => {
      setValues([newValues[0], newValues[1]]);
    };

    return (
      <div className="relative w-full">
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
          )}
          min={min}
          max={max}
          step={step}
          value={values}
          onValueChange={handleValueChange}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-accent">
            <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#3293CE] via-[#2F8CCA] to-[#30489C]" />
          </SliderPrimitive.Track>

          {/* Thumb 1 with Label */}
          <div
            className="absolute -bottom-8 -translate-x-1/2 text-xs font-medium text-foreground"
            style={{
              left: `${((values[0] - min) / (max - min)) * 100}%`,
            }}
          >
            {label} {values[0]}
          </div>
          <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-[#3293CE] bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8CCA] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />

          {/* Thumb 2 with Label */}
          <div
            className="absolute -bottom-8 -translate-x-1/2 text-xs font-medium text-foreground"
            style={{
              left: `${((values[1] - min) / (max - min)) * 100}%`,
            }}
          >
            {values[1]}
            {label}
          </div>
          <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-[#3293CE] bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8CCA] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>
      </div>
    );
  }
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
