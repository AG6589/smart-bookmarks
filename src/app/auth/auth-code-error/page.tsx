export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Authentication Error</h1>
                <p className="mb-6 text-gray-300">
                    There was an issue logging you in. This usually happens because:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-8 text-gray-400">
                    <li>The authentication link expired.</li>
                    <li>The "Redirect URL" in your Supabase configuration does not match.</li>
                    <li>Your Supabase credentials (.env.local) are incorrect.</li>
                </ul>
                <a
                    href="/"
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    Return to Login
                </a>
            </div>
        </div>
    )
}
