import { PageHeader } from "@/components/shared/page-header";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { PsychologyContent } from "@/components/psychology/psychology-content";

export const metadata = {
  title: "Psychology | Trading Journal",
  description: "Understand your trading psychology",
};

export default function PsychologyPage() {
  return (
    <div>
      <PageHeader
        title="Psychology"
        description="Understand how emotions affect your trading performance"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <PsychologyContent />
      </Suspense>
    </div>
  );
}
