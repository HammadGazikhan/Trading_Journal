"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { DirectionBadge, GradeBadge, PnLBadge, EmotionBadge, SessionBadge } from "@/components/shared/badge";
import { formatDate, formatCurrency, formatSetup, formatRR, formatDayOfWeek } from "@/lib/utils";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import type { TradeWithMistakes } from "@/types";

interface TradesTableProps {
  trades: TradeWithMistakes[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function TradesTable({
  trades,
  loading,
  page,
  total,
  limit,
  onPageChange,
  onRefresh,
}: TradesTableProps) {
  const { openModal } = useTradeModalStore();
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade?")) return;
    
    try {
      const response = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete trade:", error);
    }
  };

  if (loading) {
    return (
      <GlassCard className="overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Day
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Session
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Instrument
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Direction
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Setup
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                P&L
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                RR
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Grade
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/journal/${trade.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {formatDate(trade.date)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDayOfWeek(trade.dayOfWeek)}
                </td>
                <td className="px-4 py-3">
                  <SessionBadge session={trade.session} />
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {trade.instrument}
                </td>
                <td className="px-4 py-3">
                  <DirectionBadge direction={trade.direction} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatSetup(trade.setup)}
                </td>
                <td className="px-4 py-3 text-right">
                  <PnLBadge value={Number(trade.pnl)} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-mono">
                  {formatRR(trade.rrRatio ? Number(trade.rrRatio) : null)}
                </td>
                <td className="px-4 py-3 text-center">
                  <GradeBadge grade={trade.grade} />
                </td>
                <td className="px-4 py-3 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal(trade)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(trade.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
            {total} trades
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
