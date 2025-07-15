import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiCache } from '@/lib/ai-cache';
import { apiUsageTracker } from '@/lib/api-usage-tracker';

// Extend the session user type to include 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const type = searchParams.get('type');

    switch (action) {
      case 'stats':
        const cacheStats = await aiCache.getStats();
        const usageStats = await apiUsageTracker.getRecentUsage(session.user.id);
        const cacheSize = await aiCache.getCacheSize();

        return NextResponse.json({
          cache: {
            ...cacheStats,
            size: cacheSize
          },
          usage: usageStats
        });

      case 'cost-breakdown':
        const costByVideo = await apiUsageTracker.getCostByVideo(session.user.id);
        return NextResponse.json({ costByVideo });

      case 'daily-usage':
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const dailyUsage = await apiUsageTracker.getDailyUsage(
          startDate,
          new Date(),
          session.user.id
        );
        return NextResponse.json({ dailyUsage });

      case 'budget-alert':
        const budget = parseFloat(searchParams.get('budget') || '10'); // $10 default
        const budgetAlert = await apiUsageTracker.checkBudgetAlert(budget, session.user.id);
        return NextResponse.json({ budgetAlert });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cache management API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, type } = await request.json();

    switch (action) {
      case 'clear-expired':
        const expiredCount = await aiCache.clearExpired();
        return NextResponse.json({ 
          message: `Cleared ${expiredCount} expired cache entries`,
          clearedCount: expiredCount
        });

      case 'clear-by-type':
        if (!type) {
          return NextResponse.json({ error: 'Type is required' }, { status: 400 });
        }
        const typeCount = await aiCache.clearByType(type);
        return NextResponse.json({ 
          message: `Cleared ${typeCount} cache entries of type ${type}`,
          clearedCount: typeCount
        });

      case 'clear-all':
        const allCount = await aiCache.clearAll();
        return NextResponse.json({ 
          message: `Cleared ${allCount} cache entries`,
          clearedCount: allCount
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cache management API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
