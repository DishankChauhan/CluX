"use client";

import { HeroSection } from '@/components/HeroSection'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import Marquee from '@/components/ui/marquee'
import { TechIcon } from '@/components/ui/tech-icons'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import { WorldMap } from '@/components/ui/world-map'
import { Pricing } from '@/components/ui/pricing'
import { FaqSection } from '@/components/ui/faq-section'
import { Footer } from '@/components/ui/footer'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { motion } from 'framer-motion'
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
        description="AI-powered video management with smart transcription, semantic search, and instant highlights."
        actions={[
          {
            text: "Get Started",
            href: "/signup",
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
            <h2 className="text-3xl font-medium mb-4">Powerful AI Features</h2>
            <p className="text-xl text-muted-foreground font-light">Everything you need to organize, search, and analyze your video content</p>
          </div>
          
          <FeaturesGrid />
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-16 px-4 border-t border-border/50">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-lg font-normal text-muted-foreground mb-8">Built using this tech stack</h3>
          </div>
          
          <div className="relative">
            <Marquee pauseOnHover className="[--duration:25s]">
              <TechStackItem name="nextjs" label="Next.js" />
              <TechStackItem name="typescript" label="TypeScript" />
              <TechStackItem name="react" label="React" />
              <TechStackItem name="tailwind" label="Tailwind CSS" />
              <TechStackItem name="postgresql" label="PostgreSQL" />
              <TechStackItem name="prisma" label="Prisma" />
              <TechStackItem name="docker" label="Docker" />
              <TechStackItem name="redis" label="Redis" />
              <TechStackItem name="openai" label="OpenAI" />
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background"></div>
          </div>
        </div>
      </section>

      {/* Typewriter Effect Section */}
      <section className="py-24 px-4">
        <div className="max-w-container mx-auto">
          <div className="flex flex-col items-center justify-center">
            <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base mb-4 font-light">
              The future of video management starts here
            </p>
            <TypewriterEffectSmooth words={[
              { text: "Transform", className: "font-light" },
              { text: "your", className: "font-light" },
              { text: "video", className: "font-light" },
              { text: "library", className: "font-light" },
              { text: "with", className: "font-light" },
              { text: "CluX.", className: "text-blue-500 dark:text-blue-500 font-medium" },
            ]} />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-8">
              <a href="/signup">
                <RainbowButton className="w-40 h-10">
                  Get Started
                </RainbowButton>
              </a>
              <a href="/demo">
                <button className="w-40 h-10 rounded-lg border-2 border-muted-foreground/20 bg-transparent hover:bg-muted/10 hover:border-muted-foreground/40 transition-all duration-300 font-light">
                  Watch Demo
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-40 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-center mb-16">
            <h2 className="font-medium text-xl md:text-4xl mb-4">
              Global{" "}
              <span className="text-muted-foreground">
                {"Connectivity".split("").map((char, idx) => (
                  <motion.span
                    key={idx}
                    className="inline-block"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.04 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto py-4 font-light">
              CluX connects content creators and teams worldwide. From startups to enterprises, our intelligent video management platform serves users across the globe, enabling seamless collaboration and instant video discovery.
            </p>
          </div>
          
          <WorldMap
            dots={[
              {
                start: { lat: 40.7128, lng: -74.0060 }, // New York
                end: { lat: 51.5074, lng: -0.1278 },   // London
              },
              {
                start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
                end: { lat: 35.6762, lng: 139.6503 },   // Tokyo
              },
              {
                start: { lat: 52.5200, lng: 13.4050 },  // Berlin
                end: { lat: -33.8688, lng: 151.2093 },  // Sydney
              },
              {
                start: { lat: 28.6139, lng: 77.2090 },  // Delhi
                end: { lat: 1.3521, lng: 103.8198 },    // Singapore
              },
              {
                start: { lat: 51.5074, lng: -0.1278 },  // London
                end: { lat: -1.2921, lng: 36.8219 },    // Nairobi
              },
              {
                start: { lat: 55.7558, lng: 37.6173 },  // Moscow
                end: { lat: -23.5505, lng: -46.6333 },  // São Paulo
              },
            ]}
            lineColor="#0ea5e9"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Videos Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-500 mb-2">25+</div>
              <div className="text-sm text-muted-foreground">Countries Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-500 mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500 mb-2">1M+</div>
              <div className="text-sm text-muted-foreground">Hours Transcribed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 flex justify-center" id="pricing">
        <div className="w-full max-w-7xl">
          <Pricing
          title="Choose Your CluX Plan"
          description="Transform your video library with AI-powered tools\nAll plans include core features with scalable usage limits."
          plans={[
            {
              name: "Starter",
              price: "9",
              yearlyPrice: "7",
              period: "month",
              features: [
                "Up to 10 hours of video processing",
                "AI transcription with timestamps",
                "Basic semantic search",
                "Standard support",
                "2GB storage included"
              ],
              description: "Perfect for individual creators getting started",
              buttonText: "Start Free Trial",
              href: "/signup?plan=starter",
              isPopular: false,
            },
            {
              name: "Professional",
              price: "29",
              yearlyPrice: "23",
              period: "month",
              features: [
                "Up to 100 hours of video processing",
                "Advanced AI transcription & analysis",
                "Advanced semantic search & highlights",
                "Priority support",
                "50GB storage included",
                "Custom integrations",
                "Team collaboration tools"
              ],
              description: "Ideal for professionals and small teams",
              buttonText: "Get Started",
              href: "/signup?plan=professional",
              isPopular: true,
            },
            {
              name: "Enterprise",
              price: "99",
              yearlyPrice: "79",
              period: "month",
              features: [
                "Unlimited video processing",
                "Enterprise AI features",
                "Custom search algorithms",
                "24/7 dedicated support",
                "Unlimited storage",
                "Advanced analytics",
                "White-label options",
                "On-premise deployment"
              ],
              description: "For organizations with advanced needs",
              buttonText: "Contact Sales",
              href: "/contact?plan=enterprise",
              isPopular: false,
            },
          ]}
        />
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection
        title="Frequently Asked Questions"
        description="Everything you need to know about CluX and our AI-powered video management platform."
        items={[
          {
            question: "How does CluX work?",
            answer: "CluX transforms your video management in 4 simple steps: 1) Upload your videos in any format 2) Our AI automatically transcribes and analyzes content using advanced speech recognition 3) Smart indexing creates searchable metadata, highlights, and timestamps 4) Use natural language search to instantly find any moment, topic, or discussion across your entire video library. Features include semantic search, auto-generated summaries, speaker identification, and intelligent cost optimization."
          },
          {
            question: "How does CluX's AI transcription work?",
            answer: "CluX uses advanced AI models including OpenAI Whisper to provide highly accurate transcriptions with speaker identification, timestamps, and confidence scoring. Our system processes your videos securely and delivers results within minutes."
          },
          {
            question: "What video formats does CluX support?",
            answer: "CluX supports all major video formats including MP4, MOV, AVI, MKV, and more. Our intelligent processing automatically optimizes videos for web playback while maintaining quality."
          },
          {
            question: "How does semantic search work?",
            answer: "Our semantic search uses vector embeddings to understand the meaning and context of your video content. You can search using natural language queries like 'discussions about budget' or 'key decisions made' and find relevant moments instantly."
          },
          {
            question: "Is my video data secure?",
            answer: "Absolutely. We use enterprise-grade encryption for data in transit and at rest. Your videos are processed securely and we never share your content with third parties. You maintain full ownership of your data."
          },
          {
            question: "Can I integrate CluX with other tools?",
            answer: "Yes! CluX offers APIs and webhooks for custom integrations. Professional and Enterprise plans include pre-built integrations with popular productivity tools and cloud storage services."
          },
          {
            question: "What happens if I exceed my plan limits?",
            answer: "We'll notify you before you reach your limits. You can either upgrade your plan or purchase additional usage credits. We never interrupt your service without notice."
          }
        ]}
        contactInfo={{
          title: "Still have questions?",
          description: "Get in touch with our team for personalized assistance.",
          buttonText: "Contact Support",
          onContact: () => window.open('/contact', '_blank')
        }}
      />

      {/* Footer Section */}
      <Footer />
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
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-medium font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground font-light">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

interface TechStackItemProps {
  name: string;
  label: string;
}

const TechStackItem = ({ name, label }: TechStackItemProps) => {
  return (
    <div className="flex flex-col items-center gap-3 mx-8">
      <div className="p-3 rounded-lg border border-border bg-background/50 hover:bg-muted/50 transition-colors duration-200">
        <TechIcon name={name} className="h-8 w-8 text-foreground" />
      </div>
      <span className="text-sm font-light text-muted-foreground">{label}</span>
    </div>
  );
};
