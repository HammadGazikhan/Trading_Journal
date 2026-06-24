import { PageHeader } from "@/components/shared/page-header";
import { Suspense } from "react";
import { JournalTableSkeleton } from "@/components/shared/loading-skeleton";
import { JournalContent } from "@/components/journal/journal-content";

export const metadata = {
  title: "Journal | Trading Journal",
  description: "View and manage all your trades",
};

export default function JournalPage() {
  return (
    <div>
      <PageHeader
        title="Trade Journal"
        description="View, filter, and analyze all your trades"
      />
      <Suspense fallback={<JournalTableSkeleton />}>
        <JournalContent />
      </Suspense>
    </div>
  );
}
