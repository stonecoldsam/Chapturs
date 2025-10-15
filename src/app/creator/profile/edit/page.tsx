import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import ProfileEditorWYSIWYG from '@/components/profile/editor/ProfileEditorWYSIWYG'
import AppLayout from '@/components/AppLayout'

/**
 * Creator Profile Editor Page - v1.0 WYSIWYG
 * True WYSIWYG editing interface for creator profiles
 * - Looks exactly like the public profile with edit controls
 * - No separate preview mode needed
 * - Inline editing with hover controls
 */
export default async function CreatorProfileEditPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  // Wrap editor with AppLayout to include the global sidebar/navigation
  return (
    <AppLayout>
      <ProfileEditorWYSIWYG />
    </AppLayout>
  )
}
