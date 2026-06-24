"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InstrumentDefinition } from "@/lib/instruments/types";

interface InstrumentInfoCardProps {
  instrument: InstrumentDefinition | null;
  className?: string;
}

export function InstrumentInfoCard({
  instrument,
  className,
}: InstrumentInfoCardProps) {
  return (
    <AnimatePresence mode="wait">
      {instrument && (
        <motion.div
          key={instrument.symbol}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-4",
            className
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-lg font-bold tracking-wide text-foreground">
                {instrument.symbol}
              </p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {instrument.name}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <InfoPill label="Market" value={instrument.market} />
                <InfoPill label="Asset Class" value={instrument.assetClass} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/80 bg-secondary/40 px-2.5 py-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}
