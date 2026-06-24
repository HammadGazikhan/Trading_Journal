-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "TradeGrade" AS ENUM ('A_PLUS', 'A', 'B', 'C', 'FOMO');

-- CreateEnum
CREATE TYPE "Emotion" AS ENUM ('CALM', 'FOCUSED', 'EXCITED', 'FEARFUL', 'REVENGE', 'FOMO');

-- CreateEnum
CREATE TYPE "MistakeType" AS ENUM ('FOMO_ENTRY', 'REVENGE_TRADE', 'EARLY_EXIT', 'LATE_ENTRY', 'IGNORED_STOP_LOSS', 'OVER_TRADING', 'NO_MISTAKE');

-- CreateEnum
CREATE TYPE "SetupType" AS ENUM ('BREAKOUT', 'PULLBACK', 'VWAP_BOUNCE', 'REVERSAL', 'TREND_CONTINUATION', 'SUPPORT_RESISTANCE', 'ORB', 'SCALPING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AiInsightType" AS ENUM ('TRADE_REVIEW', 'PSYCHOLOGY_ANALYSIS', 'MISTAKE_DETECTION', 'WEEKLY_COACH');

-- CreateEnum
CREATE TYPE "TradeSession" AS ENUM ('ASIAN', 'LONDON', 'NEW_YORK', 'LONDON_NEW_YORK_OVERLAP');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "market" TEXT,
    "instrument" TEXT NOT NULL,
    "direction" "TradeDirection" NOT NULL,
    "session" "TradeSession" NOT NULL DEFAULT 'NEW_YORK',
    "dayOfWeek" "DayOfWeek" NOT NULL DEFAULT 'MONDAY',
    "entryPrice" DECIMAL(18,8) NOT NULL,
    "exitPrice" DECIMAL(18,8) NOT NULL,
    "stopLoss" DECIMAL(18,8),
    "target" DECIMAL(18,8),
    "quantity" DECIMAL(18,8) NOT NULL,
    "contractSize" DECIMAL(18,8) NOT NULL DEFAULT 1,
    "risk" DECIMAL(18,8),
    "reward" DECIMAL(18,8),
    "rrRatio" DECIMAL(10,4),
    "pnl" DECIMAL(18,8) NOT NULL,
    "setup" "SetupType" NOT NULL,
    "customSetup" TEXT,
    "grade" "TradeGrade" NOT NULL,
    "confidenceBefore" INTEGER NOT NULL,
    "emotionBefore" "Emotion" NOT NULL,
    "followedPlan" BOOLEAN,
    "emotionAfter" "Emotion",
    "confidenceAfter" INTEGER,
    "tradeThesis" TEXT,
    "whyEntered" TEXT,
    "whatWentRight" TEXT,
    "whatWentWrong" TEXT,
    "lessonsLearned" TEXT,
    "screenshotBefore" TEXT,
    "screenshotAfter" TEXT,
    "aiReview" JSONB,
    "aiPsychologyNote" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeMistake" (
    "tradeId" TEXT NOT NULL,
    "mistake" "MistakeType" NOT NULL,

    CONSTRAINT "TradeMistake_pkey" PRIMARY KEY ("tradeId","mistake")
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" TEXT,
    "entryRules" TEXT,
    "exitRules" TEXT,
    "riskRules" TEXT,
    "screenshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AiInsightType" NOT NULL,
    "payload" JSONB NOT NULL,
    "tradeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Trade_userId_date_idx" ON "Trade"("userId", "date");

-- CreateIndex
CREATE INDEX "Trade_userId_setup_idx" ON "Trade"("userId", "setup");

-- CreateIndex
CREATE INDEX "Trade_userId_instrument_idx" ON "Trade"("userId", "instrument");

-- CreateIndex
CREATE INDEX "Trade_userId_session_idx" ON "Trade"("userId", "session");

-- CreateIndex
CREATE INDEX "Trade_userId_dayOfWeek_idx" ON "Trade"("userId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Playbook_userId_idx" ON "Playbook"("userId");

-- CreateIndex
CREATE INDEX "AiInsight_userId_type_idx" ON "AiInsight"("userId", "type");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeMistake" ADD CONSTRAINT "TradeMistake_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playbook" ADD CONSTRAINT "Playbook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
