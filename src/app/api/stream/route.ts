import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get('path')

    if (!filePath) {
        return NextResponse.json({ error: 'No file path provided' }, { status: 400 })
    }

    const fullPath = join(process.cwd(), 'videos', filePath)

    try {
        const stats = await stat(fullPath)
        const fileSize = stats.size
        const range = request.headers.get('range')

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunksize = (end - start) + 1
            const file = createReadStream(fullPath, { start, end })
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/x-matroska',
            }
            return new NextResponse(file as any, { status: 206, headers: head as any })
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/x-matroska',
            }
            const file = createReadStream(fullPath)
            return new NextResponse(file as any, { headers: head as any })
        }
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
}

