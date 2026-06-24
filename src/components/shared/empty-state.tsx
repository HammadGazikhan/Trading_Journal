"use client";

import { LucideIcon, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTradeModalStore } from "@/stores/trade-modal-store";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  showAddTrade?: boolean;
}

export function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  action,
  showAddTrade = false,
}: EmptyStateProps) {
  const { openModal } = useTradeModalStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {description}
      </p>
      <div className="flex gap-3">
        {showAddTrade && (
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            Log Your First Trade
          </Button>
        )}
        {action && (
          <Button
            variant={showAddTrade ? "outline" : "default"}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
