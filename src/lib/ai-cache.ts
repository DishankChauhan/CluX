import crypto from 'crypto';
import { prisma } from './prisma';

export interface CacheStats {
  byType: Array<{ type: string; _count: number }>;
  total: number;
  hitRate: number;
  estimatedSavings: number;
}

export interface CostSavings {
  transcription: number;
  highlights: number;
  embeddings: number;
  total: number;
}

/**
 * AI Response Caching Service
 * Reduces OpenAI API costs by caching responses
 */
class AICacheService {
  /**
   * Generate a hash for input content and model
   */
  private generateHash(content: string, model: string): string {
    return crypto
      .createHash('sha256')
      .update(`${model}:${content}`)
      .digest('hex');
  }

  /**
   * Get cached response if available
   */
  async get<T>(
    type: string,
    content: string,
    model: string
  ): Promise<T | null> {
    try {
      const hash = this.generateHash(content, model);
      
      const cached = await prisma.aICache.findUnique({
        where: { inputHash: hash },
      });

      if (!cached) {
        return null;
      }
      
      // Check expiration
      if (cached.expiresAt && cached.expiresAt < new Date()) {
        await this.delete(hash);
        return null;
      }

      // Increment hit count
      await prisma.aICache.update({
        where: { inputHash: hash },
        data: { hitCount: { increment: 1 } }
      });

      console.log(`Cache hit for ${type} (${model})`);
      return cached.response as T;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Store response in cache
   */
  async set<T>(
    type: string,
    content: string,
    model: string,
    response: T,
    expirationDays?: number,
    inputSize?: number,
    outputSize?: number
  ): Promise<void> {
    try {
      const hash = this.generateHash(content, model);
      const expiresAt = expirationDays 
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
        : null;

      await prisma.aICache.upsert({
        where: { inputHash: hash },
        create: {
          type,
          inputHash: hash,
          response: response as any,
          model,
          inputSize,
          outputSize,
          expiresAt,
        },
        update: {
          response: response as any,
          inputSize,
          outputSize,
          expiresAt,
          updatedAt: new Date(),
        },
      });

      console.log(`Cached ${type} response (${model})`);
    } catch (error) {
      console.error('Cache storage error:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(hash: string): Promise<void> {
    try {
      await prisma.aICache.delete({
        where: { inputHash: hash },
      });
    } catch (error) {
      console.error('Cache deletion error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const [byType, total, totalUsage] = await Promise.all([
        prisma.aICache.groupBy({
          by: ['type'],
          _count: { id: true },
        }),
        prisma.aICache.count(),
        prisma.aPIUsage.aggregate({
          _count: { id: true },
          _sum: { estimatedCost: true }
        })
      ]);

      const cacheUsage = await prisma.aICache.aggregate({
        _sum: { hitCount: true }
      });

      const totalRequests = (totalUsage._count.id || 0) + (cacheUsage._sum.hitCount || 0);
      const hitRate = totalRequests > 0 
        ? ((cacheUsage._sum.hitCount || 0) / totalRequests) * 100 
        : 0;

      const estimatedSavings = await this.estimateCostSavings();

      return {
        byType: byType.map(item => ({ 
          type: item.type, 
          _count: item._count.id 
        })),
        total,
        hitRate,
        estimatedSavings: estimatedSavings.total
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        byType: [],
        total: 0,
        hitRate: 0,
        estimatedSavings: 0
      };
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<number> {
    try {
      const result = await prisma.aICache.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });
      
      console.log(`Cleared ${result.count} expired cache entries`);
      return result.count;
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      return 0;
    }
  }

  /**
   * Clear cache by type
   */
  async clearByType(type: string): Promise<number> {
    try {
      const result = await prisma.aICache.deleteMany({
        where: { type }
      });
      
      console.log(`Cleared ${result.count} cache entries of type: ${type}`);
      return result.count;
    } catch (error) {
      console.error(`Error clearing cache for type ${type}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<number> {
    try {
      const result = await prisma.aICache.deleteMany({});
      
      console.log(`Cleared ${result.count} cache entries`);
      return result.count;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return 0;
    }
  }

  /**
   * Estimate cost savings from caching
   */
  async estimateCostSavings(): Promise<CostSavings> {
    try {
      const cacheStats = await prisma.aICache.groupBy({
        by: ['type'],
        _sum: { hitCount: true },
      });

      // Cost estimates per cache hit (approximate)
      const costPerHit = {
        transcription: 0.03,  // ~$0.03 per cached transcription (10min audio)
        highlights: 0.002,    // ~$0.002 per cached highlight generation
        embeddings: 0.001,    // ~$0.001 per cached embedding
        summary: 0.001,       // ~$0.001 per cached summary
      };

      let savings: CostSavings = {
        transcription: 0,
        highlights: 0,
        embeddings: 0,
        total: 0
      };

      for (const stat of cacheStats) {
        const hits = stat._sum.hitCount || 0;
        const cost = (costPerHit[stat.type as keyof typeof costPerHit] || 0) * hits;
        
        if (stat.type in savings) {
          savings[stat.type as keyof CostSavings] = cost;
        }
        savings.total += cost;
      }

      return savings;
    } catch (error) {
      console.error('Error estimating cost savings:', error);
      return {
        transcription: 0,
        highlights: 0,
        embeddings: 0,
        total: 0
      };
    }
  }

  /**
   * Get cache entry count by type
   */
  async getCountByType(type: string): Promise<number> {
    try {
      return await prisma.aICache.count({
        where: { type }
      });
    } catch (error) {
      console.error(`Error getting count for type ${type}:`, error);
      return 0;
    }
  }

  /**
   * Get total cache size (approximate)
   */
  async getCacheSize(): Promise<{ entries: number; estimatedSizeMB: number }> {
    try {
      const [entries, sizeData] = await Promise.all([
        prisma.aICache.count(),
        prisma.aICache.aggregate({
          _sum: { 
            inputSize: true, 
            outputSize: true 
          }
        })
      ]);

      const totalBytes = (sizeData._sum.inputSize || 0) + (sizeData._sum.outputSize || 0);
      const estimatedSizeMB = totalBytes / (1024 * 1024);

      return { entries, estimatedSizeMB };
    } catch (error) {
      console.error('Error getting cache size:', error);
      return { entries: 0, estimatedSizeMB: 0 };
    }
  }
}

export const aiCache = new AICacheService();
