'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { Trash2, Plus, ExternalLink, Hash } from 'lucide-react'

type Bookmark = {
    id: string
    title: string
    url: string
    created_at: string
    user_id: string
}

export default function BookmarkApp({ user, initialBookmarks }: { user: any, initialBookmarks: Bookmark[] }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
    const [newUrl, setNewUrl] = useState('')
    const [newTitle, setNewTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Realtime subscription
        const channel = supabase
            .channel('realtime-bookmarks')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${user.id}`, // Filter by user_id just in case
                },
                (payload) => {
                    console.log('Realtime change:', payload)
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((prev) => [payload.new as Bookmark, ...prev])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, user.id])

    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUrl || !newTitle) return

        setLoading(true)
        const { error } = await supabase.from('bookmarks').insert({
            title: newTitle,
            url: newUrl,
            user_id: user.id
        })

        if (error) {
            alert('Error adding bookmark: ' + error.message)
        } else {
            setNewTitle('')
            setNewUrl('')
        }
        setLoading(false)
    }

    const deleteBookmark = async (id: string) => {
        const { error } = await supabase.from('bookmarks').delete().eq('id', id)
        if (error) {
            alert('Error deleting bookmark')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Hash className="w-8 h-8 text-indigo-500" />
                    Smart Bookmarks
                </h1>
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                    Sign Out
                </button>
            </div>

            {/* Add New Bookmark Form */}
            <form onSubmit={addBookmark} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 mb-8 border border-gray-100 dark:border-gray-800">
                <input
                    type="text"
                    placeholder="Bookmark Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    required
                />
                <input
                    type="url"
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Plus className="w-6 h-6" />}
                </button>
            </form>

            {/* Bookmark List */}
            <div className="grid gap-4" ref={listRef}>
                {bookmarks.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No bookmarks yet. Add one above!
                    </div>
                ) : (
                    bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="group bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all flex justify-between items-center animate-in fade-in slide-in-from-bottom-4 duration-300"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                                    {bookmark.title}
                                </h3>
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 truncate block flex items-center gap-1 group-hover:underline"
                                >
                                    {bookmark.url}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                            <button
                                onClick={() => deleteBookmark(bookmark.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Delete bookmark"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
