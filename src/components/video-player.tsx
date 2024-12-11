'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'
import './video-player.css'
import { ArrowLeft, Maximize, Minimize, RotateCcw, RotateCw, Captions, CaptionsOff } from 'lucide-react'
import { EpisodeExplorer } from './episodes-explorer'

const SEEK_STEP = 10;

export function VideoPlayer() {
    const playerRef = useRef<Player | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()
    const rotateCwElement = useRef<SVGSVGElement>(null);
    const rotateCcwElement = useRef<SVGSVGElement>(null);
    const [textTrackOn, setTextTrackOn] = useState(true);

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
            controls: false,
            fluid: true,
            responsive: true,
            playbackRates: [0.5, 1, 1.5, 2],
            preload: 'auto',
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
                    if (!rotateCcwElement.current) return;
                    const currentTime = playerRef.current.currentTime() ?? 0;
                    rotateCcwElement.current.classList.add('rotate-45');
                    playerRef.current.currentTime(currentTime - SEEK_STEP < 0 ? 0 : currentTime - SEEK_STEP);

                    setTimeout(() => {
                        if (rotateCcwElement.current) {
                            rotateCcwElement.current.classList.remove('rotate-45');
                        }
                    }, 300);
                    break;
                }
                case 'arrowright': {
                    if (!rotateCwElement.current) return;
                    const currentTime = playerRef.current.currentTime() ?? 0;
                    rotateCwElement.current.classList.add('rotate-45');
                    playerRef.current.currentTime(currentTime + SEEK_STEP);

                    setTimeout(() => {
                        if (rotateCwElement.current) {
                            rotateCwElement.current.classList.remove('rotate-45');
                        }
                    }, 300);
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

    function toggleSubtitle() {
        // @ts-expect-error - textTracks is not in the types
        const track = playerRef.current?.textTracks()[0]
        console.log(track)
        if (track) {
            track.mode = track.mode === 'showing' ? 'hidden' : 'showing'
            setTextTrackOn(track.mode === 'showing');
        }
    }

    return (
        <div
            className={`relative w-full max-h-screen overflow-hidden ${isFullscreen ? 'fixed inset-0' : 'aspect-video'} group`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isFullscreen && setShowControls(false)}
        >
            <div
                key={defaultVideo} // Force remount when video changes
                ref={containerRef}
                data-vjs-player
            />

            <div className={`absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* BACK ARROW */}
                <button className="absolute top-7 left-[46px] text-white/90 hover:text-white z-10">
                    <ArrowLeft className="w-8 h-8" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 px-12 pb-8">
                    <div className="flex items-center gap-5 mb-4">
                        <div className="relative w-full h-1 group cursor-pointer"
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
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 duration-150 transition-opacity"
                                    style={{ left: `${(currentTime / duration) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-white text-sm font-medium">
                            {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlayPause}
                            className="text-white/90 hover:text-white"
                        >
                            {playerRef.current?.paused() ? (
                                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14h2V5H8zm6 0v14h2V5h-2z" />
                                </svg>
                            )}
                        </button>

                        <button className="text-white/90 hover:text-white">
                            <div className="relative">
                                <RotateCcw ref={rotateCcwElement} className="w-9 h-9 transform transition-transform duration-300" />
                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs p-0.5 font-medium">
                                    10
                                </span>
                            </div>
                        </button>

                        <button className="text-white/90 hover:text-white">
                            <div className="relative">
                                <RotateCw ref={rotateCwElement} className="w-9 h-9 transform transition-transform duration-300" />
                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs p-0.5 font-medium">
                                    10
                                </span>
                            </div>
                        </button>

                        <span className="text-white text-lg ml-4">{videoTitle}</span>

                        <div className="flex items-center gap-6 ml-auto">
                            <EpisodeExplorer />

                            <button onClick={toggleSubtitle} className="text-white/90 hover:text-white">
                                {textTrackOn ? <Captions className="w-9 h-9" /> : <CaptionsOff className="w-9 h-9" />}
                            </button>
                            <button
                                className="text-white/90 hover:text-white"
                                onClick={handleFullscreenToggle}
                            >
                                {isFullscreen ? (
                                    <Minimize className="w-8 h-8" />
                                ) : (
                                    <Maximize className="w-8 h-8" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

