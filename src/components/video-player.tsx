'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'
import './video-player.css'
import { ArrowLeft, HelpCircle, Maximize, Minimize, Subtitles } from 'lucide-react'

export function VideoPlayer() {
    const playerRef = useRef<Player | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()

    const defaultVideo = useMemo(() => searchParams.get('path') || '[Movieku.cc].GgsOfLdnS2E01.Eps-01.720p.x264.WebDL.mp4', [searchParams])
    const subtitlePath = useMemo(() => {
        const [filename] = defaultVideo.split('.mp4')
        return `/subtitles/${filename}.vtt`
    }, [defaultVideo])

    const [videoTitle, setVideoTitle] = useState('Big Buck Bunny')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

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
        }, function onPlayerReady() {
            videojs.log('Player is ready')

            this.on('timeupdate', () => {
                setCurrentTime(this.currentTime() || 0)
            })

            this.on('loadedmetadata', () => {
                setDuration(this.duration() || 0)
            })

            this.on('fullscreenchange', () => {
                setIsFullscreen(this.isFullscreen() || false)
            })
        })

        playerRef.current = player

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose()
                playerRef.current = null
            }
        }
    }, [defaultVideo, subtitlePath]);

    const handleFullscreenToggle = () => {
        if (playerRef.current) {
            if (playerRef.current.isFullscreen()) {
                playerRef.current.exitFullscreen()
            } else {
                playerRef.current.requestFullscreen()
            }
        }
    }

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000)
        const hh = date.getUTCHours()
        const mm = date.getUTCMinutes()
        const ss = date.getUTCSeconds().toString().padStart(2, '0')
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
        }
        return `${mm}:${ss}`
    }

    const handlePlayPause = () => {
        if (playerRef.current) {
            if (playerRef.current.paused()) {
                playerRef.current.play()
            } else {
                playerRef.current.pause()
            }
        }
    }

    const handleSeek = (time: number) => {
        if (playerRef.current) {
            playerRef.current.currentTime(time)
        }
    }

    return (
        <div
            className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0' : 'aspect-video'} group`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isFullscreen && setShowControls(false)}
        >
            <div
                key={defaultVideo} // Force remount when video changes
                ref={containerRef}
                data-vjs-player
            />

            <div className={`absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <button className="absolute top-4 left-4 text-white/90 hover:text-white z-10">
                    <ArrowLeft className="w-8 h-8" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                    <div className="relative w-full h-1 mb-4 group cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const pos = (e.clientX - rect.left) / rect.width
                            handleSeek(duration * pos)
                        }}>
                        <div className="absolute inset-0 bg-white/30">
                            <div
                                className="h-full bg-red-600"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlayPause}
                            className="text-white/90 hover:text-white"
                        >
                            {playerRef.current?.paused() ? (
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14h2V5H8zm6 0v14h2V5h-2z" />
                                </svg>
                            )}
                        </button>

                        <span className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        <span className="text-white text-lg ml-4">{videoTitle}</span>

                        <div className="flex items-center gap-4 ml-auto">
                            <button className="text-white/90 hover:text-white">
                                <HelpCircle className="w-7 h-7" />
                            </button>
                            <button className="text-white/90 hover:text-white">
                                <Subtitles className="w-7 h-7" />
                            </button>
                            <button
                                className="text-white/90 hover:text-white"
                                onClick={handleFullscreenToggle}
                            >
                                {isFullscreen ? (
                                    <Minimize className="w-7 h-7" />
                                ) : (
                                    <Maximize className="w-7 h-7" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

