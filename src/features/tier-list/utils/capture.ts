import { logger } from "@/lib/logger";

const log = logger.child("Capture");

export interface CaptureOptions {
  /** "light" | "dark" — controls background color and onclone theme. */
  theme?: "light" | "dark";
  /** Override scale. Default 2 (matches current export). */
  scale?: number;
}

/**
 * Pre-load all <img> elements inside the container to ensure they're rendered
 * before html2canvas captures the DOM.
 */
async function preloadImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll("img");
  const promises = Array.from(images).map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails
    });
  });
  await Promise.all(promises);
}

/**
 * Capture a DOM element as a PNG Blob using html2canvas-pro.
 *
 * Dynamically imports html2canvas-pro to keep it out of the main bundle.
 * Applies the same onclone DOM-cleanup logic used by the export flow:
 * hides drag handles / edit / settings / delete / hide-export buttons,
 * shows the export-only title, ensures the cloned doc has the correct
 * theme class, and enhances tier-item visibility for capture.
 */
export async function captureElementAsPngBlob(
  element: HTMLElement,
  options?: CaptureOptions
): Promise<Blob> {
  const theme = options?.theme ?? "light";
  const scale = options?.scale ?? 2;

  // Dynamic import html2canvas-pro (supports oklch colors from Tailwind v4)
  let html2canvas;
  try {
    const html2canvasModule = await import("html2canvas-pro");
    html2canvas = html2canvasModule.default;
  } catch (importError) {
    log.error("Failed to load export library", importError as Error);
    throw new Error("Failed to load export library");
  }

  // Pre-load all images before capture to ensure they're rendered
  await preloadImages(element);

  // Small delay to ensure UI updates
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Get background color based on theme
  const backgroundColor = theme === "dark" ? "#0a0a0f" : "#ffffff";

  const canvas = await html2canvas(element, {
    backgroundColor,
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    imageTimeout: 30000, // Increase timeout for base64 images
    // Set window dimensions for consistent capture
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    // Reset scroll position
    scrollX: 0,
    scrollY: -window.scrollY,
    removeContainer: true,
    onclone: (clonedDoc) => {
      // Ensure theme is applied to cloned document
      const isDark = theme === "dark";
      clonedDoc.documentElement.classList.toggle("dark", isDark);
      clonedDoc.documentElement.classList.toggle("light", !isDark);
      clonedDoc.documentElement.style.colorScheme = isDark ? "dark" : "light";

      // Make sure cloned element is visible
      const clonedElement = clonedDoc.body.querySelector(
        "[data-export-target]"
      );
      if (clonedElement) {
        (clonedElement as HTMLElement).style.transform = "none";
      }
      // Hide drag handles during export
      const dragHandles = clonedDoc.body.querySelectorAll("[data-drag-handle]");
      dragHandles.forEach((handle) => {
        (handle as HTMLElement).style.display = "none";
      });
      // Hide edit buttons during export
      const editButtons = clonedDoc.body.querySelectorAll("[data-edit-button]");
      editButtons.forEach((btn) => {
        (btn as HTMLElement).style.display = "none";
      });
      // Hide elements marked for export exclusion (e.g., Add Tier button)
      const hideElements =
        clonedDoc.body.querySelectorAll("[data-hide-export]");
      hideElements.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
      // Show the title that's hidden in editor
      const exportTitle = clonedDoc.body.querySelector("[data-export-title]");
      if (exportTitle) {
        (exportTitle as HTMLElement).style.display = "block";
      }

      // Enhance item visibility for export
      const exportTarget = clonedDoc.body.querySelector("[data-export-target]");
      if (exportTarget) {
        // Hide all delete buttons on items
        const deleteButtons = exportTarget.querySelectorAll(
          "[data-tier-item] button"
        );
        deleteButtons.forEach((btn) => {
          (btn as HTMLElement).style.display = "none";
        });

        // Hide tier settings buttons (gear icons on tier labels)
        const settingsButtons = exportTarget.querySelectorAll(
          "button[aria-label*='Settings']"
        );
        settingsButtons.forEach((btn) => {
          (btn as HTMLElement).style.display = "none";
        });

        // Also hide any buttons with Settings2 icon class pattern
        const allTierButtons = exportTarget.querySelectorAll(
          ".absolute.rounded-full"
        );
        allTierButtons.forEach((btn) => {
          (btn as HTMLElement).style.display = "none";
        });

        // Find all tier items and enhance their visibility
        const tierItems = exportTarget.querySelectorAll("[data-tier-item]");
        tierItems.forEach((item) => {
          const el = item as HTMLElement;
          // Find the inner container (direct child div)
          const innerContainer = el.querySelector(
            ":scope > div"
          ) as HTMLElement | null;
          if (innerContainer) {
            // Add strong visible border and shadow for contrast
            // Light mode needs stronger borders for visibility
            innerContainer.style.border = isDark
              ? "2px solid rgba(255, 255, 255, 0.4)"
              : "2px solid rgba(0, 0, 0, 0.25)";
            innerContainer.style.boxShadow = isDark
              ? "0 4px 16px rgba(0, 0, 0, 0.7)"
              : "0 2px 10px rgba(0, 0, 0, 0.2)";
            innerContainer.style.borderRadius = "8px";
            innerContainer.style.overflow = "hidden";

            // Remove hover overlay divs that can interfere with image rendering
            const overlayDivs = innerContainer.querySelectorAll(
              ".pointer-events-none.absolute.inset-0"
            );
            overlayDivs.forEach((overlay) => {
              (overlay as HTMLElement).style.display = "none";
            });

            // Check if it's a text-only item (no image)
            const img = innerContainer.querySelector("img");
            if (img) {
              // Image item - ensure solid background and full opacity
              innerContainer.style.backgroundColor = isDark
                ? "#1a1a1f"
                : "#ffffff";
              // Force full opacity and remove any animations/filters
              img.style.opacity = "1";
              img.style.animation = "none";
              img.style.filter = "none";
              img.style.objectFit = "cover";
              img.style.width = "100%";
              img.style.height = "100%";
              // Ensure image is not transparent
              img.style.mixBlendMode = "normal";
              // Add stronger contrast boost for visibility
              img.style.filter = isDark
                ? "contrast(1.08) saturate(1.1)"
                : "contrast(1.12) saturate(1.15) brightness(1.02)";
            } else {
              // Text-only item - needs better contrast
              const textFallback = innerContainer.querySelector(
                "div"
              ) as HTMLElement | null;
              if (textFallback) {
                textFallback.style.backgroundColor = isDark
                  ? "#2a2a35"
                  : "#f5f5f5";
                textFallback.style.color = isDark ? "#ffffff" : "#1a1a1a";
                textFallback.style.fontWeight = "600";
              }
            }
          }
        });

        // Enhance tier row content backgrounds for better item visibility
        const tierContents = exportTarget.querySelectorAll(".grid.min-h-20");
        tierContents.forEach((tier) => {
          const el = tier as HTMLElement;
          el.style.backgroundColor = isDark
            ? "rgba(255, 255, 255, 0.06)"
            : "rgba(0, 0, 0, 0.04)";
        });
      }
    },
  });

  // Validate canvas was generated successfully
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("Canvas generation failed - empty result");
  }

  // Convert to blob with timeout protection
  return await new Promise<Blob>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Image generation timed out"));
    }, 10000);

    canvas.toBlob(
      (blob) => {
        clearTimeout(timeout);
        if (!blob) {
          reject(new Error("Failed to generate image blob"));
          return;
        }
        resolve(blob);
      },
      "image/png",
      1.0
    );
  });
}
