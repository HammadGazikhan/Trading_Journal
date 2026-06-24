import { PageHeader } from "@/components/shared/page-header";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TradeDetail } from "@/components/trade/trade-detail";

export const metadata = {
  title: "Trade Detail | Trading Journal",
  description: "View detailed trade analysis",
};

interface TradeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    notFound();
  }

  const trade = await prisma.trade.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      mistakes: true,
    },
  });

  if (!trade) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Trade Detail" description={`${trade.instrument} - ${trade.direction}`} />
      <TradeDetail trade={trade} />
    </div>
  );
}
