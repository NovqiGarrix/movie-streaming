'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, Maximize2Icon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export function VideoPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)
    const searchParams = useSearchParams();

    const defaultVideo = useMemo(() => searchParams.get('path') || '[Movieku.cc].GgsOfLdnS2E01.Eps-01.720p.x264.WebDL.mp4', [searchParams]);
    const subtitlePath = useMemo(() => {
        const [filename] = defaultVideo.split('.mp4');
        return `/subtitles/${filename}.srt`;
    }, [searchParams]);

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const updateTime = () => setCurrentTime(video.currentTime)
        const updateDuration = () => setDuration(video.duration)

        video.addEventListener('timeupdate', updateTime)
        video.addEventListener('loadedmetadata', updateDuration)

        return () => {
            video.removeEventListener('timeupdate', updateTime)
            video.removeEventListener('loadedmetadata', updateDuration)
        }
    }, [])

    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            video.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleSeek = (value: number[]) => {
        const video = videoRef.current
        if (!video) return

        video.currentTime = value[0]
        setCurrentTime(value[0])
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const skipBack = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime -= 10
    }

    const skipForward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += 10
    }

    const toggleFullscreen = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            video.requestFullscreen()
        }
    }, [])

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'f') {
                toggleFullscreen()
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [toggleFullscreen])

    const onFullScreenClick = () => {
        toggleFullscreen()
    }

    return (
        <Card>
            <CardContent className="p-0 relative">
                <video
                    ref={videoRef}
                    className="w-full"
                    src={`/api/stream?path=${defaultVideo}`}
                    crossOrigin="anonymous"
                    style={{ '--webkit-media-text-track-display': 'inline' } as React.CSSProperties}
                    controls
                >
                    <track
                        kind="subtitles"
                        src={decodeURIComponent(subtitlePath)}
                        srcLang="en"
                        label="English"
                        default
                    />
                </video>
                <div className="p-4">
                    <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={handleSeek}
                        className="mb-4"
                    />
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <Button size="icon" variant="outline" onClick={skipBack}>
                                <SkipBackIcon />
                            </Button>
                            <Button size="icon" variant="outline" onClick={togglePlay}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </Button>
                            <Button size="icon" variant="outline" onClick={skipForward}>
                                <SkipForwardIcon />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={onFullScreenClick}
                            >
                                <Maximize2Icon className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

