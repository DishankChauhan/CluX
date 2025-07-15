"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, PlayIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import VideoPlayer from "@/components/VideoPlayer";
import { cn } from "@/lib/utils";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "glow" | "outline";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  mockupContent?: React.ReactNode;
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  mockupContent,
}: HeroProps) {
  const defaultMockupContent = (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg h-full flex border border-slate-200 dark:border-slate-700">
      {/* Main Dashboard Content */}
      <div className="flex-1 p-8 lg:p-12 flex flex-col">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's what's happening with your videos.</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Videos</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Duration</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">30h 47m</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Searches</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <div className="w-4 h-4 bg-orange-600 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Highlights</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">34</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Videos Section - Takes remaining space */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Videos</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Your latest uploaded and processed videos</p>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-700 flex-1">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <PlayIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Project Standup Meeting - Week 15</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>30m 47s</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">COMPLETED</span>
                  </div>
                </div>
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View</button>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <PlayIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Design Review Session</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>39m</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">TRANSCRIBING</span>
                  </div>
                </div>
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View</button>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <PlayIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Customer Interview - User Feedback</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>26m</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">COMPLETED</span>
                  </div>
                </div>
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View</button>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg mt-auto">
            <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
              View all videos →
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - AI Features Panel */}
      <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col">
        {/* AI Search Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            AI Search
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Search: "budget discussion"</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-500">Found in 3 videos:</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">• Project Meeting (3:45-4:20)</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">• Q4 Planning (12:15-13:02)</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">• Team Sync (8:30-9:15)</div>
            </div>
          </div>
        </div>
        
        {/* AI Highlights Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Smart Highlights
          </h3>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Key Decision</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">"Let's allocate 40% budget to user acquisition"</p>
              <span className="text-xs text-blue-500">Project Meeting • 3:45</span>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Action Item</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">"Sarah to implement search improvements by Friday"</p>
              <span className="text-xs text-purple-500">Design Review • 1:23</span>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Achievement</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">"15% improvement in transcription accuracy"</p>
              <span className="text-xs text-green-500">Team Sync • 2:10</span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-auto">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2">
              <PlayIcon className="h-4 w-4" />
              Upload New Video
            </button>
            <button className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Advanced Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-8 sm:py-16 md:py-24",
        "fade-bottom overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex w-full flex-col gap-8 pt-12 sm:gap-16 max-w-none">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-8 px-4">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2 opacity-0">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl opacity-0 sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant} size="lg" asChild>
                <a href={action.href} className="flex items-center gap-2">
                  {action.icon}
                  {action.text}
                </a>
              </Button>
            ))}
          </div>

          {/* Image with Glow */}
          <div className="relative pt-12 w-full px-4 sm:px-6 lg:px-8">
            {/* Background Glow - Behind the mockup */}
            <div className="absolute inset-0 top-12 -z-10">
              {/* Multiple layers for depth */}
              <div className="absolute inset-2 rounded-2xl bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-cyan-500/15 blur-3xl opacity-80"></div>
              <div className="absolute inset-4 rounded-xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 blur-2xl opacity-60"></div>
              <div className="absolute inset-6 rounded-lg bg-gradient-to-r from-blue-300/25 via-purple-300/25 to-cyan-300/25 blur-xl opacity-40"></div>
            </div>
            
            {/* Dashboard Preview Container */}
            <div className="relative z-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12 shadow-2xl backdrop-blur-sm">
              <div className="flex">
                {/* Main Dashboard Content */}
                <div className="flex-1 pr-8">
                  {/* Dashboard Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
                    <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's what's happening with your videos.</p>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Videos</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">12</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <div className="w-4 h-4 bg-green-600 rounded"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Duration</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">30h 47m</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <div className="w-4 h-4 bg-purple-600 rounded"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Recent Searches</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">8</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <div className="w-4 h-4 bg-orange-600 rounded"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">AI Highlights</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">34</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Videos Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Videos</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Your latest uploaded and processed videos</p>
                    </div>
                    
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <PlayIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Project Standup Meeting - Week 15</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <span>30m 47s</span>
                              <span>•</span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">COMPLETED</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View</button>
                      </div>
                      
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <PlayIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Design Review Session</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <span>39m</span>
                              <span>•</span>
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">TRANSCRIBING</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View</button>
                      </div>
                      
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <PlayIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Customer Interview - User Feedback</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <span>26m</span>
                              <span>•</span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">COMPLETED</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">View</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Sidebar - AI Features Panel */}
                <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6 rounded-r-xl">
                  {/* AI Search Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <SearchIcon className="h-5 w-5" />
                      AI Search
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Search: "budget discussion"</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 dark:text-slate-500">Found in 3 videos:</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">• Project Meeting (3:45-4:20)</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">• Q4 Planning (12:15-13:02)</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">• Team Sync (8:30-9:15)</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Highlights Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5" />
                      Smart Highlights
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Key Decision</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">"Let's allocate 40% budget to user acquisition"</p>
                        <span className="text-xs text-blue-500">Project Meeting • 3:45</span>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Action Item</span>
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400">"Sarah to implement search improvements by Friday"</p>
                        <span className="text-xs text-purple-500">Design Review • 1:23</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <PlayIcon className="h-4 w-4" />
                        Upload New Video
                      </button>
                      <button className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <SearchIcon className="h-4 w-4" />
                        Advanced Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
