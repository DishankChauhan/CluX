'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CacheStats {
  cache: {
    byType: Array<{ type: string; _count: number }>;
    total: number;
    hitRate: number;
    estimatedSavings: number;
    size: {
      entries: number;
      estimatedSizeMB: number;
    };
  };
  usage: {
    totalCost: number;
    totalRequests: number;
    byType: Array<{ type: string; requests: number; cost: number }>;
    cacheHitRate: number;
    periodSavings: number;
  };
}

export default function CacheManagement() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache?action=stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (action: string, type?: string) => {
    setActionLoading(action);
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, type }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <p className="text-gray-500">Failed to load cache statistics</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.cache.estimatedSavings)}
          </div>
          <div className="text-sm text-gray-500">Total Savings</div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {stats.cache.hitRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Cache Hit Rate</div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {stats.cache.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Cached Responses</div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.usage.totalCost)}
          </div>
          <div className="text-sm text-gray-500">Total API Cost (30d)</div>
        </div>
      </div>

      {/* Cache Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Cache Breakdown by Type</h3>
        <div className="space-y-3">
          {stats.cache.byType.map((item) => (
            <div key={item.type} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">
                  {item.type}
                </Badge>
                <span className="text-sm text-gray-600">
                  {item._count.toLocaleString()} entries
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCache('clear-by-type', item.type)}
                disabled={actionLoading === 'clear-by-type'}
              >
                {actionLoading === 'clear-by-type' ? 'Clearing...' : 'Clear'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">API Usage Breakdown (Last 30 Days)</h3>
        <div className="space-y-3">
          {stats.usage.byType.map((item) => (
            <div key={item.type} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">
                  {item.type}
                </Badge>
                <span className="text-sm text-gray-600">
                  {item.requests.toLocaleString()} requests
                </span>
              </div>
              <span className="font-semibold">
                {formatCurrency(item.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cache Management Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Cache Management</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => clearCache('clear-expired')}
            disabled={actionLoading === 'clear-expired'}
          >
            {actionLoading === 'clear-expired' ? 'Clearing...' : 'Clear Expired'}
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Stats'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to clear all cache? This will increase API costs for future requests.')) {
                clearCache('clear-all');
              }
            }}
            disabled={actionLoading === 'clear-all'}
          >
            {actionLoading === 'clear-all' ? 'Clearing...' : 'Clear All Cache'}
          </Button>
        </div>
      </div>

      {/* Cache Size Info */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Storage Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-semibold">
              {stats.cache.size.entries.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Cache Entries</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {stats.cache.size.estimatedSizeMB.toFixed(1)} MB
            </div>
            <div className="text-sm text-gray-500">Estimated Cache Size</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Optimization Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cache hit rate above 70% is excellent for cost savings</li>
          <li>• Transcription cache entries are most valuable to keep (expensive to regenerate)</li>
          <li>• Clear expired entries regularly to keep cache size manageable</li>
          <li>• Monitor your monthly API budget to avoid overages</li>
        </ul>
      </div>
    </div>
  );
}
