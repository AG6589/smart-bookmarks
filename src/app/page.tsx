import { createClient } from '@/utils/supabase/server'
import Login from '@/components/auth/Login'
import BookmarkApp from '@/components/bookmarks/BookmarkApp'

export default async function Home() {
  const supabase = await createClient()

  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser()
    user = fetchedUser
  } catch (error) {
    console.error('Home Page Auth Error:', error)
  }

  if (!user) {
    return <Login />
  }

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
  }

  return <BookmarkApp user={user} initialBookmarks={bookmarks || []} />
}
