import { openai, AI_CONFIG } from './openai';
import type { TranscriptionResponse, HighlightResponse } from './openai';
import { aiCache } from './ai-cache';
import { apiUsageTracker } from './api-usage-tracker';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Enhanced AI Services with Caching
 * Reduces OpenAI API costs by caching responses
 */

/**
 * Transcribe audio using OpenAI Whisper with caching
 */
export const transcribeAudioCached = async (
  audioPath: string,
  language?: string,
  videoId?: string,
  userId?: string
): Promise<TranscriptionResponse> => {
  try {
    console.log(`Starting cached transcription for: ${audioPath}`);
    
    // Check if file exists
    await fs.access(audioPath);
    
    // Create cache key from file content hash
    const fileBuffer = await fs.readFile(audioPath);
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const cacheKey = `${fileHash}:${language || 'en'}`;
    const model = AI_CONFIG.transcription.model;
    
    // Check cache first
    const cached = await aiCache.get<TranscriptionResponse>(
      'transcription',
      cacheKey,
      model
    );
    
    if (cached) {
      console.log('Using cached transcription');
      
      // Track cache hit
      await apiUsageTracker.trackUsage({
        type: 'transcription',
        model,
        inputMinutes: cached.duration,
        cached: true,
        videoId,
        userId
      });
      
      return cached;
    }

    // Process with OpenAI
    console.log('Transcribing with OpenAI Whisper');
    const audioFile = await fs.readFile(audioPath);
    const audioBlob = new File([audioFile], path.basename(audioPath), {
      type: 'audio/wav'
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioBlob,
      model: AI_CONFIG.transcription.model,
      language: language || AI_CONFIG.transcription.language,
      response_format: AI_CONFIG.transcription.response_format,
      timestamp_granularities: ['segment'] as ('segment' | 'word')[],
    });

    const result = transcription as unknown as TranscriptionResponse;
    
    // Track API usage
    await apiUsageTracker.trackUsage({
      type: 'transcription',
      model,
      inputMinutes: result.duration,
      cached: false,
      videoId,
      userId
    });

    // Cache the result (expire after 60 days)
    await aiCache.set(
      'transcription',
      cacheKey,
      model,
      result,
      60,
      fileBuffer.length,
      JSON.stringify(result).length
    );

    console.log(`Transcription completed and cached. Duration: ${result.duration}s`);
    return result;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate highlights from transcript using GPT with caching
 */
export const generateHighlightsCached = async (
  transcript: string,
  segments: Array<{ text: string; startTime: number; endTime: number }>,
  videoId?: string,
  userId?: string
): Promise<HighlightResponse> => {
  try {
    console.log('Generating cached highlights from transcript');
    
    const model = AI_CONFIG.highlights.model;
    const cacheKey = crypto
      .createHash('md5')
      .update(`${transcript}:${JSON.stringify(segments)}`)
      .digest('hex');

    // Check cache first
    const cached = await aiCache.get<HighlightResponse>(
      'highlights',
      cacheKey,
      model
    );

    if (cached) {
      console.log('Using cached highlights');
      
      // Track cache hit (estimate tokens)
      const estimatedInputTokens = Math.ceil(transcript.length / 3.5); // rough estimate
      await apiUsageTracker.trackUsage({
        type: 'completion',
        model,
        inputTokens: estimatedInputTokens,
        outputTokens: 500, // estimated output
        cached: true,
        videoId,
        userId
      });
      
      return cached;
    }

    // Generate with OpenAI
    console.log('Generating highlights with GPT');
    const prompt = `
Analyze the following video transcript and identify key highlights. Focus on:
1. Important decisions or conclusions
2. Action items or tasks mentioned
3. Key achievements or milestones
4. Significant questions or discussions
5. Main points or insights

For each highlight, provide:
- Type: decision, action_item, achievement, question, or key_point
- Summary: Brief description (max 100 chars)
- Confidence: 0-1 score
- Start/end times based on the segments

Transcript segments with timestamps:
${segments.map((seg, i) => `[${seg.startTime.toFixed(1)}s - ${seg.endTime.toFixed(1)}s]: ${seg.text}`).join('\n')}

Return a JSON response with this structure:
{
  "highlights": [
    {
      "type": "decision",
      "text": "Original text from transcript",
      "startTime": 123.5,
      "endTime": 156.2,
      "confidence": 0.85,
      "summary": "Brief description"
    }
  ],
  "summary": "Overall summary of the video content",
  "keyTopics": ["topic1", "topic2", "topic3"]
}
`;

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.highlights.model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that analyzes video transcripts to identify key highlights and moments. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: AI_CONFIG.highlights.temperature,
      max_tokens: AI_CONFIG.highlights.max_tokens,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response structure
    if (!result.highlights || !Array.isArray(result.highlights)) {
      throw new Error('Invalid highlights response format');
    }

    // Track API usage
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    
    await apiUsageTracker.trackUsage({
      type: 'completion',
      model,
      inputTokens,
      outputTokens,
      cached: false,
      videoId,
      userId
    });

    // Cache the result (expire after 90 days)
    await aiCache.set(
      'highlights',
      cacheKey,
      model,
      result,
      90,
      transcript.length,
      JSON.stringify(result).length
    );

    console.log(`Generated and cached ${result.highlights.length} highlights`);
    return result as HighlightResponse;
  } catch (error) {
    console.error('Highlight generation failed:', error);
    throw new Error(`Highlight generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate embeddings for text segments with caching
 */
export const generateEmbeddingsCached = async (
  texts: string[],
  videoId?: string,
  userId?: string
): Promise<number[][]> => {
  try {
    console.log(`Generating cached embeddings for ${texts.length} text segments`);
    
    const model = AI_CONFIG.embeddings.model;
    const batchSize = 100;
    const embeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchKey = crypto
        .createHash('md5')
        .update(`${JSON.stringify(batch)}:${model}`)
        .digest('hex');
      
      // Check cache for this batch
      const cached = await aiCache.get<number[][]>(
        'embeddings',
        batchKey,
        model
      );
      
      if (cached) {
        console.log(`Using cached embeddings for batch ${Math.floor(i / batchSize) + 1}`);
        embeddings.push(...cached);
        
        // Track cache hit
        await apiUsageTracker.trackUsage({
          type: 'embedding',
          model,
          inputTokens: batch.join(' ').length / 4, // rough estimate
          cached: true,
          videoId,
          userId
        });
        
        continue;
      }
      
      // Generate with OpenAI
      console.log(`Generating embeddings for batch ${Math.floor(i / batchSize) + 1}`);
      const response = await openai.embeddings.create({
        model: AI_CONFIG.embeddings.model,
        input: batch,
        dimensions: AI_CONFIG.embeddings.dimensions,
      });
      
      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
      
      // Track API usage
      const inputTokens = response.usage?.prompt_tokens || 0;
      await apiUsageTracker.trackUsage({
        type: 'embedding',
        model,
        inputTokens,
        cached: false,
        videoId,
        userId
      });
      
      // Cache this batch (expire after 180 days - embeddings are expensive)
      await aiCache.set(
        'embeddings',
        batchKey,
        model,
        batchEmbeddings,
        180,
        batch.join(' ').length,
        JSON.stringify(batchEmbeddings).length
      );
      
      console.log(`Generated and cached embeddings for batch ${Math.floor(i / batchSize) + 1}`);
    }
    
    console.log(`All embeddings generated/retrieved. Total: ${embeddings.length}`);
    return embeddings;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate summary of video content with caching
 */
export const generateSummaryCached = async (
  transcript: string,
  videoId?: string,
  userId?: string
): Promise<string> => {
  try {
    console.log('Generating cached video summary');
    
    const model = AI_CONFIG.completion.model;
    const cacheKey = crypto
      .createHash('md5')
      .update(transcript)
      .digest('hex');
    
    // Check cache first
    const cached = await aiCache.get<string>(
      'summary',
      cacheKey,
      model
    );
    
    if (cached) {
      console.log('Using cached summary');
      
      // Track cache hit
      const estimatedInputTokens = Math.ceil(transcript.length / 3.5);
      await apiUsageTracker.trackUsage({
        type: 'completion',
        model,
        inputTokens: estimatedInputTokens,
        outputTokens: 100, // estimated
        cached: true,
        videoId,
        userId
      });
      
      return cached;
    }
    
    // Generate with OpenAI
    const prompt = `
Please provide a concise summary of this video transcript. Focus on:
- Main topics discussed
- Key points and insights
- Important outcomes or decisions
- Overall theme and purpose

Keep the summary between 150-300 words.

Transcript:
${transcript}
`;

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.completion.model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that creates concise, informative summaries of video content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: AI_CONFIG.completion.temperature,
      max_tokens: 500,
    });

    const summary = response.choices[0].message.content || '';
    
    // Track API usage
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    
    await apiUsageTracker.trackUsage({
      type: 'completion',
      model,
      inputTokens,
      outputTokens,
      cached: false,
      videoId,
      userId
    });

    // Cache the result (expire after 60 days)
    await aiCache.set(
      'summary',
      cacheKey,
      model,
      summary,
      60,
      transcript.length,
      summary.length
    );
    
    console.log('Video summary generated and cached');
    return summary;
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw new Error(`Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Extract key topics from transcript with caching
 */
export const extractKeyTopicsCached = async (
  transcript: string,
  videoId?: string,
  userId?: string
): Promise<string[]> => {
  try {
    console.log('Extracting cached key topics');
    
    const model = AI_CONFIG.completion.model;
    const cacheKey = crypto
      .createHash('md5')
      .update(`topics:${transcript}`)
      .digest('hex');
    
    // Check cache first
    const cached = await aiCache.get<string[]>(
      'topics',
      cacheKey,
      model
    );
    
    if (cached) {
      console.log('Using cached key topics');
      
      // Track cache hit
      const estimatedInputTokens = Math.ceil(transcript.length / 3.5);
      await apiUsageTracker.trackUsage({
        type: 'completion',
        model,
        inputTokens: estimatedInputTokens,
        outputTokens: 50, // estimated
        cached: true,
        videoId,
        userId
      });
      
      return cached;
    }
    
    const prompt = `
Analyze this transcript and extract 5-10 key topics or themes discussed.
Return only the topics as a JSON array of strings.

Transcript:
${transcript}

Example response: ["machine learning", "data analysis", "project planning", "team collaboration"]
`;

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.completion.model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI that extracts key topics from text. Always respond with a JSON array of strings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"topics": []}');
    const topics = result.topics || [];
    
    // Track API usage
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    
    await apiUsageTracker.trackUsage({
      type: 'completion',
      model,
      inputTokens,
      outputTokens,
      cached: false,
      videoId,
      userId
    });

    // Cache the result (expire after 60 days)
    await aiCache.set(
      'topics',
      cacheKey,
      model,
      topics,
      60,
      transcript.length,
      JSON.stringify(topics).length
    );
    
    console.log(`Extracted and cached ${topics.length} key topics`);
    return topics;
  } catch (error) {
    console.error('Topic extraction failed:', error);
    return [];
  }
};

// Backward compatibility - keep original functions as aliases
export const transcribeAudio = transcribeAudioCached;
export const generateHighlights = generateHighlightsCached;
export const generateEmbeddings = generateEmbeddingsCached;
export const generateSummary = generateSummaryCached;
export const extractKeyTopics = extractKeyTopicsCached;

/**
 * Legacy functions for speaker detection (no caching needed)
 */
export const detectSpeakers = (segments: Array<{ text: string; startTime: number; endTime: number }>) => {
  // Simple speaker detection based on pause patterns and text analysis
  const speakerSegments = segments.map((segment, index) => {
    const prevSegment = segments[index - 1];
    const isNewSpeaker = !prevSegment || 
                        (segment.startTime - prevSegment.endTime > 2.0) ||
                        segment.text.toLowerCase().includes('speaker') ||
                        segment.text.match(/^[A-Z][a-z]+:/);

    return {
      ...segment,
      speakerId: isNewSpeaker ? `speaker_${Math.floor(index / 10) + 1}` : null,
    };
  });

  return speakerSegments;
};
