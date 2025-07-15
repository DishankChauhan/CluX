import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';
import { promisify } from 'util';

// Set FFmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  size: number;
}

export interface AudioExtractionOptions {
  format?: 'wav' | 'mp3' | 'flac';
  sampleRate?: number;
  channels?: number;
  quality?: number;
}

/**
 * Extract metadata from a video file
 */
export const extractVideoMetadata = async (filePath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to extract metadata: ${err.message}`));
        return;
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      const duration = parseFloat(String(metadata.format.duration || '0'));
      const size = parseInt(String(metadata.format.size || '0'));

      resolve({
        duration,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: parseFloat(videoStream.r_frame_rate?.split('/')[0] || '0') / 
             parseFloat(videoStream.r_frame_rate?.split('/')[1] || '1'),
        bitrate: parseInt(String(metadata.format.bit_rate || '0')),
        codec: videoStream.codec_name || 'unknown',
        size,
      });
    });
  });
};

/**
 * Extract audio from video for transcription
 */
export const extractAudio = async (
  videoPath: string,
  outputPath: string,
  options: AudioExtractionOptions = {}
): Promise<string> => {
  const {
    format = 'wav',
    sampleRate = 16000,
    channels = 1,
    quality = 2
  } = options;

  return new Promise((resolve, reject) => {
    const command = ffmpeg(videoPath)
      .audioCodec('pcm_s16le')
      .audioFrequency(sampleRate)
      .audioChannels(channels)
      .format(format)
      .output(outputPath);

    if (format === 'mp3') {
      command.audioCodec('mp3').audioQuality(quality);
    }

    command
      .on('start', (commandLine) => {
        console.log('Started audio extraction:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Audio extraction progress: ${progress.percent?.toFixed(2)}%`);
      })
      .on('end', () => {
        console.log('Audio extraction completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Audio extraction failed:', err);
        reject(new Error(`Audio extraction failed: ${err.message}`));
      })
      .run();
  });
};

/**
 * Generate video thumbnail
 */
export const generateThumbnail = async (
  videoPath: string,
  outputPath: string,
  timeOffset: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timeOffset)
      .frames(1)
      .size('320x240')
      .format('png')
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('Started thumbnail generation:', commandLine);
      })
      .on('end', () => {
        console.log('Thumbnail generation completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Thumbnail generation failed:', err);
        reject(new Error(`Thumbnail generation failed: ${err.message}`));
      })
      .run();
  });
};

/**
 * Generate multiple thumbnails at different timestamps
 */
export const generateThumbnails = async (
  videoPath: string,
  outputDir: string,
  count: number = 5,
  duration?: number
): Promise<string[]> => {
  if (!duration) {
    const metadata = await extractVideoMetadata(videoPath);
    duration = metadata.duration;
  }

  const thumbnailPaths: string[] = [];
  const interval = duration / (count + 1);

  for (let i = 1; i <= count; i++) {
    const timeOffset = interval * i;
    const outputPath = path.join(outputDir, `thumbnail_${i}.png`);
    
    try {
      await generateThumbnail(videoPath, outputPath, timeOffset);
      thumbnailPaths.push(outputPath);
    } catch (error) {
      console.error(`Failed to generate thumbnail ${i}:`, error);
    }
  }

  return thumbnailPaths;
};

/**
 * Convert video to web-optimized format
 */
export const optimizeForWeb = async (
  inputPath: string,
  outputPath: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    bitrate?: string;
    crf?: number;
  } = {}
): Promise<string> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    bitrate = '2M',
    crf = 23
  } = options;

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .addOption('-movflags', 'faststart') // Enable progressive download
      .addOption('-preset', 'medium')
      .addOption('-crf', crf.toString())
      .size(`${maxWidth}x${maxHeight}`)
      .videoBitrate(bitrate)
      .output(outputPath);

    command
      .on('start', (commandLine) => {
        console.log('Started video optimization:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Video optimization progress: ${progress.percent?.toFixed(2)}%`);
      })
      .on('end', () => {
        console.log('Video optimization completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Video optimization failed:', err);
        reject(new Error(`Video optimization failed: ${err.message}`));
      })
      .run();
  });
};

/**
 * Validate video file format and codec
 */
export const validateVideoFile = async (filePath: string): Promise<boolean> => {
  try {
    const metadata = await extractVideoMetadata(filePath);
    
    // Check if video has valid duration and streams
    if (metadata.duration <= 0) {
      return false;
    }

    // Check supported formats
    const supportedFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'];
    const extension = path.extname(filePath).toLowerCase().slice(1);
    
    return supportedFormats.includes(extension);
  } catch (error) {
    console.error('Video validation failed:', error);
    return false;
  }
};

/**
 * Clean up temporary files
 */
export const cleanupTempFiles = async (filePaths: string[]): Promise<void> => {
  const deletePromises = filePaths.map(async (filePath) => {
    try {
      await fs.unlink(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  });

  await Promise.all(deletePromises);
};

/**
 * Get video file info for processing
 */
export const getVideoInfo = async (filePath: string) => {
  const [metadata, isValid] = await Promise.all([
    extractVideoMetadata(filePath),
    validateVideoFile(filePath)
  ]);

  return {
    metadata,
    isValid,
    processingRecommendations: {
      needsOptimization: metadata.bitrate > 5000000, // 5Mbps
      needsResize: metadata.width > 1920 || metadata.height > 1080,
      estimatedTranscriptionTime: Math.ceil(metadata.duration / 4), // ~4x realtime
    }
  };
};
