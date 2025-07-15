import { openai, AI_CONFIG } from './openai';
import type { TranscriptionResponse, HighlightResponse } from './openai';
import fs from 'fs/promises';
import path from 'path';

/**
 * Transcribe audio using OpenAI Whisper
 */
export const transcribeAudio = async (
  audioPath: string,
  language?: string
): Promise<TranscriptionResponse> => {
  try {
    console.log(`Starting transcription for: ${audioPath}`);
    
    // Check if file exists
    await fs.access(audioPath);
    
    // Create a readable stream from the audio file
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

    console.log(`Transcription completed. Duration: ${(transcription as any).duration}s`);
    
    return transcription as unknown as TranscriptionResponse;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate embeddings for text segments
 */
export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    console.log(`Generating embeddings for ${texts.length} text segments`);
    
    // Split into batches to avoid API limits
    const batchSize = 100;
    const embeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const response = await openai.embeddings.create({
        model: AI_CONFIG.embeddings.model,
        input: batch,
        dimensions: AI_CONFIG.embeddings.dimensions,
      });
      
      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
      
      console.log(`Generated embeddings for batch ${Math.floor(i / batchSize) + 1}`);
    }
    
    console.log(`All embeddings generated. Total: ${embeddings.length}`);
    return embeddings;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate highlights from transcript using GPT
 */
export const generateHighlights = async (
  transcript: string,
  segments: Array<{ text: string; startTime: number; endTime: number }>
): Promise<HighlightResponse> => {
  try {
    console.log('Generating highlights from transcript');
    
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

    console.log(`Generated ${result.highlights.length} highlights`);
    
    return result as HighlightResponse;
  } catch (error) {
    console.error('Highlight generation failed:', error);
    throw new Error(`Highlight generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate summary of video content
 */
export const generateSummary = async (transcript: string): Promise<string> => {
  try {
    console.log('Generating video summary');
    
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
    
    console.log('Video summary generated');
    return summary;
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw new Error(`Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Detect speakers in transcript (simple heuristic approach)
 */
export const detectSpeakers = (segments: Array<{ text: string; startTime: number; endTime: number }>) => {
  // Simple speaker detection based on pause patterns and text analysis
  // This is a basic implementation - for better results, use specialized services
  
  const speakerSegments = segments.map((segment, index) => {
    // Heuristic: If there's a significant pause (>2s) or text pattern changes,
    // it might indicate a speaker change
    const prevSegment = segments[index - 1];
    const isNewSpeaker = !prevSegment || 
                        (segment.startTime - prevSegment.endTime > 2.0) ||
                        segment.text.toLowerCase().includes('speaker') ||
                        segment.text.match(/^[A-Z][a-z]+:/); // "Name:" pattern

    return {
      ...segment,
      speakerId: isNewSpeaker ? `speaker_${Math.floor(index / 10) + 1}` : null,
    };
  });

  return speakerSegments;
};

/**
 * Extract key topics from transcript
 */
export const extractKeyTopics = async (transcript: string): Promise<string[]> => {
  try {
    console.log('Extracting key topics');
    
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
    
    console.log(`Extracted ${topics.length} key topics`);
    return topics;
  } catch (error) {
    console.error('Topic extraction failed:', error);
    return [];
  }
};
