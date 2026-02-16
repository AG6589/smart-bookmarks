import { createClient } from '@/utils/supabase/server'
import Login from '@/components/auth/Login'
import BookmarkApp from '@/components/bookmarks/BookmarkApp'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <Login />
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return <BookmarkApp user={user} initialBookmarks={bookmarks || []} />
}
