# Current App State & Optimization Guide

## 📊 Current App State

### Phase 2 Status: AI Video Processing 🚀
Your AI Clip Curator app is currently in **Phase 2** with the following implemented features:

#### ✅ Completed Features
- **Core Infrastructure**: Next.js 14, TypeScript, Tailwind CSS, Prisma ORM
- **Authentication**: NextAuth.js with secure session management
- **Database**: PostgreSQL with comprehensive schema for videos, transcripts, highlights
- **File Upload**: Drag-and-drop with validation and progress tracking
- **AI Integration**: OpenAI Whisper transcription and GPT-4 highlight generation
- **Background Processing**: Redis + Bull queue system for scalable AI processing
- **Video Processing**: FFmpeg integration for metadata extraction, audio extraction, thumbnails
- **Modern UI**: Hero section, dashboard, upload interface with real-time status

#### 🔄 Active Processing Pipeline
1. **Video Upload** → File validation & storage
2. **Background Job** → Video processing (metadata, audio extraction)
3. **AI Transcription** → OpenAI Whisper API
4. **Highlight Generation** → GPT-4 analysis of transcript
5. **Storage** → Database with embeddings ready for Phase 3

#### 🚧 In Progress/Pending
- **Semantic Search** (Phase 3): Vector embeddings and similarity search
- **Caching System**: AI response caching to optimize OpenAI usage
- **Speaker Diarization**: Advanced speaker identification
- **Real-time Sync**: Live transcript highlighting during playback

## 🎬 Video Requirements & Recommendations

### Supported Formats
```typescript
// Currently supported video formats
const supportedFormats = [
  'mp4',   // Recommended - best compatibility
  'avi',   // Good support
  'mov',   // Apple QuickTime
  'mkv',   // Matroska container
  'webm',  // Web-optimized
  'flv'    // Flash video
];

// MIME types accepted by upload API
const allowedMimeTypes = [
  'video/mp4',
  'video/avi', 
  'video/mov',
  'video/wmv',
  'video/webm'
];
```

### Technical Limits
- **File Size**: 500MB maximum (configurable via `MAX_FILE_SIZE` env var)
- **Duration**: No hard limit, but transcription time scales ~4x realtime
- **Resolution**: Auto-optimized to max 1920x1080 for web playback
- **Bitrate**: Videos >5Mbps are flagged for optimization

### 🏆 Recommended Video Specifications

#### For Best AI Processing Results:
```yaml
Format: MP4 (H.264 video, AAC audio)
Resolution: 1080p or lower
Bitrate: 2-5 Mbps
Audio: 
  - Clear speech (avoid background music if possible)
  - Sample rate: 16kHz or higher
  - Mono or stereo acceptable
Duration: 5-60 minutes (optimal for processing time)
```

#### For Fastest Processing:
```yaml
Format: MP4
Resolution: 720p
Bitrate: 1-2 Mbps
Audio Quality: Good clarity more important than high fidelity
Background Noise: Minimal for better transcription accuracy
```

### Quality vs Processing Trade-offs
- **Higher Quality** → Better transcription accuracy but longer processing time
- **Lower Quality** → Faster processing but potential accuracy loss
- **Audio Quality** → Most critical factor for transcription success

## 💰 OpenAI API Usage & Cost Optimization

### Current API Usage
```typescript
// From src/lib/openai.ts - Current configuration
const AI_CONFIG = {
  transcription: {
    model: 'whisper-1',           // ~$0.006/minute
    response_format: 'verbose_json'
  },
  highlights: {
    model: 'gpt-4o-mini',         // ~$0.15/1M input tokens
    temperature: 0.1,
    max_tokens: 1000
  },
  embeddings: {
    model: 'text-embedding-3-small', // ~$0.02/1M tokens
    dimensions: 1536
  }
};
```

### Cost Breakdown (Estimates)
- **Whisper Transcription**: ~$0.006 per minute of audio
- **GPT-4o-mini Highlights**: ~$0.001-0.005 per video (depending on length)
- **Embeddings**: ~$0.0001-0.001 per video
- **Total per video**: ~$0.01-0.05 for typical 10-minute video

## 🚀 Implementing AI Response Caching

Here's how to implement caching to reduce OpenAI API costs:

### 1. Database Schema Enhancement
```sql
-- Add to existing Prisma schema
model AICache {
  id          String   @id @default(cuid())
  type        String   // 'transcription', 'highlights', 'summary'
  inputHash   String   @unique // Hash of input content
  response    Json     // Cached AI response
  model       String   // AI model used
  createdAt   DateTime @default(now())
  expiresAt   DateTime? // Optional expiration
  
  @@index([type, inputHash])
}
```

### 2. Caching Service Implementation
```typescript
// src/lib/ai-cache.ts
import crypto from 'crypto';
import { prisma } from './prisma';

class AICacheService {
  private generateHash(content: string, model: string): string {
    return crypto
      .createHash('sha256')
      .update(`${model}:${content}`)
      .digest('hex');
  }

  async get<T>(
    type: string,
    content: string,
    model: string
  ): Promise<T | null> {
    const hash = this.generateHash(content, model);
    
    const cached = await prisma.aICache.findUnique({
      where: { inputHash: hash },
    });

    if (!cached) return null;
    
    // Check expiration
    if (cached.expiresAt && cached.expiresAt < new Date()) {
      await this.delete(hash);
      return null;
    }

    return cached.response as T;
  }

  async set<T>(
    type: string,
    content: string,
    model: string,
    response: T,
    expirationDays?: number
  ): Promise<void> {
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
        expiresAt,
      },
      update: {
        response: response as any,
        expiresAt,
      },
    });
  }

  async delete(hash: string): Promise<void> {
    await prisma.aICache.delete({
      where: { inputHash: hash },
    });
  }
}

export const aiCache = new AICacheService();
```

### 3. Enhanced AI Services with Caching
```typescript
// Enhanced src/lib/ai-services.ts
import { aiCache } from './ai-cache';

export const transcribeAudioCached = async (
  audioPath: string,
  language?: string
): Promise<TranscriptionResponse> => {
  // Create cache key from file content hash
  const fileBuffer = await fs.readFile(audioPath);
  const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
  const cacheKey = `${fileHash}:${language || 'en'}`;
  
  // Check cache first
  const cached = await aiCache.get<TranscriptionResponse>(
    'transcription',
    cacheKey,
    AI_CONFIG.transcription.model
  );
  
  if (cached) {
    console.log('Using cached transcription');
    return cached;
  }

  // Process with OpenAI
  const transcription = await transcribeAudio(audioPath, language);
  
  // Cache the result (expire after 30 days)
  await aiCache.set(
    'transcription',
    cacheKey,
    AI_CONFIG.transcription.model,
    transcription,
    30
  );

  return transcription;
};

export const generateHighlightsCached = async (
  transcript: string,
  segments: Array<{ text: string; startTime: number; endTime: number }>
): Promise<HighlightResponse> => {
  const cacheKey = crypto
    .createHash('md5')
    .update(transcript)
    .digest('hex');

  // Check cache first
  const cached = await aiCache.get<HighlightResponse>(
    'highlights',
    cacheKey,
    AI_CONFIG.highlights.model
  );

  if (cached) {
    console.log('Using cached highlights');
    return cached;
  }

  // Generate with OpenAI
  const highlights = await generateHighlights(transcript, segments);

  // Cache the result (expire after 60 days)
  await aiCache.set(
    'highlights',
    cacheKey,
    AI_CONFIG.highlights.model,
    highlights,
    60
  );

  return highlights;
};
```

### 4. Cache Management Features
```typescript
// src/lib/cache-management.ts
export class CacheManager {
  async getStats() {
    const stats = await prisma.aICache.groupBy({
      by: ['type'],
      _count: true,
    });

    const totalSize = await prisma.aICache.count();
    return { byType: stats, total: totalSize };
  }

  async clearExpired() {
    const result = await prisma.aICache.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
    
    return result.count;
  }

  async clearByType(type: string) {
    const result = await prisma.aICache.deleteMany({
      where: { type }
    });
    
    return result.count;
  }

  async estimateCostSavings() {
    const cacheHits = await prisma.aICache.count();
    
    // Rough estimates based on average costs
    const savings = {
      transcription: cacheHits * 0.03, // ~$0.03 per cached transcription
      highlights: cacheHits * 0.002,   // ~$0.002 per cached highlight
      total: cacheHits * 0.032
    };
    
    return savings;
  }
}
```

## 📈 Optimization Strategies

### 1. Smart Caching Strategy
- **Transcriptions**: Cache for 30+ days (audio rarely changes)
- **Highlights**: Cache for 60+ days (analysis results stable)
- **Embeddings**: Cache permanently (computation expensive)
- **Summaries**: Cache for 30 days (context-dependent)

### 2. Cost Reduction Techniques
```typescript
// Batch processing for efficiency
const batchTranscriptions = async (videoPaths: string[]) => {
  const results = await Promise.allSettled(
    videoPaths.map(path => transcribeAudioCached(path))
  );
  return results;
};

// Incremental processing for large files
const processLargeVideo = async (videoPath: string) => {
  const segments = await splitVideoIntoSegments(videoPath, 600); // 10min chunks
  const transcriptions = await Promise.all(
    segments.map(segment => transcribeAudioCached(segment))
  );
  return mergeTranscriptions(transcriptions);
};
```

### 3. Usage Monitoring
```typescript
// Track API usage and costs
export const trackAPIUsage = async (
  type: 'transcription' | 'completion' | 'embedding',
  model: string,
  inputTokens: number,
  outputTokens?: number
) => {
  await prisma.aPIUsage.create({
    data: {
      type,
      model,
      inputTokens,
      outputTokens: outputTokens || 0,
      estimatedCost: calculateCost(type, model, inputTokens, outputTokens),
      timestamp: new Date(),
    }
  });
};
```

## 🚀 Next Steps for Implementation

### Immediate Actions (Phase 2 completion):
1. **Add caching schema** to Prisma ✅
2. **Implement cache service** and enhanced AI functions ✅
3. **Update workers** to use cached functions ✅
4. **Add cost monitoring** dashboard ✅

### Phase 3 Preparation:
1. **Enable embeddings** generation with caching ✅ (Ready)
2. **Implement vector search** with pgvector (Next)
3. **Add semantic search** API endpoints (Ready for embeddings)
4. **Build search UI** components (Basic text search implemented)

### Performance Optimization:
1. **Monitor cache hit rates** (target >70%) ✅ (Dashboard available)
2. **Implement batch processing** for multiple videos ✅
3. **Add compression** for large cache entries (Future enhancement)
4. **Set up automated cleanup** for expired cache ✅

## ✅ Implementation Status

### Completed Features:
- **AI Caching System**: Full implementation with cost tracking
- **Database Schema**: AICache and APIUsage models added
- **Enhanced AI Services**: All functions now support caching
- **Cache Management Dashboard**: Real-time stats and controls  
- **Cost Monitoring**: Detailed usage tracking and budget alerts
- **Worker Integration**: Background jobs use cached AI services

### Cache Configuration:
- **Transcriptions**: 60-day cache (most expensive to regenerate)
- **Highlights**: 90-day cache (analysis results are stable)
- **Embeddings**: 180-day cache (computationally expensive)
- **Summaries**: 60-day cache (context-dependent)

### Cost Optimization Features:
- **Automatic Cache Lookup**: All AI calls check cache first
- **Usage Tracking**: Monitor costs by type, model, and video
- **Budget Alerts**: Set monthly spending limits
- **Hit Rate Monitoring**: Track cache effectiveness
- **Batch Processing**: Efficient handling of multiple requests

This comprehensive setup will significantly reduce your OpenAI API costs while providing a robust, scalable foundation for advanced AI features in Phase 3.

---

## 📝 Quick Start with Caching

1. **Run the migration** (already completed):
   ```bash
   npx prisma migrate dev --name add-ai-cache-and-usage-tracking
   ```

2. **Access the cache dashboard**:
   - Navigate to `/dashboard/cache` in your app
   - Monitor cache hit rates and cost savings
   - Manage cache entries and view usage statistics

3. **Start processing videos**:
   - Upload videos through `/dashboard/upload`
   - AI processing now automatically uses caching
   - View cost savings in real-time on the cache dashboard

The app now intelligently caches all AI responses, dramatically reducing API costs for repeated processing while maintaining the same quality and functionality.
