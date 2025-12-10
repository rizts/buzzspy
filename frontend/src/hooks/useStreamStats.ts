import { useState, useCallback } from 'react';
import type { Tweet, BuzzerDetection, SystemMetrics } from '../types';

interface StreamStats {
  totalTweets: number;
  totalBuzzers: number;
  buzzerRate: number;
  latestMetrics: SystemMetrics | null;
}

export function useStreamStats() {
  const [stats, setStats] = useState<StreamStats>({
    totalTweets: 0,
    totalBuzzers: 0,
    buzzerRate: 0,
    latestMetrics: null,
  });

  const onTweet = useCallback((_tweet: Tweet) => {
    setStats((prev) => ({
      ...prev,
      totalTweets: prev.totalTweets + 1,
    }));
  }, []);

  const onBuzzerAlert = useCallback((_detection: BuzzerDetection) => {
    setStats((prev) => {
      const totalBuzzers = prev.totalBuzzers + 1;
      const buzzerRate = prev.totalTweets > 0 
        ? (totalBuzzers / prev.totalTweets) * 100 
        : 0;
      
      return {
        ...prev,
        totalBuzzers,
        buzzerRate,
      };
    });
  }, []);

  const onMetrics = useCallback((metrics: SystemMetrics) => {
    setStats((prev) => ({
      ...prev,
      latestMetrics: metrics,
    }));
  }, []);

  const reset = useCallback(() => {
    setStats({
      totalTweets: 0,
      totalBuzzers: 0,
      buzzerRate: 0,
      latestMetrics: null,
    });
  }, []);

  return {
    stats,
    onTweet,
    onBuzzerAlert,
    onMetrics,
    reset,
  };
}