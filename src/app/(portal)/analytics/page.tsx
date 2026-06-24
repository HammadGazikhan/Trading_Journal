import { PageHeader } from "@/components/shared/page-header";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { AnalyticsContent } from "@/components/analytics/analytics-content";

export const metadata = {
  title: "Analytics | Trading Journal",
  description: "Deep dive into your trading performance",
};

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep dive into your trading performance metrics"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
