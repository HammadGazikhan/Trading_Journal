import { AppShell } from "@/components/layout/app-shell";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeyboardShortcutsProvider>
      <AppShell>{children}</AppShell>
    </KeyboardShortcutsProvider>
  );
}
