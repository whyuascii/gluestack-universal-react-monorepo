/**
 * Cache Provider Abstraction
 *
 * In-memory LRU cache with interface designed for easy Redis migration.
 * Currently uses Map-based implementation, can be swapped to Redis later.
 *
 * Usage:
 *   const cache = getCache();
 *   await cache.set('key', value, 60); // TTL in seconds
 *   const value = await cache.get<MyType>('key');
 */

/**
 * Cache provider interface - designed for Redis compatibility
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null = no expiration
}

/**
 * In-memory LRU cache implementation
 *
 * Features:
 * - TTL support (time-to-live in seconds)
 * - Max size with LRU eviction
 * - Async interface (Redis-compatible)
 */
class InMemoryCache implements CacheProvider {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    };

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache stats (for monitoring)
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

/**
 * Singleton cache instance
 *
 * To migrate to Redis later:
 * 1. Create RedisCache class implementing CacheProvider
 * 2. Change this to return RedisCache instance based on env
 */
let cacheInstance: InMemoryCache | null = null;

export function getCache(): CacheProvider {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCache(1000);
  }
  return cacheInstance;
}

/**
 * Get cache stats (only available for in-memory cache)
 */
export function getCacheStats() {
  if (cacheInstance) {
    return cacheInstance.getStats();
  }
  return null;
}

/**
 * Cache key builders for consistent key naming
 *
 * Pattern: domain:entity:id or domain:entity:id:subresource
 */
export const cacheKeys = {
  openapi: () => "openapi:spec",
  user: (userId: string) => `user:${userId}`,
  userTenant: (userId: string, tenantId: string) => `user:${userId}:tenant:${tenantId}`,
  dashboard: (tenantId: string) => `dashboard:${tenantId}`,
  settings: (userId: string) => `settings:${userId}`,
} as const;
