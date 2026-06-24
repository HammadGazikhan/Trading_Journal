import { PageHeader } from "@/components/shared/page-header";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { MistakesContent } from "@/components/mistakes/mistakes-content";

export const metadata = {
  title: "Mistakes | Trading Journal",
  description: "Track and learn from your trading mistakes",
};

export default function MistakesPage() {
  return (
    <div>
      <PageHeader
        title="Mistake Tracker"
        description="Learn from your mistakes to improve your edge"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <MistakesContent />
      </Suspense>
    </div>
  );
}
