import type { RateLimitResult } from "./types";

const COOLDOWN_MS = 10_000;
const DAILY_GLOBAL_CAP = 100;

interface IpEntry {
  unlocksAt: number;
}

const ipMap = new Map<string, IpEntry>();
const dailyCount = { date: "", count: 0 };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyCount(): number {
  const today = todayKey();
  if (dailyCount.date !== today) {
    dailyCount.date = today;
    dailyCount.count = 0;
  }
  return dailyCount.count;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();

  const entry = ipMap.get(ip);
  if (entry && entry.unlocksAt > now) {
    const waitSeconds = Math.ceil((entry.unlocksAt - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (getDailyCount() >= DAILY_GLOBAL_CAP) {
    return { allowed: false, waitSeconds: 0 };
  }

  ipMap.set(ip, { unlocksAt: now + COOLDOWN_MS });
  dailyCount.count += 1;

  return { allowed: true, waitSeconds: 0 };
}
