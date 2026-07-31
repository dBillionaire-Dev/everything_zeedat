'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const notAuthorized = searchParams.get('error') === 'not_authorized'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Confirm this user is actually on the admin allowlist before redirecting.
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!adminRow) {
        await supabase.auth.signOut()
        setError('This account is not authorized for admin access.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-[#f9f7f4] to-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Zeedat Gifts"
              width={35}
              height={35}
              className="rounded-full"
            />
            <span className="font-serif text-xl font-semibold text-[#2a2a2a]">Zeedat Gifts</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[#2a2a2a] mt-6">Admin Sign In</h1>
          <p className="text-sm text-[#8b8b8b] mt-1">Staff access only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {(error || notAuthorized) && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error || 'That account is not authorized for admin access.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2a2a2a] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#e8dfd9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2a2a2a] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e8dfd9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#d4a5a5] text-white font-medium py-2.5 hover:bg-[#c4956f] transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8b8b8b] mt-6">
          <Link href="/" className="hover:text-[#d4a5a5]">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
