'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminTopBar({ email }: { email: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="bg-[#2a2a2a] text-white text-sm px-4 py-2 flex items-center justify-between">
      <span className="text-white/70">Signed in as {email}</span>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    </div>
  )
}
