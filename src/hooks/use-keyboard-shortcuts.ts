"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTradeModalStore } from "@/stores/trade-modal-store";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { openModal, isOpen, closeModal } = useTradeModalStore();
  const lastKeyRef = useRef<string | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Escape - Close modals (works even in inputs)
      if (e.key === "Escape" && isOpen) {
        closeModal();
        return;
      }

      // Don't trigger other shortcuts if user is typing in an input
      if (isInputFocused) {
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // N - Open new trade modal
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openModal();
        return;
      }

      // Cmd/Ctrl + K - Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="Search"]'
        );
        searchInput?.focus();
        return;
      }

      // / - Focus search
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="Search"]'
        );
        searchInput?.focus();
        return;
      }

      // G + key navigation (two-key sequences)
      if (lastKeyRef.current === "g" && timeSinceLastKey < 500) {
        e.preventDefault();
        switch (e.key.toLowerCase()) {
          case "d":
            router.push("/dashboard");
            break;
          case "j":
            router.push("/journal");
            break;
          case "a":
            router.push("/analytics");
            break;
          case "p":
            router.push("/psychology");
            break;
          case "m":
            router.push("/mistakes");
            break;
          case "b":
            router.push("/playbook");
            break;
          case "r":
            router.push("/reports");
            break;
          case "s":
            router.push("/settings");
            break;
        }
        lastKeyRef.current = null;
        return;
      }

      // Store the current key for sequence detection
      lastKeyRef.current = e.key.toLowerCase();
      lastKeyTimeRef.current = now;
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openModal, isOpen, closeModal, router]);
}
