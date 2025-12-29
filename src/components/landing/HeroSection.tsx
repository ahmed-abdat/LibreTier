"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  Move,
  Palette,
  Download,
  ArrowRight,
  Undo2,
  WifiOff,
  Type,
  Shield,
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
        {/* Background glow - subtle and smooth */}
        <div className="bg-primary/10 dark:bg-primary/[0.07] absolute inset-0 scale-150 rounded-full blur-[80px] sm:blur-[100px]" />

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
            className="absolute -top-2 -left-6 h-36 w-52 rounded-2xl bg-linear-to-br from-[#FFFF7F] to-[#FFE55F] shadow-xl"
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
            className="absolute -top-1 -right-6 h-36 w-52 rounded-2xl bg-linear-to-br from-[#7FFF7F] to-[#5FDF5F] shadow-xl"
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
            className="from-primary to-primary/80 relative flex h-44 w-60 flex-col overflow-hidden rounded-2xl bg-linear-to-br shadow-2xl"
          >
            {/* Mini tier rows */}
            <div className="flex-1 space-y-2 p-4">
              {["S", "A", "B"].map((tier, i) => (
                <div key={tier} className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-7 items-center justify-center rounded-md text-xs font-bold text-black shadow-xs"
                    style={{
                      backgroundColor:
                        i === 0 ? "#FF7F7F" : i === 1 ? "#FFBF7F" : "#FFFF7F",
                    }}
                  >
                    {tier}
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].slice(0, 3 - i).map((n, j) => (
                      <motion.div
                        key={`${tier}-item-${n}`}
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
            <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-white/20" />
          </motion.div>
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        variants={itemVariants}
        className="max-w-xl space-y-3 px-2 text-center sm:space-y-4"
      >
        <span className="border-primary/20 bg-primary/5 text-primary inline-block rounded-full border px-4 py-1.5 text-xs font-medium sm:text-sm">
          No account required
        </span>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Free Tier List Maker
        </h1>
        <p className="text-foreground/70 dark:text-foreground/60 text-base leading-relaxed sm:text-lg">
          Create and share tier lists instantly. No login needed. Works offline.
          Upload images, drag to rank, export as PNG.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={itemVariants} className="mt-8 sm:mt-10">
        <Button
          size="lg"
          asChild
          className="group rounded-xl px-6 py-5 text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg sm:px-8 sm:py-6 sm:text-lg"
        >
          <Link href="/tiers">
            <Plus className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-90 sm:h-5 sm:w-5" />
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 sm:h-5 sm:w-5" />
          </Link>
        </Button>
      </motion.div>

      {/* Feature hints */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-3 px-2 sm:mt-16 sm:grid-cols-4 sm:gap-4"
      >
        {[
          { icon: Upload, text: "Upload images", desc: "Drag & drop files" },
          { icon: Move, text: "Drag to rank", desc: "Intuitive sorting" },
          { icon: Palette, text: "Customize", desc: "Colors & names" },
          { icon: Download, text: "Export PNG", desc: "Share anywhere" },
          { icon: Undo2, text: "Undo/Redo", desc: "50-step history" },
          { icon: WifiOff, text: "Works offline", desc: "PWA support" },
          { icon: Type, text: "Text items", desc: "No image needed" },
          { icon: Shield, text: "Private & local", desc: "Data on device" },
        ].map((feature, i) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.05 }}
            whileHover={{ y: -2 }}
            className="bg-card/50 dark:bg-card/30 hover:bg-card/80 dark:hover:bg-card/50 border-border/50 flex cursor-default flex-col items-center gap-1.5 rounded-xl border p-3 shadow-sm transition-all hover:shadow-md sm:gap-2 sm:p-4"
          >
            <div className="bg-primary/10 dark:bg-primary/20 flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10">
              <feature.icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-foreground text-center text-xs font-medium sm:text-sm">
              {feature.text}
            </span>
            <span className="text-foreground/60 dark:text-foreground/50 text-center text-[11px] sm:text-xs">
              {feature.desc}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
