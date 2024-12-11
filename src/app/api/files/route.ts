import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises';
import { join } from 'path'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path') || ''

    const fullPath = join(process.cwd(), 'videos', path)

    try {
        const dirs = await readdir(fullPath)
        const items = await Promise.all(dirs.map(async (directory) => {
            const itemPath = join(fullPath, directory)
            const stats = await stat(itemPath)
            return {
                name: directory,
                isDirectory: stats.isDirectory(),
                path: join(path, directory)
            }
        }));

        return NextResponse.json(items)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Unable to read directory' }, { status: 500 })
    }
}

