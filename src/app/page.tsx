import { VideoPlayer } from '@/components/video-player'

export const dynamic = 'force-dynamic';

export default async function Home() {

  const resp = await fetch('http://localhost:3000/api/files', { headers: { 'Content-Type': 'application/json' } });
  const files = await resp.json();

  return (
    <VideoPlayer defaultVideo={files[0].name} />
  )
}

