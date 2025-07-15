import { Job } from 'bull';
import {
  videoProcessingQueue,
  transcriptionQueue,
  embeddingsQueue,
  highlightsQueue,
  VideoProcessingJobData,
  TranscriptionJobData,
  EmbeddingsJobData,
  HighlightsJobData,
} from './queue';
import {
  extractVideoMetadata,
  extractAudio,
  generateThumbnail,
  optimizeForWeb,
  validateVideoFile,
  cleanupTempFiles,
} from './video-processing';
import {
  transcribeAudio,
  generateEmbeddings,
  generateHighlights,
  generateSummary,
  extractKeyTopics,
} from './ai-services-cached';
import { prisma } from './prisma';
import path from 'path';
import fs from 'fs/promises';

/**
 * Video Processing Worker
 * Handles initial video processing: validation, metadata extraction, thumbnail generation
 */
videoProcessingQueue.process(async (job: Job<VideoProcessingJobData>) => {
  const { videoId, userId, filePath, fileName } = job.data;
  
  try {
    console.log(`Processing video ${videoId} for user ${userId}`);
    
    // Update job progress
    await job.progress(10);
    
    // Validate video file
    const isValid = await validateVideoFile(filePath);
    if (!isValid) {
      throw new Error('Invalid video file format');
    }
    
    await job.progress(20);
    
    // Extract metadata
    const metadata = await extractVideoMetadata(filePath);
    
    await job.progress(40);
    
    // Generate thumbnail
    const thumbnailDir = path.join(process.env.UPLOAD_DIR || './uploads', 'thumbnails');
    await fs.mkdir(thumbnailDir, { recursive: true });
    const thumbnailPath = path.join(thumbnailDir, `${videoId}_thumbnail.png`);
    await generateThumbnail(filePath, thumbnailPath);
    
    await job.progress(60);
    
    // Update video record with metadata
    await prisma.video.update({
      where: { id: videoId },
      data: {
        duration: metadata.duration,
        fileSize: BigInt(metadata.size),
        thumbnailPath: thumbnailPath.replace(process.env.UPLOAD_DIR || './uploads', ''),
        status: 'PROCESSING',
        metadata: {
          width: metadata.width,
          height: metadata.height,
          fps: metadata.fps,
          bitrate: metadata.bitrate,
          codec: metadata.codec,
        },
      },
    });
    
    await job.progress(80);
    
    // Extract audio for transcription
    const audioDir = path.join(process.env.UPLOAD_DIR || './uploads', 'audio');
    await fs.mkdir(audioDir, { recursive: true });
    const audioPath = path.join(audioDir, `${videoId}_audio.wav`);
    await extractAudio(filePath, audioPath);
    
    await job.progress(90);
    
    // Queue transcription job
    await transcriptionQueue.add('transcribe', {
      videoId,
      userId,
      audioPath,
    });
    
    await job.progress(100);
    
    console.log(`Video processing completed for ${videoId}`);
    
    return {
      videoId,
      metadata,
      thumbnailPath,
      audioPath,
    };
    
  } catch (error) {
    console.error(`Video processing failed for ${videoId}:`, error);
    
    // Update video status to failed
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'FAILED',
      },
    });
    
    throw error;
  }
});

/**
 * Transcription Worker
 * Handles audio transcription using OpenAI Whisper
 */
transcriptionQueue.process(async (job: Job<TranscriptionJobData>) => {
  const { videoId, userId, audioPath, language } = job.data;
  
  try {
    console.log(`Transcribing audio for video ${videoId}`);
    
    await job.progress(10);
    
    // Transcribe audio
    const transcription = await transcribeAudio(audioPath, language, videoId, userId);
    
    await job.progress(50);
    
    // Save transcript segments to database
    const transcriptSegments = transcription.segments.map((segment) => ({
      text: segment.text,
      startTime: segment.start,
      endTime: segment.end,
      confidence: 1 - segment.no_speech_prob, // Convert to confidence score
    }));
    
    // Create transcript record
    await prisma.transcript.create({
      data: {
        videoId,
        language: transcription.language,
        content: transcription.text,
        confidence: transcriptSegments.reduce((avg, seg) => avg + (seg.confidence || 0), 0) / transcriptSegments.length,
        segments: {
          create: transcriptSegments,
        },
      },
    });
    
    await job.progress(80);
    
    // Queue embeddings generation
    await embeddingsQueue.add('generate-embeddings', {
      videoId,
      userId,
      transcriptSegments: transcriptSegments.map((seg, index) => ({
        id: index.toString(),
        text: seg.text,
        startTime: seg.startTime,
        endTime: seg.endTime,
      })),
    });
    
    // Queue highlights generation
    await highlightsQueue.add('generate-highlights', {
      videoId,
      userId,
      transcript: transcription.text,
      segments: transcriptSegments.map((seg, index) => ({
        id: index.toString(),
        text: seg.text,
        startTime: seg.startTime,
        endTime: seg.endTime,
      })),
    });
    
    await job.progress(100);
    
    // Cleanup audio file
    await cleanupTempFiles([audioPath]);
    
    console.log(`Transcription completed for video ${videoId}`);
    
    return {
      videoId,
      transcriptId: transcription.task,
      segmentCount: transcriptSegments.length,
    };
    
  } catch (error) {
    console.error(`Transcription failed for video ${videoId}:`, error);
    
    // Update video status
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'FAILED',
      },
    });
    
    throw error;
  }
});

/**
 * Embeddings Worker
 * Generates vector embeddings for transcript segments
 */
embeddingsQueue.process(async (job: Job<EmbeddingsJobData>) => {
  const { videoId, userId, transcriptSegments } = job.data;
  
  try {
    console.log(`Generating embeddings for video ${videoId}`);
    
    await job.progress(10);
    
    // Extract text from segments
    const texts = transcriptSegments.map(seg => seg.text);
    
    await job.progress(30);
    
    // Generate embeddings
    const embeddings = await generateEmbeddings(texts, videoId, userId);
    
    await job.progress(70);
    
    // Note: Embeddings are disabled in the schema for now
    // This will be implemented when the embedding model is enabled
    console.log(`Embeddings processing skipped for video ${videoId} - model disabled in schema`);
    
    /*
    // Save embeddings to database
    const embeddingRecords = embeddings.map((embedding, index) => ({
      videoId,
      segmentId: transcriptSegments[index].id,
      embedding,
      text: texts[index],
      startTime: transcriptSegments[index].startTime,
      endTime: transcriptSegments[index].endTime,
    }));
    
    await prisma.embedding.createMany({
      data: embeddingRecords,
    });
    */
    
    await job.progress(100);
    
    console.log(`Embeddings generated for video ${videoId}`);
    
    return {
      videoId,
      embeddingCount: embeddings.length,
    };
    
  } catch (error) {
    console.error(`Embedding generation failed for video ${videoId}:`, error);
    throw error;
  }
});

/**
 * Highlights Worker
 * Generates AI-powered highlights and analysis
 */
highlightsQueue.process(async (job: Job<HighlightsJobData>) => {
  const { videoId, userId, transcript, segments } = job.data;
  
  try {
    console.log(`Generating highlights for video ${videoId}`);
    
    await job.progress(10);
    
    // Generate highlights
    const highlightResponse = await generateHighlights(transcript, segments, videoId, userId);
    
    await job.progress(40);
    
    // Generate summary
    const summary = await generateSummary(transcript, videoId, userId);
    
    await job.progress(60);
    
    // Extract key topics
    const keyTopics = await extractKeyTopics(transcript, videoId, userId);
    
    await job.progress(80);
    
    // Map highlight types to schema enum values
    const mapHighlightType = (type: string): 'AI_GENERATED' | 'USER_CREATED' | 'QUESTION' | 'KEY_POINT' | 'SPEAKER_CHANGE' | 'TOPIC_TRANSITION' => {
      switch (type.toLowerCase()) {
        case 'question':
          return 'QUESTION';
        case 'key_point':
          return 'KEY_POINT';
        case 'speaker_change':
          return 'SPEAKER_CHANGE';
        case 'topic_transition':
          return 'TOPIC_TRANSITION';
        default:
          return 'AI_GENERATED';
      }
    };
    
    // Save highlights to database
    const highlightRecords = highlightResponse.highlights.map((highlight) => ({
      videoId,
      type: mapHighlightType(highlight.type),
      title: highlight.summary,
      description: highlight.text,
      startTime: highlight.startTime,
      endTime: highlight.endTime,
      score: highlight.confidence,
      tags: [],
    }));
    
    await prisma.highlight.createMany({
      data: highlightRecords,
    });
    
    // Update video with status
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'COMPLETED',
      },
    });
    
    await job.progress(100);
    
    console.log(`Highlights generated for video ${videoId}`);
    
    return {
      videoId,
      highlightCount: highlightRecords.length,
      summary,
      keyTopics,
    };
    
  } catch (error) {
    console.error(`Highlight generation failed for video ${videoId}:`, error);
    
    // Update video status - don't fail completely if highlights fail
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'COMPLETED',
      },
    });
    
    throw error;
  }
});

// Export worker status monitoring
export const getWorkerStats = async () => {
  const stats = await Promise.all([
    videoProcessingQueue.getJobCounts(),
    transcriptionQueue.getJobCounts(),
    embeddingsQueue.getJobCounts(),
    highlightsQueue.getJobCounts(),
  ]);

  return {
    videoProcessing: stats[0],
    transcription: stats[1],
    embeddings: stats[2],
    highlights: stats[3],
  };
};

// Graceful shutdown
export const shutdownWorkers = async () => {
  console.log('Shutting down workers...');
  
  // Wait for active jobs to complete
  await Promise.all([
    videoProcessingQueue.close(),
    transcriptionQueue.close(),
    embeddingsQueue.close(),
    highlightsQueue.close(),
  ]);
  
  console.log('Workers shut down successfully');
};

// Start workers when this module is imported
console.log('AI processing workers started');
