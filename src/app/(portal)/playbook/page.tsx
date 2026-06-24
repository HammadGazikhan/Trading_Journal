import { PageHeader } from "@/components/shared/page-header";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { PlaybookContent } from "@/components/playbook/playbook-content";

export const metadata = {
  title: "Playbook | Trading Journal",
  description: "Your trading playbook and setups",
};

export default function PlaybookPage() {
  return (
    <div>
      <PageHeader
        title="Trading Playbook"
        description="Document and refine your best trading setups"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <PlaybookContent />
      </Suspense>
    </div>
  );
}
