import { RequestError, TooManyRequestsError } from '../http-errors';
import logger from '../logger';
import { handleError } from './error';

// Przykład użycia

// const response = await fetchHandler('/api/data', {
//   cache: { ttl: 600000, enabled: true }, // 10 min cache
//   retries: 3,
//   retryDelay: 2000,
//   rateLimit: { maxRequests: 10, windowMs: 60000 }, // 10 req/min
//   retryCondition: (error, attempt) => attempt < 2 && error.message.includes('timeout')
// });

type CacheEntry<T> = {
  data: ActionResponse<T>;
  timestamp: number;
  ttl: number;
  key: string;
  url: string;
  hits: number;
};

type CacheStats = {
  totalHits: number;
  totalMisses: number;
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry?: string;
  newestEntry?: string;
  mostHitEntry?: string;
  avgAge?: number;
};

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
  };

  set<T>(key: string, data: ActionResponse<T>, ttl: number, url: string): void {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Caching disabled in development for ${url}`);
      return;
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      url,
      hits: 0,
    });

    this.stats.sets++;
    logger.debug(`Cached ${key} with TTL ${ttl}ms`);
  }

  get<T>(key: string): ActionResponse<T> | null {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      logger.debug(`Cache expired and removed: ${key}`);
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    logger.debug(`Cache hit for ${key} (${entry.hits} total hits)`);

    return entry.data;
  }

  invalidate(pattern: string): number {
    let removed = 0;
    const regex = new RegExp(pattern);

    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(key) || regex.test(entry.url)) {
        this.cache.delete(key);
        removed++;
        this.stats.evictions++;
      }
    }

    logger.info(`Invalidated ${removed} cache entries matching pattern: ${pattern}`);
    return removed;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.evictions += size;
    logger.info(`Cleared all ${size} cache entries`);
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    let oldestEntry: CacheEntry<any> | undefined;
    let newestEntry: CacheEntry<any> | undefined;
    let mostHitEntry: CacheEntry<any> | undefined;
    let totalAge = 0;

    for (const entry of entries) {
      const age = now - entry.timestamp;
      totalAge += age;

      if (!oldestEntry || entry.timestamp < oldestEntry.timestamp) {
        oldestEntry = entry;
      }
      if (!newestEntry || entry.timestamp > newestEntry.timestamp) {
        newestEntry = entry;
      }
      if (!mostHitEntry || entry.hits > mostHitEntry.hits) {
        mostHitEntry = entry;
      }
    }

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    const avgAge = entries.length > 0 ? totalAge / entries.length : 0;

    const memoryUsage = entries.reduce((acc, entry) => {
      return acc + JSON.stringify(entry.data).length + JSON.stringify(entry.key).length;
    }, 0);

    return {
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
      oldestEntry: oldestEntry?.key,
      newestEntry: newestEntry?.key,
      mostHitEntry: mostHitEntry?.key,
      avgAge: Math.round(avgAge),
    };
  }

  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
        this.stats.evictions++;
      }
    }

    if (removed > 0) {
      logger.debug(`Cleaned up ${removed} expired cache entries`);
    }

    return removed;
  }
}

type RateLimitStats = {
  totalRequests: number;
  totalBlocked: number;
  blockRate: number;
  activeWindows: number;
  avgRequestsPerWindow: number;
};

class RateLimiter {
  private requests = new Map<string, number[]>();
  private stats = {
    totalRequests: 0,
    totalBlocked: 0,
  };

  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requestTimes = this.requests.get(key)!;

    const validRequests = requestTimes.filter(time => time > windowStart);
    this.requests.set(key, validRequests);

    this.stats.totalRequests++;

    if (validRequests.length >= maxRequests) {
      this.stats.totalBlocked++;
      logger.warn(`Rate limit exceeded for ${key}: ${validRequests.length}/${maxRequests} requests`);
      return false;
    }

    validRequests.push(now);
    return true;
  }

  getRetryAfter(key: string, maxRequests: number, windowMs: number): number {
    const requestTimes = this.requests.get(key) || [];
    if (requestTimes.length < maxRequests) return 0;

    const oldestRequest = Math.min(...requestTimes);
    return Math.max(0, windowMs - (Date.now() - oldestRequest));
  }

  getStats(): RateLimitStats {
    const totalRequests = this.stats.totalRequests;
    const totalBlocked = this.stats.totalBlocked;
    const blockRate = totalRequests > 0 ? (totalBlocked / totalRequests) * 100 : 0;

    const activeWindows = this.requests.size;
    const totalRequestsInWindows = Array.from(this.requests.values())
      .reduce((acc, requests) => acc + requests.length, 0);
    const avgRequestsPerWindow = activeWindows > 0 ? totalRequestsInWindows / activeWindows : 0;

    return {
      totalRequests,
      totalBlocked,
      blockRate: Math.round(blockRate * 100) / 100,
      activeWindows,
      avgRequestsPerWindow: Math.round(avgRequestsPerWindow * 100) / 100,
    };
  }

  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, requests] of this.requests.entries()) {
      if (requests.length === 0 || Math.max(...requests) < now - 3600000) { // 1 hour old
        this.requests.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.debug(`Cleaned up ${removed} old rate limit windows`);
    }
  }
}

type RequestStats = {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  retriedRequests: number;
  totalRetries: number;
  successRate: number;
  avgResponseTime: number;
  slowestRequest: { url: string; duration: number } | null;
  fastestRequest: { url: string; duration: number } | null;
  errorsByType: Record<string, number>;
  requestsByMethod: Record<string, number>;
};

class RequestTracker {
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    totalRetries: 0,
    responseTimes: [] as number[],
    slowestRequest: null as { url: string; duration: number } | null,
    fastestRequest: null as { url: string; duration: number } | null,
    errorsByType: {} as Record<string, number>,
    requestsByMethod: {} as Record<string, number>,
  };

  trackRequest(method: string = 'GET'): void {
    this.stats.totalRequests++;
    this.stats.requestsByMethod[method] = (this.stats.requestsByMethod[method] || 0) + 1;
  }

  trackSuccess(url: string, duration: number): void {
    this.stats.successfulRequests++;
    this.stats.responseTimes.push(duration);

    if (!this.stats.fastestRequest || duration < this.stats.fastestRequest.duration) {
      this.stats.fastestRequest = { url, duration };
    }

    if (!this.stats.slowestRequest || duration > this.stats.slowestRequest.duration) {
      this.stats.slowestRequest = { url, duration };
    }
  }

  trackError(error: Error, wasRetried: boolean = false): void {
    this.stats.failedRequests++;

    if (wasRetried) {
      this.stats.retriedRequests++;
    }

    const errorType = error.constructor.name;
    this.stats.errorsByType[errorType] = (this.stats.errorsByType[errorType] || 0) + 1;
  }

  trackRetry(): void {
    this.stats.totalRetries++;
  }

  getStats(): RequestStats {
    const totalRequests = this.stats.totalRequests;
    const successRate = totalRequests > 0 ? (this.stats.successfulRequests / totalRequests) * 100 : 0;
    const avgResponseTime = this.stats.responseTimes.length > 0
      ? this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length
      : 0;

    return {
      totalRequests,
      successfulRequests: this.stats.successfulRequests,
      failedRequests: this.stats.failedRequests,
      retriedRequests: this.stats.retriedRequests,
      totalRetries: this.stats.totalRetries,
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      slowestRequest: this.stats.slowestRequest,
      fastestRequest: this.stats.fastestRequest,
      errorsByType: { ...this.stats.errorsByType },
      requestsByMethod: { ...this.stats.requestsByMethod },
    };
  }
}

const cache = new MemoryCache();
const rateLimiter = new RateLimiter();
const requestTracker = new RequestTracker();

setInterval(() => {
  cache.cleanup();
  rateLimiter.cleanup();
}, 300000);

type FetchOptions = RequestInit & {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: Error, attempt: number) => boolean;
  cache?: {
    ttl?: number;
    key?: string;
    enabled?: boolean;
  };
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
    key?: string;
  };
};

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

function generateCacheKey(url: string, options: FetchOptions): string {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  const headers = JSON.stringify(options.headers || {});
  return `${method}:${url}:${body}:${headers}`;
}

function shouldRetry(error: Error, attempt: number, retryCondition?: (error: Error, attempt: number) => boolean): boolean {
  if (retryCondition) {
    return retryCondition(error, attempt);
  }

  if (error.name === 'AbortError') return false;
  if (error instanceof RequestError) {
    return error.statusCode >= 500 || error.statusCode === 429 || error.statusCode === 408;
  }

  return true;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchHandler<T>(url: string, options: FetchOptions = {}): Promise<ActionResponse<T>> {
  const startTime = Date.now();
  const {
    timeout = 5000,
    headers: customHeaders = {},
    retries = 0,
    retryDelay = 1000,
    retryCondition,
    cache: cacheOptions,
    rateLimit,
    ...rest
  } = options;

  const method = options.method || 'GET';
  requestTracker.trackRequest(method);

  const cacheKey = cacheOptions?.key || generateCacheKey(url, options);

  if (cacheOptions?.enabled !== false && method === 'GET') {
    const cachedResponse = cache.get<T>(cacheKey);
    if (cachedResponse) {
      const duration = Date.now() - startTime;
      requestTracker.trackSuccess(url, duration);
      logger.debug(`Cache hit for ${url} (${duration}ms)`);
      return cachedResponse;
    }
  }

  if (rateLimit) {
    const rateLimitKey = rateLimit.key || url;
    if (!rateLimiter.canMakeRequest(rateLimitKey, rateLimit.maxRequests, rateLimit.windowMs)) {
      const retryAfter = rateLimiter.getRetryAfter(rateLimitKey, rateLimit.maxRequests, rateLimit.windowMs);
      const error = new TooManyRequestsError(`Rate limit exceeded. Retry after ${retryAfter}ms`, retryAfter);
      requestTracker.trackError(error);
      logger.warn(`Rate limit exceeded for ${url}. Retry after ${retryAfter}ms`);
      return handleError(error) as ActionResponse<T>;
    }
  }

  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const headers = {
    ...defaultHeaders,
    ...customHeaders,
  };

  const config: RequestInit = {
    ...rest,
    headers,
    signal: controller.signal,
  };

  let lastError: Error;
  let wasRetried = false;

  for (let attempt = 0; attempt <= retries; attempt++) {
    timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (attempt > 0) {
        requestTracker.trackRetry();
        wasRetried = true;
      }

      logger.debug(`Attempt ${attempt + 1}/${retries + 1} for ${method} ${url}`);

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new RequestError(response.status, `HTTP error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      requestTracker.trackSuccess(url, duration);

      if (cacheOptions?.enabled !== false && method === 'GET') {
        const ttl = cacheOptions?.ttl || 300000;
        cache.set(cacheKey, result, ttl, url);
      }

      logger.info(`${method} ${url} completed successfully in ${duration}ms (attempt ${attempt + 1})`);
      return result;
    } catch (err) {
      const error = isError(err) ? err : new Error('Failed to fetch');
      lastError = error;

      const duration = Date.now() - startTime;
      if (error.name === 'AbortError') {
        logger.warn(`${method} ${url} timed out after ${duration}ms (attempt ${attempt + 1})`);
      } else {
        logger.error(`${method} ${url} failed after ${duration}ms (attempt ${attempt + 1}): ${error.message}`);
      }

      if (attempt < retries && shouldRetry(error, attempt + 1, retryCondition)) {
        const backoffDelay = retryDelay * 2 ** attempt + Math.random() * 1000;
        logger.debug(`Retrying ${method} ${url} in ${Math.round(backoffDelay)}ms`);
        await delay(backoffDelay);

        const newController = new AbortController();
        config.signal = newController.signal;
        clearTimeout(timeoutId);

        continue;
      }

      break;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  requestTracker.trackError(lastError!, wasRetried);
  const totalDuration = Date.now() - startTime;
  logger.error(`${method} ${url} failed after all retry attempts (${totalDuration}ms total)`);
  return handleError(lastError!) as ActionResponse<T>;
}

type ComprehensiveStats = {
  cache: CacheStats;
  rateLimit: RateLimitStats;
  requests: RequestStats;
  environment: {
    nodeEnv: string;
    cacheEnabled: boolean;
    uptime: number;
  };
};

export const fetchUtils = {
  cache: {
    clear: () => cache.clear(),
    invalidate: (pattern: string) => cache.invalidate(pattern),
    cleanup: () => cache.cleanup(),
    getStats: () => cache.getStats(),
  },

  rateLimit: {
    cleanup: () => rateLimiter.cleanup(),
    getStats: () => rateLimiter.getStats(),
  },

  requests: {
    getStats: () => requestTracker.getStats(),
  },

  getAllStats: (): ComprehensiveStats => ({
    cache: cache.getStats(),
    rateLimit: rateLimiter.getStats(),
    requests: requestTracker.getStats(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      cacheEnabled: process.env.NODE_ENV !== 'development',
      uptime: process.uptime(),
    },
  }),

  printStats: (): void => {
    const stats = fetchUtils.getAllStats();

    logger.info('\n📊 Fetch Handler Statistics');
    logger.info('═'.repeat(50));

    logger.info('\n🚀 Request Statistics:');
    logger.info(`  Total Requests: ${stats.requests.totalRequests}`);
    logger.info(`  Success Rate: ${stats.requests.successRate}%`);
    logger.info(`  Failed Requests: ${stats.requests.failedRequests}`);
    logger.info(`  Retried Requests: ${stats.requests.retriedRequests}`);
    logger.info(`  Total Retries: ${stats.requests.totalRetries}`);
    logger.info(`  Avg Response Time: ${stats.requests.avgResponseTime}ms`);

    if (stats.requests.fastestRequest) {
      logger.info(`  Fastest Request: ${stats.requests.fastestRequest.url} (${stats.requests.fastestRequest.duration}ms)`);
    }
    if (stats.requests.slowestRequest) {
      logger.info(`  Slowest Request: ${stats.requests.slowestRequest.url} (${stats.requests.slowestRequest.duration}ms)`);
    }

    logger.info('\n💾 Cache Statistics:');
    logger.info(`  Cache Enabled: ${stats.environment.cacheEnabled ? '✅' : '❌'}`);
    logger.info(`  Total Entries: ${stats.cache.totalEntries}`);
    logger.info(`  Hit Rate: ${stats.cache.hitRate}%`);
    logger.info(`  Total Hits: ${stats.cache.totalHits}`);
    logger.info(`  Total Misses: ${stats.cache.totalMisses}`);
    logger.info(`  Memory Usage: ${(stats.cache.memoryUsage / 1024).toFixed(2)} KB`);

    logger.info('\n🚧 Rate Limit Statistics:');
    logger.info(`  Total Requests: ${stats.rateLimit.totalRequests}`);
    logger.info(`  Blocked Requests: ${stats.rateLimit.totalBlocked}`);
    logger.info(`  Block Rate: ${stats.rateLimit.blockRate}%`);
    logger.info(`  Active Windows: ${stats.rateLimit.activeWindows}`);

    logger.info('\n⚙️  Environment:');
    logger.info(`  Node Environment: ${stats.environment.nodeEnv}`);
    logger.info(`  Uptime: ${Math.round(stats.environment.uptime)}s`);

    if (Object.keys(stats.requests.errorsByType).length > 0) {
      logger.info('\n❌ Error Breakdown:');
      Object.entries(stats.requests.errorsByType).forEach(([errorType, count]) => {
        logger.info(`  ${errorType}: ${count}`);
      });
    }

    if (Object.keys(stats.requests.requestsByMethod).length > 0) {
      logger.info('\n🔄 Requests by Method:');
      Object.entries(stats.requests.requestsByMethod).forEach(([method, count]) => {
        logger.info(`  ${method}: ${count}`);
      });
    }

    logger.info(`\n${'═'.repeat(50)}`);
  },

  logDetailedStats: (): void => {
    const stats = fetchUtils.getAllStats();

    logger.info('Detailed fetch handler statistics', {
      cache: stats.cache,
      rateLimit: stats.rateLimit,
      requests: stats.requests,
      environment: stats.environment,
    });
  },

  getStatsForMonitoring: () => {
    const stats = fetchUtils.getAllStats();

    return {
      ...stats,
      timestamp: new Date().toISOString(),
      metrics: {
        cache_hit_rate: stats.cache.hitRate,
        request_success_rate: stats.requests.successRate,
        rate_limit_block_rate: stats.rateLimit.blockRate,
        avg_response_time_ms: stats.requests.avgResponseTime,
        active_cache_entries: stats.cache.totalEntries,
        memory_usage_kb: Math.round(stats.cache.memoryUsage / 1024),
      },
    };
  },
};

export { type ComprehensiveStats };
