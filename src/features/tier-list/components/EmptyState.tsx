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
      className="flex flex-col items-center justify-center flex-1 min-h-[60vh] px-4 py-12"
    >
      {/* Animated illustration */}
      <motion.div variants={itemVariants} className="relative mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full scale-150" />

        {/* Stacked cards illustration */}
        <div className="relative">
          <motion.div
            initial={{ rotate: -6, scale: 0.95 }}
            animate={{ rotate: -4, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute -left-4 -top-2 w-20 h-14 sm:w-24 sm:h-16 rounded-xl bg-gradient-to-br from-[#FFBF7F] to-[#FF9F5F] shadow-lg"
          />
          <motion.div
            initial={{ rotate: 4, scale: 0.98 }}
            animate={{ rotate: 6, scale: 1 }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.15 }}
            className="absolute -right-4 -top-1 w-20 h-14 sm:w-24 sm:h-16 rounded-xl bg-gradient-to-br from-[#7FFF7F] to-[#5FDF5F] shadow-lg"
          />
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -3 }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.3 }}
            className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-xl flex items-center justify-center"
          >
            <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-white/90" />
          </motion.div>
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div variants={itemVariants} className="text-center space-y-3 max-w-md mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Create Your First Tier List
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Rank anything with customizable tier lists. Upload images, drag to organize, and share with friends.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={itemVariants}>
        <Button
          size="lg"
          onClick={onCreateNew}
          className="gap-2 group shadow-lg hover:shadow-xl hover:shadow-primary/25 px-6 sm:px-8 py-6 text-base sm:text-lg font-semibold rounded-xl"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          Get Started
        </Button>
      </motion.div>

      {/* Feature hints */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg"
      >
        {[
          { icon: Upload, text: "Upload" },
          { icon: Move, text: "Rank" },
          { icon: Palette, text: "Customize" },
          { icon: Download, text: "Export" },
        ].map((feature) => (
          <div
            key={feature.text}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/30"
          >
            <feature.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{feature.text}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
