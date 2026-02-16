import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                // Handle Vercel deployments where origin might be different or needed
                const forwardedHost = request.headers.get('x-forwarded-host')
                if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`)
                } else {
                    return NextResponse.redirect(`${origin}${next}`)
                }
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
