"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTierStore } from "../store";
import { toast } from "sonner";
import { IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT, IMAGE_QUALITY } from "../constants";

interface ImageUploadProps {
  className?: string;
}

// Compress and convert image to Base64
async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Max dimensions for tier list items
        const maxWidth = IMAGE_MAX_WIDTH;
        const maxHeight = IMAGE_MAX_HEIGHT;

        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const base64 = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
        resolve(base64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ className }: ImageUploadProps) {
  const addItem = useTierStore((state) => state.addItem);
  const getCurrentList = useTierStore((state) => state.getCurrentList);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const currentList = getCurrentList();
      if (!currentList) {
        toast.error("Please create a tier list first");
        return;
      }

      setIsProcessing(true);
      const toastId = toast.loading(`Processing ${acceptedFiles.length} image(s)...`);

      const failedFiles: { name: string; error: string }[] = [];
      let successCount = 0;

      for (const file of acceptedFiles) {
        try {
          const base64 = await processImage(file);
          const name = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
          addItem({ name, imageUrl: base64 });
          successCount++;
        } catch (error) {
          console.error(`Error processing image "${file.name}":`, error);
          failedFiles.push({
            name: file.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      if (failedFiles.length === 0) {
        toast.success(`Added ${successCount} image(s)`, { id: toastId });
      } else if (successCount > 0) {
        toast.warning(
          `Added ${successCount} image(s), ${failedFiles.length} failed`,
          { id: toastId }
        );
      } else {
        const errorDetails = failedFiles.map((f) => f.name).join(", ");
        toast.error(`Failed to process: ${errorDetails}`, { id: toastId });
      }

      setIsProcessing(false);
    },
    [addItem, getCurrentList]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: true,
    disabled: isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group overflow-hidden",
        isDragActive
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
        isProcessing && "opacity-50 cursor-wait",
        className
      )}
    >
      <input {...getInputProps()} />

      {/* Animated background pattern */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300",
        isDragActive && "opacity-100"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-3">
        {isDragActive ? (
          <>
            <div className="relative">
              <ImageIcon className="h-12 w-12 text-primary animate-bounce" />
              <Plus className="absolute -right-1 -top-1 h-5 w-5 text-primary bg-background rounded-full" />
            </div>
            <p className="text-sm text-primary font-semibold">Drop images here</p>
          </>
        ) : isProcessing ? (
          <>
            <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Processing...</p>
          </>
        ) : (
          <>
            <div className="relative">
              <Upload className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors duration-200 group-hover:scale-110 transform" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WebP supported
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
