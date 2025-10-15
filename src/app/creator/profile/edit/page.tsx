import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import ProfileEditor from '@/components/profile/editor/ProfileEditor'

/**
 * Creator Profile Editor Page - v0.1
 * Full editing interface for creator profiles
 */
export default async function CreatorProfileEditPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  return <ProfileEditor />
}

