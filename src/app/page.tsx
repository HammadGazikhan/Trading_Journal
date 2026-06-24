import Link from "next/link";
import { BarChart3, TrendingUp, Brain, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5" />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-background" />
            </div>
            <span className="text-xl font-bold gradient-text">TradeJournal</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 px-6">
        <div className="max-w-7xl mx-auto pt-20 pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Track Your Trades.{" "}
              <span className="gradient-text">Master Your Edge.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              A premium trading journal designed for serious traders. Analyze
              performance, understand your psychology, learn from mistakes, and
              continuously improve your trading edge.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/register">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={BarChart3}
              title="Performance Analytics"
              description="Track win rate, profit factor, expectancy, and more with beautiful visualizations."
            />
            <FeatureCard
              icon={Brain}
              title="Psychology Tracking"
              description="Understand how emotions affect your trading and identify patterns."
            />
            <FeatureCard
              icon={Target}
              title="Mistake Analysis"
              description="Track mistakes, measure their impact, and learn to avoid them."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Trading Playbook"
              description="Document your best setups and build a systematic approach."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          Built for traders, by traders. Trade responsibly.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
