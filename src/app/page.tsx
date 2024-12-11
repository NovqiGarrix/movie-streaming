import { FileExplorer } from '@/components/file-explorer'
import { VideoPlayer } from '@/components/video-player'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">MKV Video Streamer</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <FileExplorer />
        </div>
        <div className="md:col-span-2">
          <VideoPlayer />
        </div>
      </div>
    </div>
  )
}

