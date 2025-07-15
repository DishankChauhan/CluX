export interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
  preferences?: any
}

export interface Video {
  id: string
  title: string
  description?: string | null
  fileName: string
  filePath: string
  fileSize: bigint
  duration?: number | null
  thumbnailPath?: string | null
  mimeType: string
  status: VideoStatus
  metadata?: any
  createdAt: Date
  updatedAt: Date
  userId: string
}

export type VideoStatus = 'UPLOADING' | 'PROCESSING' | 'TRANSCRIBING' | 'ANALYZING' | 'COMPLETED' | 'FAILED'

export interface Transcript {
  id: string
  content: string
  language?: string | null
  confidence?: number | null
  createdAt: Date
  updatedAt: Date
  videoId: string
}

export interface TranscriptSegment {
  id: string
  text: string
  startTime: number
  endTime: number
  speaker?: string | null
  confidence?: number | null
  createdAt: Date
  transcriptId: string
}

export interface Highlight {
  id: string
  title: string
  description?: string | null
  startTime: number
  endTime: number
  type: HighlightType
  score?: number | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  videoId: string
}

export type HighlightType = 'AI_GENERATED' | 'USER_CREATED' | 'QUESTION' | 'KEY_POINT' | 'SPEAKER_CHANGE' | 'TOPIC_TRANSITION'

export interface Bookmark {
  id: string
  title: string
  description?: string | null
  timestamp: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
  videoId: string
  userId: string
}

export interface UploadProgress {
  percentage: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  message?: string
}
