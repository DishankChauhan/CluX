import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration for different AI services
export const AI_CONFIG = {
  transcription: {
    model: 'whisper-1',
    language: 'en', // Can be made dynamic
    response_format: 'verbose_json' as const,
    timestamp_granularities: ['segment'] as const,
  },
  embeddings: {
    model: 'text-embedding-3-small',
    dimensions: 1536,
  },
  completion: {
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 2000,
  },
  highlights: {
    model: 'gpt-4o-mini',
    temperature: 0.1,
    max_tokens: 1000,
  }
} as const;

// Types for AI responses
export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: TranscriptionSegment[];
}

export interface HighlightResponse {
  highlights: {
    type: 'decision' | 'action_item' | 'achievement' | 'question' | 'key_point';
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
    summary: string;
  }[];
  summary: string;
  keyTopics: string[];
}
