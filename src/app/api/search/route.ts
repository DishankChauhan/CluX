import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateEmbeddings } from '@/lib/ai-services';

// Extend the session user type to include 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, videoId, limit = 10 } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // For now, implement simple text search until embeddings are enabled
    // Generate embedding for search query
    // const queryEmbedding = await generateEmbeddings([query]);
    
    // Simple text search in transcripts
    const searchConditions: any = {
      user: { id: (session.user as any).id },
      status: 'COMPLETED',
      transcript: {
        isNot: null,
      },
    };

    if (videoId) {
      searchConditions.id = videoId;
    }

    const videos = await prisma.video.findMany({
      where: searchConditions,
      include: {
        transcript: {
          include: {
            segments: {
              where: {
                text: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              orderBy: {
                startTime: 'asc',
              },
            },
          },
        },
        highlights: {
          where: {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter videos that have matching segments or highlights
    const results = videos
      .filter(video => 
        (video.transcript?.segments && video.transcript.segments.length > 0) ||
        (video.highlights && video.highlights.length > 0)
      )
      .map(video => ({
        video: {
          id: video.id,
          title: video.title,
          description: video.description,
          duration: video.duration,
          thumbnailPath: video.thumbnailPath,
          createdAt: video.createdAt,
        },
        matches: {
          segments: video.transcript?.segments.map(segment => ({
            id: segment.id,
            text: segment.text,
            startTime: segment.startTime,
            endTime: segment.endTime,
            confidence: segment.confidence,
          })) || [],
          highlights: video.highlights.map(highlight => ({
            id: highlight.id,
            title: highlight.title,
            description: highlight.description,
            type: highlight.type,
            startTime: highlight.startTime,
            endTime: highlight.endTime,
            score: highlight.score,
          })),
        },
      }));

    return NextResponse.json({
      query,
      results,
      count: results.length,
      searchType: 'text', // Will be 'semantic' when embeddings are enabled
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
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

    // Get all transcript segments for a video
    const video = await prisma.video.findUnique({
      where: { 
        id: videoId,
        userId: (session.user as any).id,
      },
      include: {
        transcript: {
          include: {
            segments: {
              orderBy: {
                startTime: 'asc',
              },
            },
          },
        },
        highlights: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        duration: video.duration,
        status: video.status,
      },
      transcript: video.transcript ? {
        id: video.transcript.id,
        content: video.transcript.content,
        language: video.transcript.language,
        confidence: video.transcript.confidence,
        segments: video.transcript.segments.map(segment => ({
          id: segment.id,
          text: segment.text,
          startTime: segment.startTime,
          endTime: segment.endTime,
          speaker: segment.speaker,
          confidence: segment.confidence,
        })),
      } : null,
      highlights: video.highlights.map(highlight => ({
        id: highlight.id,
        title: highlight.title,
        description: highlight.description,
        type: highlight.type,
        startTime: highlight.startTime,
        endTime: highlight.endTime,
        score: highlight.score,
        tags: highlight.tags,
      })),
    });

  } catch (error) {
    console.error('Get video content error:', error);
    return NextResponse.json(
      { error: 'Failed to get video content' },
      { status: 500 }
    );
  }
}
