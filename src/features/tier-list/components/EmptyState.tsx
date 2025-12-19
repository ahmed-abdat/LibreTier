"use client";

import { motion } from "framer-motion";
import { Plus, Layers, Upload, Move, Palette, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateNew: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[60vh] flex-1 flex-col items-center justify-center px-4 py-12"
    >
      {/* Animated illustration */}
      <motion.div variants={itemVariants} className="relative mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-[60px]" />

        {/* Stacked cards illustration */}
        <div className="relative">
          <motion.div
            initial={{ rotate: -6, scale: 0.95 }}
            animate={{ rotate: -4, scale: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute -left-4 -top-2 h-14 w-20 rounded-xl bg-gradient-to-br from-[#FFBF7F] to-[#FF9F5F] shadow-lg sm:h-16 sm:w-24"
          />
          <motion.div
            initial={{ rotate: 4, scale: 0.98 }}
            animate={{ rotate: 6, scale: 1 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.15,
            }}
            className="absolute -right-4 -top-1 h-14 w-20 rounded-xl bg-gradient-to-br from-[#7FFF7F] to-[#5FDF5F] shadow-lg sm:h-16 sm:w-24"
          />
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -3 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="relative flex h-16 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-xl sm:h-20 sm:w-28"
          >
            <Layers className="h-8 w-8 text-white/90 sm:h-10 sm:w-10" />
          </motion.div>
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        variants={itemVariants}
        className="mb-8 max-w-md space-y-3 text-center"
      >
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Create Your First Tier List
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Rank anything with customizable tier lists. Upload images, drag to
          organize, and share with friends.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={itemVariants}>
        <Button
          size="lg"
          onClick={onCreateNew}
          className="group gap-2 rounded-xl px-6 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/25 sm:px-8 sm:text-lg"
        >
          <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          Get Started
        </Button>
      </motion.div>

      {/* Feature hints */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {[
          { icon: Upload, text: "Upload" },
          { icon: Move, text: "Rank" },
          { icon: Palette, text: "Customize" },
          { icon: Download, text: "Export" },
        ].map((feature) => (
          <div
            key={feature.text}
            className="flex flex-col items-center gap-1.5 rounded-lg bg-muted/30 p-3"
          >
            <feature.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {feature.text}
            </span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
