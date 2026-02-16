'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addBookmark(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const title = formData.get('title') as string
    const url = formData.get('url') as string

    if (!title || !url) return

    try {
        const { error } = await supabase.from('bookmarks').insert({
            title,
            url,
            user_id: user.id,
        })

        if (error) {
            console.error('Error inserting bookmark:', error)
            // handling error in server action is tricky without useFormState, 
            // but for now we just log it.
        }

        revalidatePath('/') // Crucial: Refresh the page data
    } catch (error) {
        console.error('Server action error:', error)
    }
}

export async function deleteBookmark(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    if (!id) return

    await supabase.from('bookmarks').delete().eq('id', id)
    revalidatePath('/')
}
