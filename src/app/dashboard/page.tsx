'use client'

import { useState, useEffect } from 'react'
import { Video, Clock, Search, TrendingUp } from 'lucide-react'
import { SafeDate } from '@/lib/date-utils'

// Mock data for development
const mockStats = {
  totalVideos: 12,
  totalDuration: 1847, // in minutes
  recentSearches: 8,
  highlights: 34
}

const mockRecentVideos = [
  {
    id: '1',
    title: 'Project Standup Meeting - Week 15',
    duration: 1847,
    status: 'COMPLETED',
    createdAt: new Date('2024-01-15'),
    thumbnailPath: null
  },
  {
    id: '2', 
    title: 'Design Review Session',
    duration: 2340,
    status: 'TRANSCRIBING',
    createdAt: new Date('2024-01-14'),
    thumbnailPath: null
  },
  {
    id: '3',
    title: 'Customer Interview - User Feedback',
    duration: 1560,
    status: 'COMPLETED',
    createdAt: new Date('2024-01-13'),
    thumbnailPath: null
  }
]

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'TRANSCRIBING':
      return 'bg-yellow-100 text-yellow-800'
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState(mockStats)
  const [recentVideos, setRecentVideos] = useState(mockRecentVideos)

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your videos.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Video className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Videos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalVideos}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Duration
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatDuration(stats.totalDuration * 60)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Recent Searches
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.recentSearches}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        AI Highlights
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.highlights}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Videos
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your latest uploaded and processed videos
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentVideos.map((video) => (
                <li key={video.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Video className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {video.title}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                            {video.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>{formatDuration(video.duration)}</span>
                          <span className="mx-2">•</span>
                          <SafeDate date={video.createdAt} fallback="Loading..." />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all videos →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
