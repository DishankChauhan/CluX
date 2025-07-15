import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, PlayIcon, PauseIcon, SearchIcon } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">AI Clip Curator Demo</h1>
          <p className="text-muted-foreground mt-2">
            Experience the power of AI-driven video analysis and search
          </p>
        </div>

        {/* Demo Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Player Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sample Video</h2>
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center border">
              <div className="text-center text-white/70">
                <PlayIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="text-sm">Demo video will be available soon</p>
                <p className="text-xs mt-2">Upload your videos to start transcribing</p>
              </div>
            </div>
            
            {/* Video Controls */}
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
              <Button size="sm" variant="outline">
                <PlayIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-1/3"></div>
              </div>
              <span className="text-sm text-muted-foreground">2:34 / 8:12</span>
            </div>
          </div>

          {/* Transcript & Search Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Live Transcript & Search</h2>
            
            {/* Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transcript... (e.g., 'project updates', 'budget discussion')"
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Transcript */}
            <div className="bg-card rounded-lg border p-4 h-96 overflow-y-auto space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-mono">0:45</span>
                  <div className="bg-blue-500/10 p-2 rounded">
                    <p className="text-sm"><strong>John:</strong> "Welcome everyone to today's project standup meeting. Let's start by reviewing our progress from last week."</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-mono">1:23</span>
                  <div className="bg-green-500/10 p-2 rounded">
                    <p className="text-sm"><strong>Sarah:</strong> "The AI features we discussed are now implemented. The transcription accuracy has improved by 15%."</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-mono">2:10</span>
                  <div className="bg-purple-500/10 p-2 rounded">
                    <p className="text-sm"><strong>Mike:</strong> "Great work on the search functionality. Users can now find specific moments in their videos much faster."</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-mono">3:45</span>
                  <div className="bg-yellow-500/10 p-2 rounded">
                    <p className="text-sm"><strong>Emily:</strong> "The budget allocation for the next quarter looks good. We should focus on user acquisition."</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-mono">4:30</span>
                  <div className="bg-red-500/10 p-2 rounded">
                    <p className="text-sm"><strong>John:</strong> "Any questions about the roadmap? We need to deliver the highlight feature by month-end."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Highlights */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3">🤖 AI-Generated Highlights</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">📊 Budget Discussion</span>
                  <span className="text-xs text-muted-foreground">3:45</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">🚀 Feature Updates</span>
                  <span className="text-xs text-muted-foreground">1:23</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">❓ Q&A Session</span>
                  <span className="text-xs text-muted-foreground">4:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold mb-4">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first video and experience AI-powered transcription and search
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard/upload">
              Start Uploading Videos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
