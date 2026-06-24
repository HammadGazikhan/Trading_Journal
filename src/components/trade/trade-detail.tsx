"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Loader2, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DirectionBadge, GradeBadge, EmotionBadge, PnLBadge, SessionBadge } from "@/components/shared/badge";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import {
  formatDateTime,
  formatCurrency,
  formatSetup,
  formatRR,
  formatMistake,
  formatDayOfWeek,
  formatQuantity,
} from "@/lib/utils";
import type { TradeWithMistakes } from "@/types";

interface TradeDetailProps {
  trade: TradeWithMistakes;
}

export function TradeDetail({ trade }: TradeDetailProps) {
  const router = useRouter();
  const { openModal } = useTradeModalStore();
  const [deleting, setDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleEdit = () => {
    openModal(trade);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trade? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/trades/${trade.id}`, { method: "DELETE" });
      if (response.ok) {
        router.push("/journal");
      }
    } catch (error) {
      console.error("Failed to delete trade:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" asChild>
          <Link href="/journal">
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleEdit}>
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trade Summary */}
          <GlassCard>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Trade Summary</CardTitle>
                <GradeBadge grade={trade.grade} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Instrument</p>
                  <p className="text-lg font-semibold">{trade.instrument}</p>
                </div>
                {trade.market && (
                  <div>
                    <p className="text-sm text-muted-foreground">Market</p>
                    <p className="text-lg font-medium">{trade.market}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Direction</p>
                  <DirectionBadge direction={trade.direction} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session</p>
                  <SessionBadge session={trade.session} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Day</p>
                  <p className="text-lg font-medium">{formatDayOfWeek(trade.dayOfWeek)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setup</p>
                  <p className="text-lg font-medium">
                    {trade.setup === "CUSTOM" && trade.customSetup
                      ? trade.customSetup
                      : formatSetup(trade.setup)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-lg font-medium">{formatDateTime(trade.date)}</p>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          {/* Trade Statistics */}
          <GlassCard>
            <CardHeader>
              <CardTitle>Trade Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Entry Price</p>
                  <p className="text-lg font-mono">{formatCurrency(Number(trade.entryPrice))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exit Price</p>
                  <p className="text-lg font-mono">{formatCurrency(Number(trade.exitPrice))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lots / Quantity</p>
                  <p className="text-lg font-mono">{formatQuantity(Number(trade.quantity))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Size</p>
                  <p className="text-lg font-mono">{Number(trade.contractSize).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stop Loss</p>
                  <p className="text-lg font-mono">
                    {trade.stopLoss ? formatCurrency(Number(trade.stopLoss)) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="text-lg font-mono">
                    {trade.target ? formatCurrency(Number(trade.target)) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk</p>
                  <p className="text-lg font-mono text-destructive">
                    {trade.risk ? formatCurrency(Number(trade.risk)) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reward</p>
                  <p className="text-lg font-mono text-success">
                    {trade.reward ? formatCurrency(Number(trade.reward)) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk/Reward</p>
                  <p className="text-lg font-mono">
                    {formatRR(trade.rrRatio ? Number(trade.rrRatio) : null)}
                  </p>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Profit/Loss</span>
                <PnLBadge value={Number(trade.pnl)} />
              </div>
            </CardContent>
          </GlassCard>

          {/* Notes */}
          {(trade.tradeThesis || trade.whyEntered || trade.whatWentRight || trade.whatWentWrong || trade.lessonsLearned) && (
            <GlassCard>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {trade.tradeThesis && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Trade Thesis</p>
                    <p className="text-foreground">{trade.tradeThesis}</p>
                  </div>
                )}
                {trade.whyEntered && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Why I Entered</p>
                    <p className="text-foreground">{trade.whyEntered}</p>
                  </div>
                )}
                {trade.whatWentRight && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">What Went Right</p>
                    <p className="text-foreground">{trade.whatWentRight}</p>
                  </div>
                )}
                {trade.whatWentWrong && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">What Went Wrong</p>
                    <p className="text-foreground">{trade.whatWentWrong}</p>
                  </div>
                )}
                {trade.lessonsLearned && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Lessons Learned</p>
                    <p className="text-foreground">{trade.lessonsLearned}</p>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Psychology */}
          <GlassCard>
            <CardHeader>
              <CardTitle>Psychology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Emotion Before</p>
                <EmotionBadge emotion={trade.emotionBefore} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Confidence Before</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${trade.confidenceBefore * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{trade.confidenceBefore}/10</span>
                </div>
              </div>
              {trade.emotionAfter && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Emotion After</p>
                  <EmotionBadge emotion={trade.emotionAfter} />
                </div>
              )}
              {trade.confidenceAfter !== null && trade.confidenceAfter !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Confidence After</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${trade.confidenceAfter * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{trade.confidenceAfter}/10</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Followed Plan</p>
                <p className={trade.followedPlan ? "text-success" : "text-destructive"}>
                  {trade.followedPlan === null ? "Not specified" : trade.followedPlan ? "Yes" : "No"}
                </p>
              </div>
            </CardContent>
          </GlassCard>

          {/* Mistakes */}
          <GlassCard>
            <CardHeader>
              <CardTitle>Mistakes</CardTitle>
            </CardHeader>
            <CardContent>
              {trade.mistakes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trade.mistakes.map((m) => (
                    <span
                      key={m.mistake}
                      className="px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive border border-destructive/20"
                    >
                      {formatMistake(m.mistake)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No mistakes tagged</p>
              )}
            </CardContent>
          </GlassCard>

          {/* Screenshots */}
          {(trade.screenshotBefore || trade.screenshotAfter) && (
            <GlassCard>
              <CardHeader>
                <CardTitle>Screenshots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trade.screenshotBefore && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Before Trade</p>
                    <button
                      className="relative w-full group cursor-zoom-in"
                      onClick={() => setLightboxImage(trade.screenshotBefore!)}
                    >
                      <img
                        src={trade.screenshotBefore}
                        alt="Before trade"
                        className="rounded-lg border border-border w-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  </div>
                )}
                {trade.screenshotAfter && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">After Trade</p>
                    <button
                      className="relative w-full group cursor-zoom-in"
                      onClick={() => setLightboxImage(trade.screenshotAfter!)}
                    >
                      <img
                        src={trade.screenshotAfter}
                        alt="After trade"
                        className="rounded-lg border border-border w-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setLightboxImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightboxImage}
              alt="Screenshot"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
