"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTierStore } from "../store";
import { toast } from "sonner";
import {
  IMAGE_MAX_WIDTH,
  IMAGE_MAX_HEIGHT,
  IMAGE_QUALITY,
  MAX_FILE_SIZE,
} from "../constants";

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

      // Filter out files that exceed size limit
      const oversizedFiles = acceptedFiles.filter(
        (f) => f.size > MAX_FILE_SIZE
      );
      const validFiles = acceptedFiles.filter((f) => f.size <= MAX_FILE_SIZE);

      if (oversizedFiles.length > 0) {
        const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
        toast.error(
          `${oversizedFiles.length} file(s) exceed ${maxSizeMB}MB limit: ${oversizedFiles.map((f) => f.name).join(", ")}`
        );
      }

      if (validFiles.length === 0) {
        return;
      }

      setIsProcessing(true);
      const toastId = toast.loading(
        `Processing ${validFiles.length} image(s)...`
      );

      const failedFiles: { name: string; error: string }[] = [];
      let successCount = 0;

      for (const file of validFiles) {
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
      role="button"
      tabIndex={0}
      aria-label="Upload images by dropping files or clicking to browse"
      aria-busy={isProcessing}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
        isDragActive
          ? "scale-[1.02] border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
        isProcessing && "cursor-wait opacity-50",
        className
      )}
    >
      <input {...getInputProps()} aria-hidden="true" />

      {/* Animated background pattern */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          isDragActive && "opacity-100"
        )}
      >
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      <div className="relative flex flex-col items-center gap-3">
        {isDragActive ? (
          <>
            <div className="relative">
              <ImageIcon className="h-12 w-12 animate-bounce text-primary" />
              <Plus className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-background text-primary" />
            </div>
            <p className="text-sm font-semibold text-primary">
              Drop images here
            </p>
          </>
        ) : isProcessing ? (
          <div role="status" aria-live="polite">
            <div
              className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-label="Processing images"
            />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Processing...
            </p>
          </div>
        ) : (
          <>
            <div className="relative">
              <Upload className="h-12 w-12 transform text-muted-foreground transition-colors duration-200 group-hover:scale-110 group-hover:text-primary" />
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
