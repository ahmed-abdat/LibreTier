"use client";

import { motion } from "framer-motion";
import { Plus, Upload, Move, Palette, Download, ArrowRight } from "lucide-react";
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
      className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16"
    >
      {/* Animated illustration */}
      <motion.div variants={itemVariants} className="relative mb-8 sm:mb-10">
        {/* Background glow */}
        <div className="absolute inset-0 bg-primary/15 blur-[60px] sm:blur-[80px] rounded-full scale-150" />

        {/* Stacked tier cards illustration */}
        <div className="relative scale-75 sm:scale-100">
          {/* Back card - Yellow tier color */}
          <motion.div
            initial={{ rotate: -8, y: 10 }}
            animate={{ rotate: -6, y: 8 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute -left-6 -top-2 w-52 h-36 rounded-2xl bg-gradient-to-br from-[#FFFF7F] to-[#FFE55F] shadow-xl"
          />

          {/* Middle card - Green tier color */}
          <motion.div
            initial={{ rotate: 4, y: -5 }}
            animate={{ rotate: 6, y: -8 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 }}
            className="absolute -right-6 -top-1 w-52 h-36 rounded-2xl bg-gradient-to-br from-[#7FFF7F] to-[#5FDF5F] shadow-xl"
          />

          {/* Front card - main tier visualization */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -4 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.4 }}
            className="relative w-60 h-44 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Mini tier rows */}
            <div className="flex-1 p-4 space-y-2">
              {["S", "A", "B"].map((tier, i) => (
                <div key={tier} className="flex items-center gap-2">
                  <div
                    className="w-7 h-6 rounded-md text-xs font-bold flex items-center justify-center text-black shadow-sm"
                    style={{
                      backgroundColor: i === 0 ? "#FF7F7F" : i === 1 ? "#FFBF7F" : "#FFFF7F"
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
                        transition={{ delay: 0.8 + (i * 0.1) + (j * 0.05) }}
                        className="w-5 h-5 rounded-md bg-white/40 shadow-inner"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
          </motion.div>
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div variants={itemVariants} className="text-center space-y-3 sm:space-y-4 max-w-xl px-2">
        <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs sm:text-sm font-medium">
          No account required
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Create Beautiful Tier Lists
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          Rank anything with customizable tier lists. Upload images, drag to organize, and export to share with friends.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={itemVariants} className="mt-8 sm:mt-10">
        <Button
          size="lg"
          asChild
          className="group relative overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/25 px-6 sm:px-8 py-6 sm:py-7 text-base sm:text-lg font-semibold rounded-xl"
        >
          <Link href="/tiers">
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
              animate={{ translateX: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            />
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </Link>
        </Button>
      </motion.div>

      {/* Feature hints */}
      <motion.div
        variants={itemVariants}
        className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-2xl px-2"
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
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-default"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center">
              <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </div>
            <span className="font-medium text-xs sm:text-sm text-center">{feature.text}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground text-center">{feature.desc}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
