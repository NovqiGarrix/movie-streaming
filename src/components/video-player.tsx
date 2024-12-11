'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'
import './video-player.css'

export function VideoPlayer() {
    const playerRef = useRef<Player | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()

    const defaultVideo = useMemo(() => searchParams.get('path') || '[Movieku.cc].GgsOfLdnS2E01.Eps-01.720p.x264.WebDL.mp4', [searchParams])
    const subtitlePath = useMemo(() => {
        const [filename] = defaultVideo.split('.mp4')
        return `/subtitles/${filename}.vtt`
    }, [defaultVideo])

    useEffect(() => {
        const videoElement = document.createElement('video')
        videoElement.className = 'video-js vjs-big-play-centered vjs-theme-modern'

        if (containerRef.current) {
            containerRef.current.innerHTML = ''
            containerRef.current.appendChild(videoElement)
        }

        const player = videojs(videoElement, {
            controls: true,
            fluid: true,
            responsive: true,
            playbackRates: [0.5, 1, 1.5, 2],
            sources: [{
                src: `/api/stream?path=${defaultVideo}`,
                type: 'video/mp4'
            }],
            tracks: [{
                kind: 'subtitles',
                src: subtitlePath,
                srclang: 'en',
                label: 'English',
                default: true
            }],
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'subtitlesButton',
                    'playbackRateMenuButton',
                    'fullscreenToggle',
                ]
            }
        })

        playerRef.current = player

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose()
                playerRef.current = null
            }
        }
    }, [defaultVideo, subtitlePath])

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div
                    key={defaultVideo} // Force remount when video changes
                    ref={containerRef}
                    data-vjs-player
                />
            </CardContent>
        </Card>
    )
}

