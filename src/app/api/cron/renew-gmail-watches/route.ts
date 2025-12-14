/**
 * Cron endpoint to auto-renew Gmail watch subscriptions
 *
 * Call this daily via:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron service (cron-job.org, EasyCron)
 */

import { NextRequest, NextResponse } from "next/server";
import { renewExpiringWatches } from "@/lib/gmail-watch-renewal";

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting Gmail watch renewal check");

    const results = await renewExpiringWatches();

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`[Cron] Completed: ${successful} renewed, ${failed} failed`);

    return NextResponse.json({
      success: true,
      renewed: successful,
      failed: failed,
      results: results,
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json(
      {
        error: "Renewal check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
