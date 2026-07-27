import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminTopBar from '@/components/admin-top-bar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The /admin/login page renders through this same layout, so only enforce
  // the check for everything else. Middleware already guards routing, but we
  // check again here server-side as defense in depth (e.g. direct data access
  // in a server component that skips middleware for any reason).
  if (user) {
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminRow) {
      await supabase.auth.signOut()
      redirect('/admin/login?error=not_authorized')
    }

    return (
      <div>
        <AdminTopBar email={adminRow.email} />
        {children}
      </div>
    )
  }

  // No user — only the login page should be reachable here (middleware
  // redirects everything else before it gets this far).
  return <>{children}</>
}
