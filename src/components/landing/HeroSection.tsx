"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  Move,
  Palette,
  Download,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function HeroSection() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16"
    >
      {/* Animated illustration */}
      <motion.div variants={itemVariants} className="relative mb-8 sm:mb-10">
        {/* Background glow */}
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/15 blur-[60px] sm:blur-[80px]" />

        {/* Stacked tier cards illustration */}
        <div className="relative scale-75 sm:scale-100">
          {/* Back card - Yellow tier color */}
          <motion.div
            initial={{ rotate: -8, y: 10 }}
            animate={{ rotate: -6, y: 8 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute -left-6 -top-2 h-36 w-52 rounded-2xl bg-gradient-to-br from-[#FFFF7F] to-[#FFE55F] shadow-xl"
          />

          {/* Middle card - Green tier color */}
          <motion.div
            initial={{ rotate: 4, y: -5 }}
            animate={{ rotate: 6, y: -8 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.2,
            }}
            className="absolute -right-6 -top-1 h-36 w-52 rounded-2xl bg-gradient-to-br from-[#7FFF7F] to-[#5FDF5F] shadow-xl"
          />

          {/* Front card - main tier visualization */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -4 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.4,
            }}
            className="relative flex h-44 w-60 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl"
          >
            {/* Mini tier rows */}
            <div className="flex-1 space-y-2 p-4">
              {["S", "A", "B"].map((tier, i) => (
                <div key={tier} className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-7 items-center justify-center rounded-md text-xs font-bold text-black shadow-sm"
                    style={{
                      backgroundColor:
                        i === 0 ? "#FF7F7F" : i === 1 ? "#FFBF7F" : "#FFFF7F",
                    }}
                  >
                    {tier}
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].slice(0, 3 - i).map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 + j * 0.05 }}
                        className="h-5 w-5 rounded-md bg-white/40 shadow-inner"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Shine overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
          </motion.div>
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        variants={itemVariants}
        className="max-w-xl space-y-3 px-2 text-center sm:space-y-4"
      >
        <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
          No account required
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Create Beautiful Tier Lists
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Rank anything with customizable tier lists. Upload images, drag to
          organize, and export to share with friends.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={itemVariants} className="mt-8 sm:mt-10">
        <Button
          size="lg"
          asChild
          className="group relative overflow-hidden rounded-xl px-6 py-6 text-base font-semibold shadow-xl hover:shadow-2xl hover:shadow-primary/25 sm:px-8 sm:py-7 sm:text-lg"
        >
          <Link href="/tiers">
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ translateX: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            />
            <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        </Button>
      </motion.div>

      {/* Feature hints */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid w-full max-w-2xl grid-cols-2 gap-3 px-2 sm:mt-16 sm:grid-cols-4 sm:gap-6"
      >
        {[
          { icon: Upload, text: "Upload images", desc: "Drag & drop files" },
          { icon: Move, text: "Drag to rank", desc: "Intuitive sorting" },
          { icon: Palette, text: "Customize", desc: "Colors & names" },
          { icon: Download, text: "Export", desc: "Share anywhere" },
        ].map((feature, i) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
            whileHover={{ y: -2 }}
            className="flex cursor-default flex-col items-center gap-1.5 rounded-xl bg-muted/30 p-3 transition-colors hover:bg-muted/50 sm:gap-2 sm:p-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted sm:h-10 sm:w-10">
              <feature.icon className="h-4 w-4 text-foreground sm:h-5 sm:w-5" />
            </div>
            <span className="text-center text-xs font-medium sm:text-sm">
              {feature.text}
            </span>
            <span className="text-center text-[10px] text-muted-foreground sm:text-xs">
              {feature.desc}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
