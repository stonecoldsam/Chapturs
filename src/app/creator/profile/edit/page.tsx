import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import AppLayout from '@/components/AppLayout'
import ProfileEditor from '@/components/profile/editor/ProfileEditor'

/**
 * Creator Profile Editor Page - v0.1.5
 * Full editing interface for creator profiles
 * Now integrated with AppLayout sidebar
 */
export default async function CreatorProfileEditPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  return (
    <AppLayout>
      <ProfileEditor />
    </AppLayout>
  )
}
