"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  Clock,
  BarChart2,
  Loader2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatMistake, cn } from "@/lib/utils";
import type {
  ReportData,
  Insight,
  SetupPerformance,
  MistakeAnalysis,
  SessionPerformance,
  DayPerformance,
  TradeWithMistakes,
  DashboardMetrics,
} from "@/types";

interface ExtendedReportData extends ReportData {
  metrics: DashboardMetrics;
  bestSession: SessionPerformance | null;
  bestDay: DayPerformance | null;
  sessionPerformance: SessionPerformance[];
  dayPerformance: DayPerformance[];
}

export function ReportsContent() {
  const [weeklyReport, setWeeklyReport] = useState<ExtendedReportData | null>(
    null,
  );
  const [monthlyReport, setMonthlyReport] = useState<ExtendedReportData | null>(
    null,
  );
  const [loading, setLoading] = useState({ weekly: false, monthly: false });
  const weeklyPrintRef = useRef<HTMLDivElement>(null);
  const monthlyPrintRef = useRef<HTMLDivElement>(null);

  const fetchReport = async (period: "weekly" | "monthly") => {
    setLoading((prev) => ({ ...prev, [period]: true }));
    try {
      const response = await fetch(`/api/reports?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        if (period === "weekly") {
          setWeeklyReport(data);
        } else {
          setMonthlyReport(data);
        }
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [period]: false }));
    }
  };

  const handlePrint = (period: "weekly" | "monthly") => {
    const printRef = period === "weekly" ? weeklyPrintRef : monthlyPrintRef;
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trading Report - ${period === "weekly" ? "Weekly" : "Monthly"}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px; 
              color: #1a1a1a;
              line-height: 1.5;
            }
            .report-header { margin-bottom: 32px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .report-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .report-period { color: #6b7280; font-size: 14px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
            .metric-card { padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .metric-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
            .metric-value { font-size: 24px; font-weight: 700; }
            .metric-value.positive { color: #059669; }
            .metric-value.negative { color: #dc2626; }
            .section { margin-bottom: 28px; }
            .section-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            .trade-card { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; }
            .insight-card { padding: 12px; border-radius: 8px; margin-bottom: 8px; }
            .insight-positive { background: #ecfdf5; border: 1px solid #a7f3d0; }
            .insight-warning { background: #fef2f2; border: 1px solid #fecaca; }
            .insight-neutral { background: #f0f9ff; border: 1px solid #bae6fd; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          <ReportView
            title="Weekly Trading Report"
            description="Summary of your trading performance for the past 7 days"
            period="weekly"
            report={weeklyReport}
            loading={loading.weekly}
            printRef={weeklyPrintRef}
            onGenerate={() => fetchReport("weekly")}
            onPrint={() => handlePrint("weekly")}
          />
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <ReportView
            title="Monthly Trading Report"
            description="Comprehensive analysis of your trading for the past 30 days"
            period="monthly"
            report={monthlyReport}
            loading={loading.monthly}
            printRef={monthlyPrintRef}
            onGenerate={() => fetchReport("monthly")}
            onPrint={() => handlePrint("monthly")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ReportViewProps {
  title: string;
  description: string;
  period: "weekly" | "monthly";
  report: ExtendedReportData | null;
  loading: boolean;
  printRef: React.RefObject<HTMLDivElement | null>;
  onGenerate: () => void;
  onPrint: () => void;
}

function ReportView({
  title,
  description,
  period,
  report,
  loading,
  printRef,
  onGenerate,
  onPrint,
}: ReportViewProps) {
  return (
    <GlassCard className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {period === "weekly" ? "Last 7 days" : "Last 30 days"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onGenerate}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {report ? "Refresh" : "Generate"}
          </Button>
          {report && (
            <Button className="gap-2" onClick={onPrint}>
              <Printer className="w-4 h-4" />
              Print / PDF
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : report ? (
          <ReportPreview report={report} printRef={printRef} period={period} />
        ) : (
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <EmptyState
              icon={FileText}
              title="Report Preview"
              description="Click Generate to create your report"
            />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

interface ReportPreviewProps {
  report: ExtendedReportData;
  printRef: React.RefObject<HTMLDivElement | null>;
  period: "weekly" | "monthly";
}

function ReportPreview({ report, printRef, period }: ReportPreviewProps) {
  const periodLabel = period === "weekly" ? "Weekly" : "Monthly";
  const startDate = new Date(report.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(report.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div
        ref={printRef}
        className="p-6 rounded-xl bg-card border border-border space-y-6"
      >
        {/* Header */}
        <div className="report-header border-b border-border pb-4">
          <h2 className="report-title text-2xl font-bold">
            {periodLabel} Trading Report
          </h2>
          <p className="report-period text-muted-foreground">
            {startDate} — {endDate}
          </p>
        </div>

        {/* KPI Summary */}
        <div className="metrics-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Total Trades"
            value={report.totalTrades}
            icon={BarChart2}
          />
          <MetricCard
            label="Win Rate"
            value={`${report.winRate.toFixed(1)}%`}
            icon={Target}
            positive={report.winRate >= 50}
          />
          <MetricCard
            label="Total P&L"
            value={formatCurrency(report.totalPnl)}
            icon={report.totalPnl >= 0 ? TrendingUp : TrendingDown}
            positive={report.totalPnl >= 0}
          />
          <MetricCard
            label="Profit Factor"
            value={report.metrics?.profitFactor?.toFixed(2) ?? "N/A"}
            icon={Award}
            positive={(report.metrics?.profitFactor ?? 0) > 1}
          />
          <MetricCard
            label="Avg RR"
            value={report.metrics?.averageRR?.toFixed(2) ?? "N/A"}
            icon={Target}
          />
          <MetricCard
            label="Streak"
            value={`${report.metrics?.currentStreak ?? 0} ${report.metrics?.streakType ?? ""}`}
            icon={
              report.metrics?.streakType === "win" ? TrendingUp : TrendingDown
            }
            positive={report.metrics?.streakType === "win"}
          />
        </div>

        {/* Best/Worst Trades */}
        <div className="section grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.bestTrade && (
            <TradeCard trade={report.bestTrade} type="Best Trade" />
          )}
          {report.worstTrade && (
            <TradeCard trade={report.worstTrade} type="Worst Trade" />
          )}
        </div>

        {/* Best Setup and Biggest Mistake */}
        <div className="section grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.bestSetup && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">
                  Best Setup
                </span>
              </div>
              <p className="text-lg font-bold">{report.bestSetup.setup}</p>
              <p className="text-sm text-muted-foreground">
                {report.bestSetup.winRate.toFixed(1)}% win rate •{" "}
                {report.bestSetup.trades} trades •{" "}
                {formatCurrency(report.bestSetup.totalPnl)}
              </p>
            </div>
          )}

          {report.biggestMistake &&
            report.biggestMistake.mistake !== "NO_MISTAKE" && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Biggest Mistake
                  </span>
                </div>
                <p className="text-lg font-bold">
                  {formatMistake(report.biggestMistake.mistake)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {report.biggestMistake.count} occurrences •{" "}
                  {formatCurrency(report.biggestMistake.totalLoss)} lost
                </p>
              </div>
            )}
        </div>

        {/* Best Session and Day */}
        <div className="section grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.bestSession && (
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">
                  Best Session
                </span>
              </div>
              <p className="text-lg font-bold">{report.bestSession.session}</p>
              <p className="text-sm text-muted-foreground">
                {report.bestSession.winRate.toFixed(1)}% win rate •{" "}
                {report.bestSession.trades} trades
              </p>
            </div>
          )}

          {report.bestDay && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Best Day
                </span>
              </div>
              <p className="text-lg font-bold">{report.bestDay.day}</p>
              <p className="text-sm text-muted-foreground">
                {report.bestDay.winRate.toFixed(1)}% win rate •{" "}
                {report.bestDay.trades} trades
              </p>
            </div>
          )}
        </div>

        {/* Insights */}
        {report.insights && report.insights.length > 0 && (
          <div className="section">
            <h3 className="section-title text-lg font-semibold mb-3 border-b border-border pb-2">
              Key Insights
            </h3>
            <div className="space-y-3">
              {report.insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  positive,
}: {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  positive?: boolean;
}) {
  return (
    <div className="metric-card p-4 rounded-xl bg-surface/50 border border-border">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="metric-label text-xs text-muted-foreground">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "metric-value text-xl font-bold",
          positive === true && "text-success positive",
          positive === false && "text-destructive negative",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TradeCard({
  trade,
  type,
}: {
  trade: TradeWithMistakes;
  type: "Best Trade" | "Worst Trade";
}) {
  const pnl =
    typeof trade.pnl === "object" && "toNumber" in trade.pnl
      ? (trade.pnl as { toNumber: () => number }).toNumber()
      : Number(trade.pnl);
  const isBest = type === "Best Trade";

  return (
    <div
      className={cn(
        "trade-card p-4 rounded-xl border",
        isBest
          ? "bg-success/5 border-success/20"
          : "bg-destructive/5 border-destructive/20",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {isBest ? (
          <TrendingUp className="w-5 h-5 text-success" />
        ) : (
          <TrendingDown className="w-5 h-5 text-destructive" />
        )}
        <span
          className={cn(
            "text-sm font-medium",
            isBest ? "text-success" : "text-destructive",
          )}
        >
          {type}
        </span>
      </div>
      <p className="text-lg font-bold">{trade.instrument}</p>
      <p className="text-sm text-muted-foreground">
        {new Date(trade.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}{" "}
        • {trade.direction} • {trade.setup}
      </p>
      <p
        className={cn(
          "text-xl font-bold mt-2",
          pnl >= 0 ? "text-success" : "text-destructive",
        )}
      >
        {formatCurrency(pnl)}
      </p>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const bgColors = {
    positive: "bg-success/10 border-success/20 insight-positive",
    neutral: "bg-accent/10 border-accent/20 insight-neutral",
    warning: "bg-destructive/10 border-destructive/20 insight-warning",
  };

  const textColors = {
    positive: "text-success",
    neutral: "text-accent",
    warning: "text-destructive",
  };

  return (
    <div
      className={cn(
        "insight-card p-4 rounded-xl border",
        bgColors[insight.severity],
      )}
    >
      <p className={cn("font-medium", textColors[insight.severity])}>
        {insight.headline}
      </p>
      <p className="text-lg font-bold my-1">{insight.stat}</p>
      <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
    </div>
  );
}
