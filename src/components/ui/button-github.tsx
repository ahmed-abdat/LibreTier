"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GithubIcon, Star } from "lucide-react";

interface GitHubButtonProps {
  owner?: string;
  repo?: string;
  className?: string;
}

export function GitHubButton({
  owner = "ahmed-abdat",
  repo = "libretier",
  className = "",
}: GitHubButtonProps) {
  const [stars, setStars] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [displayStars, setDisplayStars] = useState(0);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStars();
  }, [owner, repo]);

  // Animated counter effect
  useEffect(() => {
    if (stars > 0 && displayStars < stars) {
      const increment = Math.ceil(stars / 30);
      const timer = setTimeout(() => {
        setDisplayStars((prev) => Math.min(prev + increment, stars));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [stars, displayStars]);

  const formatStars = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Button
      type="button"
      onClick={() =>
        window.open(`https://github.com/${owner}/${repo}`, "_blank")
      }
      className={`animate-rainbow before:animate-rainbow group text-foreground relative inline-flex h-9 cursor-pointer items-center justify-center rounded-md border-0 bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(355,79%,56%),hsl(355,82%,62%),hsl(201,58%,50%),hsl(204,62%,48%),hsl(225,53%,40%))] bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] px-3 py-2 text-sm font-medium whitespace-nowrap transition-transform duration-200 [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:bg-[linear-gradient(90deg,hsl(355,79%,56%),hsl(355,82%,62%),hsl(201,58%,50%),hsl(204,62%,48%),hsl(225,53%,40%))] before:[filter:blur(calc(0.8*1rem))] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-[linear-gradient(#0a0a0b,#0a0a0b),linear-gradient(#0a0a0b_50%,rgba(10,10,11,0.6)_80%,rgba(10,10,11,0)),linear-gradient(90deg,hsl(355,79%,56%),hsl(355,82%,62%),hsl(201,58%,50%),hsl(204,62%,48%),hsl(225,53%,40%))] ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <GithubIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Star on GitHub</span>
        <span className="sm:hidden">Star</span>
      </div>
      <div className="ml-2 flex items-center gap-1 text-sm">
        <Star
          className="h-3.5 w-3.5 text-gray-500 transition-all duration-200 group-hover:fill-yellow-400 group-hover:text-yellow-400"
          strokeWidth={2}
        />
        <span className="inline-block min-w-[2rem] text-right font-semibold text-black tabular-nums dark:text-white">
          {isLoading ? "..." : formatStars(displayStars)}
        </span>
      </div>
    </Button>
  );
}

export default GitHubButton;
