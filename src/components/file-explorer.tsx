'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileIcon, FolderIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

type FileSystemItem = {
    name: string
    isDirectory: boolean
    path: string
}

export function FileExplorer() {
    const router = useRouter();

    const [currentPath, setCurrentPath] = useState('')
    const [items, setItems] = useState<FileSystemItem[]>([])

    useEffect(() => {
        fetchItems(currentPath)
    }, [currentPath])

    const fetchItems = async (path: string) => {
        const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`)
        const data = await response.json()
        setItems(data)
    }

    const handleItemClick = (item: FileSystemItem) => {
        if (item.isDirectory) {
            setCurrentPath(item.path)
        } else {
            router.push(`/?path=${encodeURIComponent(item.path)}`)
        }
    }

    const handleBackClick = () => {
        const parentPath = currentPath.split('/').slice(0, -1).join('/')
        setCurrentPath(parentPath)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>File Explorer</CardTitle>
            </CardHeader>
            <CardContent>
                <Button onClick={handleBackClick} disabled={!currentPath} className="mb-4">
                    Back
                </Button>
                <ScrollArea className="h-[400px]">
                    {items.map((item) => (
                        <Button
                            key={item.name}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => handleItemClick(item)}
                        >
                            {item.isDirectory ? <FolderIcon className="mr-2" /> : <FileIcon className="mr-2" />}
                            {item.name}
                        </Button>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

