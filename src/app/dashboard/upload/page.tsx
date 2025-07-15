'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, CheckCircle, AlertCircle, Play, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadProgress {
  percentage: number
  status: 'uploading' | 'uploaded' | 'processing' | 'transcribing' | 'analyzing' | 'complete' | 'error'
  message?: string
}

interface UploadedFile {
  file: File
  id: string
  videoId?: string
  progress: UploadProgress
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ACCEPTED_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']

export default function VideoUploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }, [])

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert(`File ${file.name} is not a supported video format`)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large (max 500MB)`)
        return false
      }
      return true
    })

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: {
        percentage: 0,
        status: 'uploading'
      }
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Start real upload for each file
    newFiles.forEach(uploadFile => uploadFileToServer(uploadFile))
  }

  const uploadFileToServer = async (uploadFile: UploadedFile) => {
    try {
      const formData = new FormData()
      formData.append('video', uploadFile.file)
      formData.append('title', uploadFile.file.name.replace(/\.[^/.]+$/, ''))

      // Upload with progress tracking
      const xhr = new XMLHttpRequest()
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100)
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { 
                    ...f, 
                    progress: { 
                      ...f.progress, 
                      percentage,
                      message: `Uploading... ${percentage}%`
                    } 
                  }
                : f
            )
          )
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { 
                    ...f, 
                    videoId: response.videoId,
                    progress: { 
                      percentage: 100, 
                      status: 'uploaded',
                      message: 'Upload complete - Ready for AI processing'
                    } 
                  }
                : f
            )
          )
        } else {
          throw new Error('Upload failed')
        }
      }

      xhr.onerror = () => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { 
                  ...f, 
                  progress: { 
                    percentage: 0, 
                    status: 'error',
                    message: 'Upload failed'
                  } 
                }
              : f
          )
        )
      }

      xhr.open('POST', '/api/upload')
      xhr.send(formData)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                progress: { 
                  percentage: 0, 
                  status: 'error',
                  message: 'Upload failed'
                } 
              }
            : f
        )
      )
    }
  }

  const startAIProcessing = async (uploadFile: UploadedFile) => {
    if (!uploadFile.videoId) return

    try {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                progress: { 
                  percentage: 10, 
                  status: 'processing',
                  message: 'Starting AI processing...'
                } 
              }
            : f
        )
      )

      const response = await fetch('/api/videos/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: uploadFile.videoId }),
      })

      if (!response.ok) {
        throw new Error('Failed to start processing')
      }

      const data = await response.json()
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                progress: { 
                  percentage: 20, 
                  status: 'processing',
                  message: 'Video processing started...'
                } 
              }
            : f
        )
      )

      // Poll for processing status
      pollProcessingStatus(uploadFile)

    } catch (error) {
      console.error('Processing error:', error)
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                progress: { 
                  percentage: 0, 
                  status: 'error',
                  message: 'Processing failed'
                } 
              }
            : f
        )
      )
    }
  }

  const pollProcessingStatus = async (uploadFile: UploadedFile) => {
    if (!uploadFile.videoId) return

    const poll = async () => {
      try {
        const response = await fetch(`/api/videos/process?videoId=${uploadFile.videoId}`)
        const data = await response.json()
        
        if (data.video) {
          const status = data.video.status
          let progress = 30
          let message = 'Processing...'

          switch (status) {
            case 'PROCESSING':
              progress = 40
              message = 'Extracting metadata and audio...'
              break
            case 'TRANSCRIBING':
              progress = 60
              message = 'Transcribing audio with AI...'
              break
            case 'ANALYZING':
              progress = 80
              message = 'Generating highlights and insights...'
              break
            case 'COMPLETED':
              progress = 100
              message = 'AI processing complete!'
              break
            case 'FAILED':
              setUploadedFiles(prev => 
                prev.map(f => 
                  f.id === uploadFile.id 
                    ? { 
                        ...f, 
                        progress: { 
                          percentage: 0, 
                          status: 'error',
                          message: 'AI processing failed'
                        } 
                      }
                    : f
                )
              )
              return
          }

          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { 
                    ...f, 
                    progress: { 
                      percentage: progress, 
                      status: status === 'COMPLETED' ? 'complete' : 'processing',
                      message
                    } 
                  }
                : f
            )
          )

          if (status !== 'COMPLETED') {
            setTimeout(poll, 3000) // Poll every 3 seconds
          }
        }
      } catch (error) {
        console.error('Status polling error:', error)
      }
    }

    poll()
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'uploaded':
        return <File className="h-5 w-5 text-blue-500" />
      case 'processing':
      case 'transcribing':
      case 'analyzing':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />
      default:
        return <Upload className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'uploaded':
        return 'bg-blue-500'
      case 'processing':
      case 'transcribing':
      case 'analyzing':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Videos</h1>
        <p className="text-gray-600">
          Upload your videos to start AI-powered transcription and analysis
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Drop your videos here, or click to browse
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Supports MP4, AVI, MOV, WMV, WebM (Max 500MB per file)
        </p>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4"
        >
          Choose Files
        </Button>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h2>
          
          <div className="space-y-4">
            {uploadedFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(uploadFile.progress.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadFile.file.size)} • {uploadFile.progress.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadFile.progress.status === 'uploaded' && (
                      <Button
                        onClick={() => startAIProcessing(uploadFile)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Start AI Processing
                      </Button>
                    )}
                    
                    {uploadFile.progress.status === 'complete' && uploadFile.videoId && (
                      <Button
                        onClick={() => window.open(`/dashboard/videos/${uploadFile.videoId}`, '_blank')}
                        size="sm"
                        variant="outline"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        View Video
                      </Button>
                    )}
                    
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {uploadFile.progress.status !== 'complete' && uploadFile.progress.status !== 'error' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{uploadFile.progress.message}</span>
                      <span>{uploadFile.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(uploadFile.progress.status)}`}
                        style={{ width: `${uploadFile.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Success Message */}
                {uploadFile.progress.status === 'complete' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-green-800">
                        Video processing complete! AI analysis, transcription, and highlights are ready.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Error Message */}
                {uploadFile.progress.status === 'error' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-800">
                        {uploadFile.progress.message || 'An error occurred during processing.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🤖 AI Processing Features
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <strong>Smart Transcription</strong>
            <p>High-accuracy speech-to-text with speaker identification</p>
          </div>
          <div>
            <strong>Auto Highlights</strong>
            <p>AI identifies key moments, decisions, and important discussions</p>
          </div>
          <div>
            <strong>Semantic Search</strong>
            <p>Find content by meaning, not just keywords</p>
          </div>
        </div>
      </div>
    </div>
  )
}
