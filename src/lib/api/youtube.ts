/**
 * YouTube API Client
 *
 * Minimal client to fetch channel statistics via YouTube Data API v3.
 * Requires YOUTUBE_API_KEY in environment.
 */

export interface YouTubeChannelStats {
  channelId: string
  title: string
  description?: string
  subscriberCount: number
  viewCount: number
  videoCount: number
  thumbnails?: {
    default?: string
    medium?: string
    high?: string
  }
  bannerImage?: string
}

function getApiKey(): string | null {
  const key = process.env.YOUTUBE_API_KEY || null
  if (!key) {
    console.warn('[YouTubeClient] Missing YOUTUBE_API_KEY; returning fallback data')
  }
  return key
}

function formatYouTubeUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`https://www.googleapis.com/youtube/v3${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

export async function getChannelStatsById(channelId: string): Promise<YouTubeChannelStats | { error: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { error: 'YouTube API key not configured' }
  }

  try {
    const url = formatYouTubeUrl('/channels', {
      part: 'snippet,statistics,brandingSettings',
      id: channelId,
      key: apiKey,
    })

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`YouTube API error (${res.status}): ${text}`)
    }

    const json = await res.json()
    const item = json.items?.[0]

    if (!item) {
      return { error: 'Channel not found' }
    }

    const stats = item.statistics || {}
    const snippet = item.snippet || {}
    const branding = item.brandingSettings || {}

    const result: YouTubeChannelStats = {
      channelId,
      title: snippet.title || 'Unknown Channel',
      description: snippet.description,
      subscriberCount: Number(stats.subscriberCount || 0),
      viewCount: Number(stats.viewCount || 0),
      videoCount: Number(stats.videoCount || 0),
      thumbnails: {
        default: snippet.thumbnails?.default?.url,
        medium: snippet.thumbnails?.medium?.url,
        high: snippet.thumbnails?.high?.url,
      },
      bannerImage: branding.image?.bannerExternalUrl,
    }

    return result
  } catch (error) {
    console.error('[YouTubeClient] getChannelStatsById error:', error)
    return { error: (error instanceof Error ? error.message : 'Unknown error') }
  }
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K'
  return String(n)
}
