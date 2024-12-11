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
            preload: 'auto',
            poster: '/video-poster.jpg', // Add a poster image if you have one
            userActions: {
                hotkeys: true,
                doubleClick: true
            },
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
                    {
                        name: 'SubtitlesButton',
                        button: {
                            class: 'vjs-subtitles-button'
                        }
                    },
                    {
                        name: 'PlaybackRateMenuButton',
                        button: {
                            class: 'vjs-playback-rate'
                        }
                    },
                    'fullscreenToggle',
                ]
            }
        })

        playerRef.current = player

        // Load saved progress
        const savedProgress = localStorage.getItem(`video-progress-${defaultVideo}`)
        if (savedProgress) {
            player.currentTime(parseFloat(savedProgress))
        }

        // Save progress periodically
        player.on('timeupdate', () => {
            localStorage.setItem(`video-progress-${defaultVideo}`, (player.currentTime() ?? 0).toString())
        })

        // Clear progress when video ends
        player.on('ended', () => {
            localStorage.removeItem(`video-progress-${defaultVideo}`)
        })

        // Add keyboard controls
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!playerRef.current) return;

            switch (e.key.toLowerCase()) {
                case 'arrowleft': {
                    const currentTime = playerRef.current.currentTime() ?? 0;
                    playerRef.current.currentTime(currentTime - 5);
                    break;
                }
                case 'arrowright': {
                    const currentTime = playerRef.current.currentTime() ?? 0;
                    playerRef.current.currentTime(currentTime + 5);
                    break;
                }
                case ' ':
                    if (playerRef.current.paused()) {
                        playerRef.current.play();
                    } else {
                        playerRef.current.pause();
                    }
                    e.preventDefault();
                    break;
                case 'f':
                    if (playerRef.current.isFullscreen()) {
                        playerRef.current.exitFullscreen();
                    } else {
                        playerRef.current.requestFullscreen();
                    }
                    break;
                case 'm':
                    playerRef.current.muted(!playerRef.current.muted());
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            if (playerRef.current) {
                playerRef.current.dispose()
                playerRef.current = null
            }
        }
    }, [defaultVideo, subtitlePath])

    return (
        <Card className="overflow-hidden shadow-2xl">
            <CardContent className="p-0">
                <div
                    key={defaultVideo} // Force remount when video changes
                    ref={containerRef}
                    data-vjs-player
                    className="aspect-video"
                />
            </CardContent>
        </Card>
    )
}

