'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { Trash2, Plus, ExternalLink, Hash } from 'lucide-react'

import { addBookmark, deleteBookmark } from '@/app/actions/bookmark'
import { useRouter } from 'next/navigation' // Keep for now if needed, but we rely on client fetch

type Bookmark = {
    id: string
    title: string
    url: string
    created_at: string
    user_id: string
}

export default function BookmarkApp({ user, initialBookmarks }: { user: any, initialBookmarks: Bookmark[] }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks || [])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const fetchBookmarks = async () => {
        const { data } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false })

        setBookmarks(data || [])
    }

    // Load initial data (Client-side fetch as requested)
    useEffect(() => {
        fetchBookmarks()
    }, [])

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('bookmarks-live')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    console.log('Realtime change:', payload)
                    fetchBookmarks() // reload automatically
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Realtime connected!')
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Helper to extract domain for favicon
    const getFaviconUrl = (url: string) => {
        try {
            // Use Google's favicon service for reliable high-res icons
            return `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`
        } catch {
            return ''
        }
    }

    return (
        <div className="min-h-screen bg-[#1F1F1F] text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-end mb-12">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.refresh()
                        }}
                        className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors backdrop-blur-sm"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 justify-items-center">
                    {/* Bookmark Items */}
                    {bookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="group relative flex flex-col items-center gap-3 w-28 group">
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-3 w-full"
                            >
                                <div className="w-12 h-12 bg-[#2D2D2D] rounded-full flex items-center justify-center p-2 shadow-lg hover:bg-[#3D3D3D] transition-all duration-200 ring-1 ring-white/5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getFaviconUrl(bookmark.url)}
                                        alt={bookmark.title}
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => {
                                            // Fallback if image fails
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                            (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span class="text-xl">🌐</span>'
                                        }}
                                    />
                                </div>
                                <span className="text-sm text-center text-gray-200 truncate w-full px-2 group-hover:text-white transition-colors">
                                    {bookmark.title}
                                </span>
                            </a>

                            {/* Delete Button (Visible on Hover) */}
                            <form action={deleteBookmark} className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <input type="hidden" name="id" value={bookmark.id} />
                                <button
                                    type="submit"
                                    className="bg-black/50 hover:bg-red-500/80 text-white rounded-full p-1 backdrop-blur-sm"
                                    title="Remove shortcut"
                                >
                                    <div className="w-3 h-3 flex items-center justify-center">✕</div>
                                </button>
                            </form>
                        </div>
                    ))}

                    {/* Add Shortcut Button */}
                    <div className="flex flex-col items-center gap-3 w-28 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                        <div className="w-12 h-12 bg-[#2D2D2D] rounded-full flex items-center justify-center shadow-lg hover:bg-[#3D3D3D] transition-all duration-200 ring-1 ring-white/5">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-center text-gray-200">Add shortcut</span>
                    </div>
                </div>
            </div>

            {/* Simple Modal for Adding Bookmark */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => {
                    if (e.target === e.currentTarget) setIsModalOpen(false)
                }}>
                    <div className="bg-[#2D2D2D] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-white/10 animation-fadeIn">
                        <h2 className="text-xl font-medium mb-6 text-center">Add shortcut</h2>
                        <form
                            action={async (formData) => {
                                await addBookmark(formData)
                                await fetchBookmarks()
                                setIsModalOpen(false)
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Name</label>
                                <input
                                    type="text"
                                    name="title"
                                    autoFocus
                                    className="w-full bg-[#1F1F1F] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-500 transition-all"
                                    placeholder="e.g. YouTube"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">URL</label>
                                <input
                                    type="url"
                                    name="url"
                                    className="w-full bg-[#1F1F1F] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-500 transition-all"
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
