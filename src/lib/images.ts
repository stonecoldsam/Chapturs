// Small helpers for image URL normalization

/**
 * Returns a short, cacheable URL for a work cover image.
 * If the provided cover value is a data URL, it maps to our API proxy.
 * Otherwise, returns the original URL.
 */
export function resolveCoverSrc(workId: string, cover?: string | null): string | undefined {
  if (!cover) return undefined
  if (cover.startsWith('data:image/')) {
    // Serve via short API path; Next/Image allowlist not needed for same-origin
    return `/api/image/cover/${workId}`
  }
  return cover
}
