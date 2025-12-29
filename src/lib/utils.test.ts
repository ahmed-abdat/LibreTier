import { describe, it, expect } from "vitest";
import { cn, getContrastColor } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- intentionally testing falsy value
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles objects", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });
});

describe("getContrastColor", () => {
  it("returns black for light colors", () => {
    expect(getContrastColor("#FFFFFF")).toBe("#000000");
    expect(getContrastColor("#FFFF7F")).toBe("#000000");
    expect(getContrastColor("#7FFF7F")).toBe("#000000");
  });

  it("returns white for dark colors", () => {
    expect(getContrastColor("#000000")).toBe("#FFFFFF");
    expect(getContrastColor("#1a1a1a")).toBe("#FFFFFF");
    expect(getContrastColor("#333333")).toBe("#FFFFFF");
  });

  it("handles colors without hash prefix", () => {
    expect(getContrastColor("FFFFFF")).toBe("#000000");
    expect(getContrastColor("000000")).toBe("#FFFFFF");
  });

  it("returns black for invalid hex colors", () => {
    expect(getContrastColor("invalid")).toBe("#000000");
    expect(getContrastColor("#GGG")).toBe("#000000");
    expect(getContrastColor("")).toBe("#000000");
    expect(getContrastColor("#12345")).toBe("#000000");
  });

  it("handles tier colors correctly", () => {
    expect(getContrastColor("#FF7F7F")).toBe("#000000"); // S tier - light red
    expect(getContrastColor("#FFBF7F")).toBe("#000000"); // A tier - light orange
    // F tier light purple (#7F7FFF) has luminance ~0.55, so returns black
    expect(getContrastColor("#7F7FFF")).toBe("#000000");
    // Very dark colors return white
    expect(getContrastColor("#1F1F3F")).toBe("#FFFFFF");
  });
});
