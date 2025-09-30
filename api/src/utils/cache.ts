import type { IssueManagementResponse } from "../types";

export interface CacheEntry {
  timestamp: number;
  expiresAt: number;
  data: IssueManagementResponse;
}

export interface CacheOptions {
  ttlHours?: number;
}

/**
 * Generate a cache key for a repository
 */
export function generateCacheKey(owner: string, repo: string): string {
  return `repo:${owner.toLowerCase()}:${repo.toLowerCase()}`;
}

export async function getCachedAnalysis(
  kv: KVNamespace,
  owner: string,
  repo: string
): Promise<IssueManagementResponse | null> {
  try {
    const cacheKey = generateCacheKey(owner, repo);
    const cached = await kv.get<CacheEntry>(cacheKey, "json");

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now > cached.expiresAt) {
      await kv.delete(cacheKey);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

export async function setCachedAnalysis(
  kv: KVNamespace,
  owner: string,
  repo: string,
  data: IssueManagementResponse,
  options: CacheOptions = {}
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(owner, repo);
    const now = Date.now();
    const ttlHours = options.ttlHours || 24;
    const expiresAt = now + ttlHours * 60 * 60 * 1000;

    const cacheEntry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt,
    };

    await kv.put(cacheKey, JSON.stringify(cacheEntry), {
      expirationTtl: ttlHours * 60 * 60,
    });
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}
