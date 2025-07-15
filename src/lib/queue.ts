import Queue from 'bull';
import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  db: 0,
};

// Create Redis connection
export const redis = new Redis(redisConfig);

// Job queue names
export const QUEUE_NAMES = {
  VIDEO_PROCESSING: 'video-processing',
  TRANSCRIPTION: 'transcription',
  EMBEDDINGS: 'embeddings',
  HIGHLIGHTS: 'highlights',
} as const;

// Create job queues
export const videoProcessingQueue = new Queue(QUEUE_NAMES.VIDEO_PROCESSING, {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const transcriptionQueue = new Queue(QUEUE_NAMES.TRANSCRIPTION, {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const embeddingsQueue = new Queue(QUEUE_NAMES.EMBEDDINGS, {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const highlightsQueue = new Queue(QUEUE_NAMES.HIGHLIGHTS, {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});

// Job data types
export interface VideoProcessingJobData {
  videoId: string;
  userId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  duration?: number;
}

export interface TranscriptionJobData {
  videoId: string;
  userId: string;
  audioPath: string;
  language?: string;
}

export interface EmbeddingsJobData {
  videoId: string;
  userId: string;
  transcriptSegments: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

export interface HighlightsJobData {
  videoId: string;
  userId: string;
  transcript: string;
  segments: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

// Job status tracking
export const getJobStatus = async (jobId: string) => {
  const job = await videoProcessingQueue.getJob(jobId) ||
              await transcriptionQueue.getJob(jobId) ||
              await embeddingsQueue.getJob(jobId) ||
              await highlightsQueue.getJob(jobId);
  
  if (!job) return null;
  
  return {
    id: job.id,
    state: await job.getState(),
    progress: job.progress(),
    data: job.data,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
};

// Queue monitoring
export const getQueueStats = async () => {
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
export const closeQueues = async () => {
  await Promise.all([
    videoProcessingQueue.close(),
    transcriptionQueue.close(),
    embeddingsQueue.close(),
    highlightsQueue.close(),
  ]);
  
  await redis.disconnect();
};

// Queue event listeners for logging
videoProcessingQueue.on('completed', (job) => {
  console.log(`Video processing job ${job.id} completed`);
});

videoProcessingQueue.on('failed', (job, err) => {
  console.error(`Video processing job ${job.id} failed:`, err);
});

transcriptionQueue.on('completed', (job) => {
  console.log(`Transcription job ${job.id} completed`);
});

transcriptionQueue.on('failed', (job, err) => {
  console.error(`Transcription job ${job.id} failed:`, err);
});

embeddingsQueue.on('completed', (job) => {
  console.log(`Embeddings job ${job.id} completed`);
});

embeddingsQueue.on('failed', (job, err) => {
  console.error(`Embeddings job ${job.id} failed:`, err);
});

highlightsQueue.on('completed', (job) => {
  console.log(`Highlights job ${job.id} completed`);
});

highlightsQueue.on('failed', (job, err) => {
  console.error(`Highlights job ${job.id} failed:`, err);
});
