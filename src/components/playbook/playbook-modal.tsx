"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { playbookSchema, type PlaybookInput } from "@/lib/validators/playbook";
import { cn } from "@/lib/utils";
import type { Playbook } from "@/types";

interface PlaybookModalProps {
  isOpen: boolean;
  editingPlaybook: Playbook | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlaybookModal({
  isOpen,
  editingPlaybook,
  onClose,
  onSuccess,
}: PlaybookModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlaybookInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(playbookSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      conditions: "",
      entryRules: "",
      exitRules: "",
      riskRules: "",
      screenshot: undefined,
    },
  });

  const watchedScreenshot = watch("screenshot");

  useEffect(() => {
    if (!isOpen) return;

    if (editingPlaybook) {
      reset({
        name: editingPlaybook.name,
        description: editingPlaybook.description ?? "",
        conditions: editingPlaybook.conditions ?? "",
        entryRules: editingPlaybook.entryRules ?? "",
        exitRules: editingPlaybook.exitRules ?? "",
        riskRules: editingPlaybook.riskRules ?? "",
        screenshot: editingPlaybook.screenshot ?? undefined,
      });
    } else {
      reset({
        name: "",
        description: "",
        conditions: "",
        entryRules: "",
        exitRules: "",
        riskRules: "",
        screenshot: undefined,
      });
    }
    setUploadError(null);
  }, [isOpen, editingPlaybook, reset]);

  const onSubmit = async (data: PlaybookInput) => {
    try {
      const url = editingPlaybook
        ? `/api/playbook/${editingPlaybook.id}`
        : "/api/playbook";
      const method = editingPlaybook ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save playbook:", error);
    }
  };

  const uploadScreenshot = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Upload failed");
      }

      const { url } = (await response.json()) as { url: string };
      setValue("screenshot", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Failed to upload screenshot:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Screenshot upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const clearScreenshot = () => {
    setValue("screenshot", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    uploadScreenshot(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {editingPlaybook ? "Edit Setup" : "Create New Setup"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Setup Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., VWAP Bounce Reversal"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[80px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Brief description of this trading setup..."
                    {...register("description")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditions">Market Conditions</Label>
                  <textarea
                    id="conditions"
                    className="w-full min-h-[80px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="What market conditions should be present? (e.g., trending market, high volume, price above VWAP)"
                    {...register("conditions")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryRules">Entry Rules</Label>
                  <textarea
                    id="entryRules"
                    className="w-full min-h-[80px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="When and how do you enter? (e.g., Enter on pullback to VWAP with confirmation candle)"
                    {...register("entryRules")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exitRules">Exit Rules</Label>
                  <textarea
                    id="exitRules"
                    className="w-full min-h-[80px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="When and how do you exit? (e.g., Take profit at previous high, trail stop after 1R)"
                    {...register("exitRules")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskRules">Risk Management</Label>
                  <textarea
                    id="riskRules"
                    className="w-full min-h-[80px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="How do you manage risk? (e.g., Max 1% risk per trade, stop loss below VWAP)"
                    {...register("riskRules")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Screenshot</Label>
                  <label
                    htmlFor="playbook-screenshot"
                    className={cn(
                      "group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface/50 p-4 text-center transition-colors",
                      "hover:border-primary/40 hover:bg-surface",
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFiles(e.dataTransfer.files);
                    }}
                  >
                    <input
                      id="playbook-screenshot"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />

                    {watchedScreenshot ? (
                      <div className="w-full space-y-3">
                        <img
                          src={watchedScreenshot}
                          alt="Setup screenshot"
                          className="h-32 w-full rounded-lg border border-white/5 object-cover"
                        />
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-muted-foreground">
                            Click or drop another image to replace
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              clearScreenshot();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {uploading ? (
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        ) : (
                          <ImagePlus className="mx-auto h-8 w-8 text-primary" />
                        )}
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {uploading
                              ? "Uploading screenshot..."
                              : "Drop image here or click to browse"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Add a chart screenshot showing this setup
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                  {uploadError && (
                    <p className="text-sm text-destructive">{uploadError}</p>
                  )}
                </div>
              </form>
            </ScrollArea>

            <div className="flex items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 min-w-[108px] font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="h-10 min-w-[132px] gap-2 font-semibold"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPlaybook ? "Update Setup" : "Create Setup"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
