import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { videoProcessingQueue } from '@/lib/queue';
import { getVideoInfo } from '@/lib/video-processing';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Get video record
    const video = await prisma.video.findUnique({
      where: { 
        id: videoId,
        userId: (session.user as any).id,
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.status !== 'UPLOADING') {
      return NextResponse.json({ 
        error: 'Video is already being processed or completed',
        status: video.status 
      }, { status: 400 });
    }

    // Get video information for processing
    const videoInfo = await getVideoInfo(video.filePath);
    
    if (!videoInfo.isValid) {
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });
      
      return NextResponse.json({ 
        error: 'Invalid video file format' 
      }, { status: 400 });
    }

    // Add video processing job to queue
    const job = await videoProcessingQueue.add('process-video', {
      videoId,
      userId: (session.user as any).id,
      filePath: video.filePath,
      fileName: video.fileName,
      fileSize: Number(video.fileSize),
      duration: videoInfo.metadata.duration,
    });

    // Update video status
    await prisma.video.update({
      where: { id: videoId },
      data: { 
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      videoId,
      estimatedTime: videoInfo.processingRecommendations.estimatedTranscriptionTime,
      processingRecommendations: videoInfo.processingRecommendations,
    });

  } catch (error) {
    console.error('Video processing API error:', error);
    return NextResponse.json(
      { error: 'Failed to start video processing' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Get video with processing status
    const video = await prisma.video.findUnique({
      where: { 
        id: videoId,
        userId: (session.user as any).id,
      },
      include: {
        transcript: {
          include: {
            segments: true,
          },
        },
        highlights: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        status: video.status,
        duration: video.duration,
        thumbnailPath: video.thumbnailPath,
        transcript: video.transcript ? {
          id: video.transcript.id,
          language: video.transcript.language,
          content: video.transcript.content,
          confidence: video.transcript.confidence,
          segmentCount: video.transcript.segments.length,
        } : null,
        highlights: video.highlights.map(h => ({
          id: h.id,
          title: h.title,
          description: h.description,
          type: h.type,
          startTime: h.startTime,
          endTime: h.endTime,
          score: h.score,
          tags: h.tags,
        })),
      },
    });

  } catch (error) {
    console.error('Get video processing status error:', error);
    return NextResponse.json(
      { error: 'Failed to get video processing status' },
      { status: 500 }
    );
  }
}
