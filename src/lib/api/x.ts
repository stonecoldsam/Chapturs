/**
 * X (Twitter) API Client
 *
 * Uses Twitter API v2. Requires TWITTER_BEARER_TOKEN if enabled.
 * Because of strict quotas on free tier, we will use heavy caching.
 */

export interface XUserData {
  username: string
  name: string
  profileImageUrl?: string
  description?: string
  publicMetrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
}

function getBearer(): string | null {
  const token = process.env.TWITTER_BEARER_TOKEN || null
  if (!token) {
    console.warn('[XClient] Missing TWITTER_BEARER_TOKEN; using static fallback')
  }
  return token
}

export async function getUserByUsername(username: string): Promise<XUserData | { error: string }> {
  const bearer = getBearer()
  if (!bearer) {
    return { error: 'X API token not configured' }
  }

  try {
    const url = new URL(`https://api.twitter.com/2/users/by/username/${username}`)
    url.searchParams.set('user.fields', 'profile_image_url,description,public_metrics,verified')

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`X API error (${res.status}): ${text}`)
    }

    const json = await res.json()
    const data = json.data
    if (!data) {
      return { error: 'User not found' }
    }

    const user: XUserData = {
      username: data.username,
      name: data.name,
      profileImageUrl: data.profile_image_url,
      description: data.description,
      publicMetrics: data.public_metrics,
    }

    return user
  } catch (error) {
    console.error('[XClient] getUserByUsername error:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function formatCount(n?: number): string | undefined {
  if (n === undefined) return undefined
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K'
  return String(n)
}
