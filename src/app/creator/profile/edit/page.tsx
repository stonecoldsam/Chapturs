import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import ProfileEditorWYSIWYG from '@/components/profile/editor/ProfileEditorWYSIWYG'

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

  // WYSIWYG editor includes its own layout, no AppLayout wrapper needed
  return <ProfileEditorWYSIWYG />
}
