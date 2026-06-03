import { kv } from "@vercel/kv";
import type { RateLimitResult } from "./types";

const COOLDOWN_SECONDS = 10;
const DAILY_GLOBAL_CAP = 100;

function getDailyKey(): string {
  return `studio:rate:global:${new Date().toISOString().slice(0, 10)}`;
}

function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const ipKey = `studio:rate:ip:${ip}`;
  const dailyKey = getDailyKey();

  const [ipTtl, dailyCount] = await Promise.all([
    kv.ttl(ipKey),
    kv.get<number>(dailyKey),
  ]);

  if (ipTtl > 0) {
    return { allowed: false, waitSeconds: ipTtl };
  }

  if (dailyCount !== null && dailyCount >= DAILY_GLOBAL_CAP) {
    return { allowed: false, waitSeconds: 0 };
  }

  await Promise.all([
    kv.set(ipKey, 1, { ex: COOLDOWN_SECONDS }),
    kv.incr(dailyKey),
  ]);

  if (dailyCount === null) {
    await kv.expire(dailyKey, secondsUntilMidnight());
  }

  return { allowed: true, waitSeconds: 0 };
}
