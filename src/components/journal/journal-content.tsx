"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import { TradesTable } from "./trades-table";
import { TRADE_SESSIONS, DAYS_OF_WEEK, type TradeWithMistakes } from "@/types";

interface TradesResponse {
  trades: TradeWithMistakes[];
  total: number;
  page: number;
  limit: number;
}

export function JournalContent() {
  const searchParams = useSearchParams();
  const { openModal } = useTradeModalStore();
  const refreshKey = useTradeModalStore((s) => s.refreshKey);
  const [trades, setTrades] = useState<TradeWithMistakes[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [sessionFilter, setSessionFilter] = useState<string>("");
  const [dayFilter, setDayFilter] = useState<string>("");

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (searchQuery) params.set("search", searchQuery);
      if (sessionFilter && sessionFilter !== "ALL")
        params.set("session", sessionFilter);
      if (dayFilter && dayFilter !== "ALL") params.set("dayOfWeek", dayFilter);

      const response = await fetch(`/api/trades?${params}`);
      if (response.ok) {
        const data: TradesResponse = await response.json();
        setTrades(data.trades);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch trades:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sessionFilter, dayFilter]);

  const clearFilters = () => {
    setSessionFilter("");
    setDayFilter("");
    setSearchQuery("");
  };

  const hasFilters =
    (sessionFilter && sessionFilter !== "ALL") ||
    (dayFilter && dayFilter !== "ALL") ||
    searchQuery;

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades, refreshKey]);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/trades/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trades-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export trades:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTrades();
  };

  if (!loading && trades.length === 0 && !searchQuery) {
    return (
      <EmptyState
        title="No trades yet"
        description="Start logging your trades to build your journal and track your performance."
        showAddTrade
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by instrument..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => openModal()}>
              <Plus className="w-4 h-4" />
              Add Trade
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={sessionFilter} onValueChange={setSessionFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sessions</SelectItem>
              {TRADE_SESSIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Days</SelectItem>
              {DAYS_OF_WEEK.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1 text-muted-foreground"
            >
              <X className="w-3 h-3" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <TradesTable
        trades={trades}
        loading={loading}
        page={page}
        total={total}
        limit={20}
        onPageChange={setPage}
        onRefresh={fetchTrades}
      />
    </div>
  );
}
