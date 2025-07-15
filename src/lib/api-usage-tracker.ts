import { prisma } from './prisma';

export interface UsageStats {
  totalCost: number;
  totalRequests: number;
  byType: Array<{
    type: string;
    requests: number;
    cost: number;
  }>;
  byModel: Array<{
    model: string;
    requests: number;
    cost: number;
  }>;
  cacheHitRate: number;
  periodSavings: number;
}

/**
 * API Usage Tracking Service
 * Monitors OpenAI API usage and costs
 */
class APIUsageTracker {
  // Cost rates (as of January 2024 - update these based on current OpenAI pricing)
  private readonly COST_RATES = {
    // Whisper Audio
    'whisper-1': {
      perMinute: 0.006 // $0.006 per minute
    },
    // GPT-4o-mini
    'gpt-4o-mini': {
      inputPer1K: 0.00015,  // $0.15 per 1M tokens
      outputPer1K: 0.0006   // $0.60 per 1M tokens
    },
    // Text Embeddings
    'text-embedding-3-small': {
      inputPer1K: 0.00002   // $0.02 per 1M tokens
    },
    'text-embedding-3-large': {
      inputPer1K: 0.00013   // $0.13 per 1M tokens
    }
  } as const;

  /**
   * Calculate cost for API usage
   */
  private calculateCost(
    type: string,
    model: string,
    inputTokens?: number,
    outputTokens?: number,
    inputMinutes?: number
  ): number {
    const rates = this.COST_RATES[model as keyof typeof this.COST_RATES];
    if (!rates) return 0;

    if (type === 'transcription' && inputMinutes && 'perMinute' in rates) {
      return inputMinutes * rates.perMinute;
    }

    if ((type === 'completion' || type === 'embedding') && 'inputPer1K' in rates) {
      let cost = 0;
      
      if (inputTokens) {
        cost += (inputTokens / 1000) * rates.inputPer1K;
      }
      
      if (outputTokens && 'outputPer1K' in rates) {
        cost += (outputTokens / 1000) * rates.outputPer1K;
      }
      
      return cost;
    }

    return 0;
  }

  /**
   * Track API usage
   */
  async trackUsage(params: {
    type: 'transcription' | 'completion' | 'embedding';
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    inputMinutes?: number;
    cached?: boolean;
    videoId?: string;
    userId?: string;
  }): Promise<void> {
    try {
      const estimatedCost = this.calculateCost(
        params.type,
        params.model,
        params.inputTokens,
        params.outputTokens,
        params.inputMinutes
      );

      await prisma.aPIUsage.create({
        data: {
          type: params.type,
          model: params.model,
          inputTokens: params.inputTokens,
          outputTokens: params.outputTokens,
          inputMinutes: params.inputMinutes,
          estimatedCost,
          cached: params.cached || false,
          videoId: params.videoId,
          userId: params.userId,
        }
      });

      console.log(`Tracked ${params.type} usage: $${estimatedCost.toFixed(4)} (cached: ${params.cached})`);
    } catch (error) {
      console.error('Error tracking API usage:', error);
      // Don't throw - tracking is optional
    }
  }

  /**
   * Get usage statistics for a time period
   */
  async getUsageStats(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<UsageStats> {
    try {
      const whereClause: any = {};
      
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp.gte = startDate;
        if (endDate) whereClause.timestamp.lte = endDate;
      }
      
      if (userId) {
        whereClause.userId = userId;
      }

      const [totalStats, byType, byModel, cacheStats] = await Promise.all([
        // Total cost and requests
        prisma.aPIUsage.aggregate({
          where: whereClause,
          _count: { id: true },
          _sum: { estimatedCost: true }
        }),
        
        // By type
        prisma.aPIUsage.groupBy({
          by: ['type'],
          where: whereClause,
          _count: { id: true },
          _sum: { estimatedCost: true }
        }),
        
        // By model
        prisma.aPIUsage.groupBy({
          by: ['model'],
          where: whereClause,
          _count: { id: true },
          _sum: { estimatedCost: true }
        }),
        
        // Cache statistics
        prisma.aPIUsage.groupBy({
          by: ['cached'],
          where: whereClause,
          _count: { id: true },
          _sum: { estimatedCost: true }
        })
      ]);

      const totalRequests = totalStats._count.id || 0;
      const cachedRequests = cacheStats.find(s => s.cached)?._count.id || 0;
      const cacheHitRate = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0;

      const nonCachedCost = cacheStats.find(s => !s.cached)?._sum.estimatedCost || 0;
      const cachedOriginalCost = this.estimateCachedOriginalCost(cachedRequests);
      const periodSavings = cachedOriginalCost;

      return {
        totalCost: totalStats._sum.estimatedCost || 0,
        totalRequests,
        byType: byType.map(item => ({
          type: item.type,
          requests: item._count.id,
          cost: item._sum.estimatedCost || 0
        })),
        byModel: byModel.map(item => ({
          model: item.model,
          requests: item._count.id,
          cost: item._sum.estimatedCost || 0
        })),
        cacheHitRate,
        periodSavings
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        totalCost: 0,
        totalRequests: 0,
        byType: [],
        byModel: [],
        cacheHitRate: 0,
        periodSavings: 0
      };
    }
  }

  /**
   * Estimate what cached requests would have cost
   */
  private estimateCachedOriginalCost(cachedRequests: number): number {
    // Rough estimate - average cost per request
    const avgCostPerRequest = 0.01; // $0.01 average
    return cachedRequests * avgCostPerRequest;
  }

  /**
   * Get cost breakdown by video
   */
  async getCostByVideo(userId?: string): Promise<Array<{
    videoId: string;
    videoTitle: string;
    totalCost: number;
    requests: number;
  }>> {
    try {
      const whereClause: any = { videoId: { not: null } };
      if (userId) whereClause.userId = userId;

      const videoUsage = await prisma.aPIUsage.groupBy({
        by: ['videoId'],
        where: whereClause,
        _count: { id: true },
        _sum: { estimatedCost: true }
      });

      // Get video titles
      const videoIds = videoUsage
        .map(v => v.videoId)
        .filter((id): id is string => id !== null);

      const videos = await prisma.video.findMany({
        where: { id: { in: videoIds } },
        select: { id: true, title: true }
      });

      const videoMap = new Map(videos.map(v => [v.id, v.title]));

      return videoUsage
        .filter(v => v.videoId)
        .map(v => ({
          videoId: v.videoId!,
          videoTitle: videoMap.get(v.videoId!) || 'Unknown Video',
          totalCost: v._sum.estimatedCost || 0,
          requests: v._count.id
        }))
        .sort((a, b) => b.totalCost - a.totalCost);
    } catch (error) {
      console.error('Error getting cost by video:', error);
      return [];
    }
  }

  /**
   * Get recent usage (last 30 days)
   */
  async getRecentUsage(userId?: string): Promise<UsageStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.getUsageStats(thirtyDaysAgo, new Date(), userId);
  }

  /**
   * Get daily usage for chart visualization
   */
  async getDailyUsage(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<Array<{
    date: string;
    cost: number;
    requests: number;
    cached: number;
  }>> {
    try {
      const whereClause: any = {
        timestamp: { gte: startDate, lte: endDate }
      };
      if (userId) whereClause.userId = userId;

      const dailyUsage = await prisma.aPIUsage.groupBy({
        by: ['timestamp', 'cached'],
        where: whereClause,
        _count: { id: true },
        _sum: { estimatedCost: true }
      });

      // Group by date
      const dateMap = new Map<string, {
        cost: number;
        requests: number;
        cached: number;
      }>();

      for (const usage of dailyUsage) {
        const date = usage.timestamp.toISOString().split('T')[0];
        const existing = dateMap.get(date) || { cost: 0, requests: 0, cached: 0 };
        
        existing.cost += usage._sum.estimatedCost || 0;
        existing.requests += usage._count.id;
        if (usage.cached) {
          existing.cached += usage._count.id;
        }
        
        dateMap.set(date, existing);
      }

      return Array.from(dateMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting daily usage:', error);
      return [];
    }
  }

  /**
   * Set budget alert threshold
   */
  async checkBudgetAlert(
    monthlyBudget: number,
    userId?: string
  ): Promise<{
    currentSpend: number;
    budget: number;
    percentUsed: number;
    alertLevel: 'low' | 'medium' | 'high' | 'exceeded';
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await this.getUsageStats(startOfMonth, new Date(), userId);
    const currentSpend = monthlyStats.totalCost;
    const percentUsed = (currentSpend / monthlyBudget) * 100;

    let alertLevel: 'low' | 'medium' | 'high' | 'exceeded' = 'low';
    if (percentUsed >= 100) alertLevel = 'exceeded';
    else if (percentUsed >= 80) alertLevel = 'high';
    else if (percentUsed >= 60) alertLevel = 'medium';

    return {
      currentSpend,
      budget: monthlyBudget,
      percentUsed,
      alertLevel
    };
  }
}

export const apiUsageTracker = new APIUsageTracker();
