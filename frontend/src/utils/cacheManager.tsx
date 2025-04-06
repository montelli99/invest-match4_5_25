import { useEffect, useState } from "react";
import { InvestorProfile, SearchFilters } from "types";

interface CacheEntry {
  data: InvestorProfile[];
  timestamp: number;
  filters: SearchFilters;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  size: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry>;
  private metrics: CacheMetrics;

  private constructor() {
    this.cache = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      size: 0,
    };
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private generateKey(filters: SearchFilters): string {
    return JSON.stringify(filters);
  }

  public get(filters: SearchFilters): InvestorProfile[] | null {
    const key = this.generateKey(filters);
    const entry = this.cache.get(key);

    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.metrics.size = this.cache.size;
      return null;
    }

    this.metrics.hits++;
    return entry.data;
  }

  public set(filters: SearchFilters, data: InvestorProfile[]): void {
    const key = this.generateKey(filters);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      filters,
    });
    this.metrics.size = this.cache.size;
  }

  public clear(): void {
    this.cache.clear();
    this.metrics.size = 0;
  }

  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }
}

// React hook for cache metrics
export const useCacheMetrics = () => {
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hits: 0,
    misses: 0,
    size: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(CacheManager.getInstance().getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};
