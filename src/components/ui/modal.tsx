"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface ModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  className,
  isOpen,
  onClose,
  children,
}) => {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[425px]",
          isRTL && "rtl",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn("text-xl font-semibold", isRTL && "text-right")}
          >
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription
              className={cn(
                "text-sm text-muted-foreground",
                isRTL && "text-right"
              )}
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className={cn(isRTL && "text-right")}>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
