'use client'

import { useRef, useEffect } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  src: string
  poster?: string
  onReady?: (player: any) => void
  onTimeUpdate?: (currentTime: number) => void
}

export default function VideoPlayer({ 
  src, 
  poster, 
  onReady, 
  onTimeUpdate 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Video.js player
    if (videoRef.current && !playerRef.current) {
      const videoElement = videoRef.current
      
      playerRef.current = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        poster: poster,
        sources: [
          {
            src: src,
            type: 'video/mp4'
          }
        ]
      })

      // Handle ready event
      playerRef.current.ready(() => {
        console.log('Video player is ready')
        if (onReady) {
          onReady(playerRef.current)
        }
      })

      // Handle time updates
      if (onTimeUpdate) {
        playerRef.current.on('timeupdate', () => {
          const currentTime = playerRef.current.currentTime()
          onTimeUpdate(currentTime)
        })
      }
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src, poster, onReady, onTimeUpdate])

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        className="video-js vjs-default-skin"
        playsInline
        data-setup="{}"
      />
    </div>
  )
}
