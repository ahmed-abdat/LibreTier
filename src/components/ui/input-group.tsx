import * as React from "react";
import { cn } from "@/lib/utils";

const InputGroupContext = React.createContext<{ id: string } | null>(null);

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  (props, ref) => {
    const { className, id: providedId, ...restProps } = props;
    const generatedId = React.useId();
    const id = providedId ?? generatedId;

    return (
      <InputGroupContext.Provider value={{ id }}>
        <div
          ref={ref}
          className={cn("flex flex-row items-center", className)}
          {...restProps}
        />
      </InputGroupContext.Provider>
    );
  }
);
InputGroup.displayName = "InputGroup";

interface InputGroupTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InputGroupText = React.forwardRef<HTMLDivElement, InputGroupTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 items-center rounded-l-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background",
          className
        )}
        {...props}
      />
    );
  }
);
InputGroupText.displayName = "InputGroupText";

interface InputGroupInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
}

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  InputGroupInputProps
>(({ className, type, ...props }, ref) => {
  const context = React.useContext(InputGroupContext);
  const id = context?.id;

  return (
    <input
      ref={ref}
      id={id}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

export { InputGroup, InputGroupText, InputGroupInput };
