# Trading Journal

A premium trading journal web application built with Next.js 15, designed for serious traders to track performance, analyze psychology, learn from mistakes, and improve their trading edge.

## Features

### Dashboard
- 6 KPI cards with real-time metrics (P&L, win rate, profit factor, streak)
- Equity curve visualization
- Daily P&L bar chart
- Win/Loss donut chart
- Setup performance by win rate
- Performance heatmap by day of week

### Trade Journal
- Full CRUD with add/edit modal
- Search, filters, and pagination
- CSV export functionality
- Screenshot upload (before/after trade)
- Session and day-of-week tracking
- Live P&L and RR calculations

### Analytics (10 Charts)
- Win Rate by Setup
- Profit by Setup
- Win Rate by Day
- Win Rate by Month
- Win Rate by Time of Day
- Long vs Short Performance
- Emotion Analysis
- Mistake Impact
- RR Distribution
- Equity Curve

### Psychology
- Emotion performance comparison
- Confidence score analysis (1-10)
- Followed plan impact tracking
- Best/worst emotional state insights
- Rule-based AI-style recommendations

### Mistake Tracker
- KPIs: total mistakes, money lost, most frequent
- Mistakes over time trend chart
- Drill-down to see trades by mistake
- Ranked money-losing mistakes list

### Trading Playbook
- Create/edit setups with full rules
- Market conditions, entry/exit rules
- Risk management documentation
- Screenshot uploads for examples

### Reports
- Weekly and monthly report generation
- Preview with all key metrics
- Print/PDF export functionality
- Best/worst trade highlights
- Insight summaries

### Settings
- Profile management
- Password change
- Keyboard shortcut reference
- Sign out

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, custom dark theme
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (Auth.js)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Trading_Journal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL and NextAuth secret:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/trading_journal"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. (Optional) Seed demo data:
   ```bash
   npm run db:seed
   ```
   
   Demo credentials:
   - Email: `demo@tradingjournal.com`
   - Password: `Demo123!`

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (portal)/        # Protected dashboard pages
│   └── api/             # API routes
├── components/
│   ├── ui/              # Base UI components
│   ├── layout/          # AppShell, Sidebar, Navbar
│   ├── dashboard/       # Dashboard widgets
│   ├── journal/         # Trade table
│   ├── trade/           # Add/Edit modal, detail view
│   ├── analytics/       # Analytics charts
│   ├── psychology/      # Psychology insights
│   ├── mistakes/        # Mistake tracking
│   ├── playbook/        # Playbook cards
│   ├── reports/         # Report generation
│   └── shared/          # Reusable components
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # NextAuth config
│   ├── utils.ts         # Utilities
│   ├── validators/      # Zod schemas
│   ├── calculations/    # Trade metrics
│   └── analytics/       # Analytics aggregator
├── stores/              # Zustand stores
└── types/               # TypeScript types
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed demo data
- `npm run db:studio` - Open Prisma Studio

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0A0E17` | Page background |
| Card | `#111827` | Card surfaces |
| Surface | `#1A2234` | Inputs, secondary |
| Success | `#00C853` | Profits, positive |
| Destructive | `#FF5252` | Losses, negative |
| Accent | `#00E5FF` | CTAs, highlights |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Open new trade modal |
| `Cmd+K` / `Ctrl+K` | Focus search |
| `/` | Focus search input |
| `Esc` | Close modals |
| `G` then `D` | Go to Dashboard |
| `G` then `J` | Go to Journal |
| `G` then `A` | Go to Analytics |
| `G` then `P` | Go to Psychology |
| `G` then `M` | Go to Mistakes |
| `G` then `B` | Go to Playbook |
| `G` then `R` | Go to Reports |
| `G` then `S` | Go to Settings |

## License

MIT
