"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCTA() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto w-full overflow-hidden px-4 py-16 sm:py-24 md:py-28"
    >
      {/* Subtle glow background - blends smoothly with adjacent sections */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/[0.04] dark:bg-primary/[0.025] absolute top-1/3 left-1/3 h-[250px] w-[250px] rounded-full blur-[100px] sm:h-[350px] sm:w-[350px] sm:blur-[120px]" />
        <div className="bg-primary/[0.03] dark:bg-primary/[0.02] absolute right-1/3 bottom-1/3 h-[200px] w-[200px] rounded-full blur-[100px] sm:h-[300px] sm:w-[300px] sm:blur-[120px]" />
      </div>

      {/* Decorative floating tier cards - hidden on mobile */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -12 }}
          whileInView={{ opacity: 0.6, y: 0, rotate: -12 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="absolute top-12 left-[8%] hidden md:block"
        >
          <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-[#FF7F7F] text-sm font-bold text-black shadow-lg">
            S
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20, rotate: 8 }}
          whileInView={{ opacity: 0.5, y: 0, rotate: 8 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="absolute right-[10%] bottom-16 hidden md:block"
        >
          <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-[#FFBF7F] text-sm font-bold text-black shadow-lg">
            A
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20, rotate: -6 }}
          whileInView={{ opacity: 0.4, x: 0, rotate: -6 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-20 left-[15%] hidden md:block"
        >
          <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-[#7FFF7F] text-sm font-bold text-black shadow-lg">
            B
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-2xl px-2 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="border-primary/20 bg-primary/5 mb-4 inline-flex items-center rounded-full border px-3 py-1 sm:mb-6 sm:px-4 sm:py-1.5"
        >
          <span className="text-primary text-xs font-medium sm:text-sm">
            100% Free & Open Source
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
        >
          Ready to rank?
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-foreground/70 mx-auto mt-3 max-w-md text-base sm:mt-4 sm:text-lg md:text-xl"
        >
          Start creating your tier list now. No account needed.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-10"
        >
          <Button
            size="lg"
            asChild
            className="group rounded-xl px-6 py-5 text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg sm:px-8 sm:py-6 sm:text-lg"
          >
            <Link href="/tiers">
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:mt-8 sm:gap-x-6 sm:text-sm"
        >
          {["Free forever", "Works offline", "No sign-up"].map((text) => (
            <span
              key={text}
              className="text-foreground/60 flex items-center gap-1.5"
            >
              <span className="bg-primary/60 h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
