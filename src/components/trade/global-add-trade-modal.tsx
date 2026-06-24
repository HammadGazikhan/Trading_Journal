"use client";

import { useRouter } from "next/navigation";
import { AddTradeModal } from "@/components/trade/add-trade-modal";
import { useTradeModalStore } from "@/stores/trade-modal-store";

export function GlobalAddTradeModal() {
  const router = useRouter();
  const notifyTradeChanged = useTradeModalStore((s) => s.notifyTradeChanged);

  return (
    <AddTradeModal
      onSuccess={() => {
        notifyTradeChanged();
        router.refresh();
      }}
    />
  );
}
