import { HeroSection } from '@/components/HeroSection'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { PlayIcon, SearchIcon, SparklesIcon, ArrowRightIcon, VideoIcon, BrainIcon, BookmarkIcon, DatabaseIcon, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection
        badge={{
          text: "🎬 Now Available",
          action: {
            text: "Try Demo",
            href: "/dashboard"
          }
        }}
        title="CluX"
        description="Transform your personal videos with AI-powered transcription, semantic search, and auto-generated highlights. Find any moment in your video library instantly."
        actions={[
          {
            text: "Get Started",
            href: "/dashboard",
            icon: <PlayIcon className="h-4 w-4" />,
            variant: "glow"
          },
          {
            text: "View Demo",
            href: "/demo",
            icon: <ArrowRightIcon className="h-4 w-4" />,
            variant: "outline"
          }
        ]}
      />
      
      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to organize, search, and analyze your video content</p>
          </div>
          
          <FeaturesGrid />
        </div>
      </section>
    </main>
  )
}

function FeaturesGrid() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-6 xl:max-h-[36rem] xl:grid-rows-2">
      <FeatureItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<VideoIcon className="h-4 w-4" />}
        title="Smart Video Processing"
        description="Upload videos and let AI automatically extract metadata, generate thumbnails, and optimize for web playback with intelligent compression."
      />
      <FeatureItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<BrainIcon className="h-4 w-4" />}
        title="AI-Powered Transcription"
        description="Advanced speech-to-text using OpenAI Whisper with speaker identification, timestamps, and confidence scoring for accurate results."
      />
      <FeatureItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<SearchIcon className="h-4 w-4" />}
        title="Semantic Search & Discovery"
        description="Find any moment in your videos using natural language. Search by topics, questions, or specific content with vector-based similarity search."
      />
      <FeatureItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<SparklesIcon className="h-4 w-4" />}
        title="Auto-Generated Highlights"
        description="AI automatically identifies key moments, decisions, action items, and important discussions in your videos for quick navigation."
      />
      <FeatureItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<DatabaseIcon className="h-4 w-4" />}
        title="Smart Caching & Cost Optimization"
        description="Intelligent response caching reduces OpenAI API costs by 70-90% while providing detailed usage analytics and budget monitoring."
      />
    </ul>
  );
}

interface FeatureItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const FeatureItem = ({ area, icon, title, description }: FeatureItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
