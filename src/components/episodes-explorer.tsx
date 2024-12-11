'use client'

import { useState, useEffect, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileSystemItem {
    name: string
    isDirectory: boolean
    path: string
}

export function EpisodeExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    const [currentPath, setCurrentPath] = useState('')
    const [items, setItems] = useState<FileSystemItem[]>([])

    const currentItem = useMemo(() => searchParams.get('path'), [searchParams])

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
            setOpen(false);
        }
    }

    function toggleModal() {
        setOpen((prev) => !prev);
    }

    return (
        <>
            <button onClick={toggleModal} className="text-white/90 hover:text-white">
                <Layers className="h-8 w-8" />
            </button>

            <Dialog open={open} onOpenChange={toggleModal}>
                <DialogContent className="sm:max-w-[425px] md:max-w-[600px] bg-[#181818] text-white border-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Episodes</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="mt-4 max-h-[60vh] pr-4">
                        {items.map((item) => (
                            <button onClick={() => handleItemClick(item)} key={item.name}
                                className={cn('w-full mb-4 gap-4 hover:bg-[#232323] p-2 rounded transition-colors', currentItem === item.path && 'bg-red-600 hover:bg-red-600')}
                            >
                                {/* TODO: Add support for image preview */}
                                {/* <img
                                    src={episode.thumbnail}
                                    alt={`Thumbnail for ${episode.title}`}
                                    className="w-[140px] h-[80px] object-cover rounded"
                                /> */}

                                <div className="flex flex-col justify-between flex-grow">
                                    <div className='text-left'>
                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                        <p className={cn(`text-sm`, currentItem === item.path ? 'text-white' : 'text-gray-400')}>{item.path}</p>
                                    </div>
                                    {/* TODO: Add support for duration */}
                                    {/* <p className="text-sm text-gray-400">{episode.duration}</p> */}
                                </div>
                            </button>
                        ))}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    )
}

