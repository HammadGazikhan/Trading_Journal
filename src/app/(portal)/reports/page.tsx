import { PageHeader } from "@/components/shared/page-header";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { ReportsContent } from "@/components/reports/reports-content";

export const metadata = {
  title: "Reports | Trading Journal",
  description: "Generate trading performance reports",
};

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate weekly and monthly performance reports"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <ReportsContent />
      </Suspense>
    </div>
  );
}
