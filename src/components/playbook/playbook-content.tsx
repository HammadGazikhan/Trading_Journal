"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, BookMarked, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PlaybookModal } from "@/components/playbook/playbook-modal";
import type { Playbook } from "@/types";

export function PlaybookContent() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPlaybooks = useCallback(async () => {
    try {
      const response = await fetch("/api/playbook");
      if (response.ok) {
        const data = await response.json();
        setPlaybooks(data);
      }
    } catch (error) {
      console.error("Failed to fetch playbooks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaybooks();
  }, [fetchPlaybooks]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playbook?")) return;
    
    try {
      const response = await fetch(`/api/playbook/${id}`, { method: "DELETE" });
      if (response.ok) {
        setPlaybooks((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete playbook:", error);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlaybook(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (playbook: Playbook) => {
    setEditingPlaybook(playbook);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlaybook(null);
  };

  const handleSuccess = () => {
    fetchPlaybooks();
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return null;

  if (playbooks.length === 0) {
    return (
      <>
        <EmptyState
          icon={BookMarked}
          title="No playbook entries"
          description="Document your best trading setups to build a systematic approach."
          action={{
            label: "Create First Setup",
            onClick: handleOpenCreate,
          }}
        />
        <PlaybookModal
          isOpen={isModalOpen}
          editingPlaybook={editingPlaybook}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" />
          Add Setup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => {
          const isExpanded = expandedId === playbook.id;
          const hasMoreContent = playbook.exitRules || playbook.riskRules || playbook.screenshot;
          
          return (
            <GlassCard key={playbook.id} className="p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookMarked className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{playbook.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenEdit(playbook)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(playbook.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {playbook.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {playbook.description}
                </p>
              )}

              <div className="space-y-3 flex-1">
                {playbook.conditions && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Conditions
                    </p>
                    <p className="text-sm line-clamp-2">{playbook.conditions}</p>
                  </div>
                )}
                {playbook.entryRules && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Entry Rules
                    </p>
                    <p className="text-sm line-clamp-2">{playbook.entryRules}</p>
                  </div>
                )}

                {isExpanded && (
                  <>
                    {playbook.exitRules && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Exit Rules
                        </p>
                        <p className="text-sm">{playbook.exitRules}</p>
                      </div>
                    )}
                    {playbook.riskRules && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Risk Management
                        </p>
                        <p className="text-sm">{playbook.riskRules}</p>
                      </div>
                    )}
                    {playbook.screenshot && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Screenshot
                        </p>
                        <img
                          src={playbook.screenshot}
                          alt={playbook.name}
                          className="w-full h-32 object-cover rounded-lg border border-white/5"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {hasMoreContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleExpanded(playbook.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show More
                    </>
                  )}
                </Button>
              )}
            </GlassCard>
          );
        })}
      </div>

      <PlaybookModal
        isOpen={isModalOpen}
        editingPlaybook={editingPlaybook}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
