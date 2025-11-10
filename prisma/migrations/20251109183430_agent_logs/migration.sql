-- CreateTable
CREATE TABLE "agent_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "agentName" TEXT NOT NULL,
    "model" TEXT,
    "input" JSONB,
    "output" JSONB,
    "latencyMs" INTEGER,
    "tokensUsed" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_logs_userId_idx" ON "agent_logs"("userId");

-- CreateIndex
CREATE INDEX "agent_logs_agentName_idx" ON "agent_logs"("agentName");

-- CreateIndex
CREATE INDEX "agent_logs_timestamp_idx" ON "agent_logs"("timestamp");
