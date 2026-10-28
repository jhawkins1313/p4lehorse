/**
 * P4LEHORSE PICKS, the YouTube Music playlist the homepage promotes.
 *
 * The playlist is public, so there is no OAuth to do: one read-only call to
 * playlistItems with an API key is the whole integration. The key is optional
 * on purpose. Without it, and whenever the call fails, this falls back to the
 * snapshot below, because a stale carousel beats an empty one and the Docker
 * build prerenders the homepage in a container that has no key and no network
 * policy guaranteeing it could reach Google anyway.
 */

export type PlaylistTrack = {
  videoId: string
  title: string
  artist: string
  art: string
}

/**
 * Defaults in code rather than only on the Payload field. The site-settings row
 * already exists, so the new columns read back as null until somebody opens the
 * admin and saves, and the block would be invisible until they did.
 */
export const PICKS_PLAYLIST_ID = 'PLKV3QunHgQOQ'
export const PICKS_PLAYLIST_URL = `https://music.youtube.com/playlist?list=${PICKS_PLAYLIST_ID}`
export const PICKS_LIMIT = 15

/**
 * YouTube centres the square album art of a topic upload inside a 4:3 frame,
 * so a 1:1 box with object-fit: cover lands on the cover and crops away the
 * bars. hqdefault exists for every video on the service. maxresdefault does
 * not, and a missing one serves a grey placeholder rather than a 404.
 */
export const youtubeArt = (videoId: string): string =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

/** "Within Thy Wounds - Topic" is a channel name. The band is the part before it. */
const cleanArtist = (channel: string): string => channel.replace(/\s+-\s+Topic$/i, '').trim()

const track = (videoId: string, title: string, artist: string): PlaylistTrack => ({
  videoId,
  title,
  artist,
  art: youtubeArt(videoId),
})

/**
 * The playlist as it stood on 28 October 2026, in playlist order rather than
 * by date added, which is not readable without the API. This renders only when
 * the API is unreachable or unconfigured, so being a little out of date is the
 * point of it existing.
 */
const SNAPSHOT: PlaylistTrack[] = [
  track('4d6xxNDh-cg', 'Vast Forests Beyond Emerald Gates', 'Within Thy Wounds'),
  track('m9x7My8uf-8', 'Psalm 43', 'xDOULOSx'),
  track('2hCvDxPhqHk', "Where There's Death the Vultures Feast", 'xDOULOSx'),
  track('-d3u1XTGzK4', "Wycliffe's Legacy", 'Trébuchet SDG'),
  track('lcPAvOkee1w', 'closer2heaven', 'US Golf 95'),
  track('I3La8pphDtg', 'No Matter The Road', 'Pathworn Pilgrim'),
  track('VA5UwkaaAMU', 'Goblin Hunt (feat. Fen Walker)', 'Pathworn Pilgrim'),
  track('tjpdBlDAgy8', 'Eternal Bliss', 'Pieti'),
  track('vHOjoX5QAkM', 'Thunder Rider', 'Sanctified Steel'),
  track('l3NXUj8rcfQ', 'Army of Saints', 'Sanctified Steel'),
  track('gdV1zLhkdSw', 'Faithful & True', 'NMDS_HXC'),
  track('a2cdAHGDUCQ', 'Sheep Among Wolves', 'NMDS_HXC'),
  track('UNywAOiyJtA', 'Book of Lies', 'Pieti'),
  track('QmTp_kdJElk', 'Tribulations', 'MelonCollie'),
  track('jXv5WJkgNLg', 'The Redemption', 'rebornwithfire'),
  track('PmweCNJph0E', 'cried out', 'awake eternally'),
]

/** A track pulled from the playlist can be gone without the item disappearing. */
const GONE = ['private video', 'deleted video']

/**
 * The most recently added tracks, newest first.
 *
 * playlistItems returns items in playlist position order, which is the order
 * the owner arranged them in and says nothing about when they arrived. The
 * sort key is snippet.publishedAt, which for a playlist item is the moment it
 * was added, not the moment the video went up. Getting those two confused is
 * what turns "current rotation" into "whatever is oldest on YouTube".
 */
export const getPlaylistTracks = async (
  playlistId: string = PICKS_PLAYLIST_ID,
  limit: number = PICKS_LIMIT,
): Promise<PlaylistTrack[]> => {
  const key = process.env.YOUTUBE_API_KEY
  if (!key || !playlistId) return SNAPSHOT.slice(0, limit)

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('playlistId', playlistId)
    url.searchParams.set('maxResults', '50')
    url.searchParams.set('key', key)

    // An hour, independent of the page's own 60 second revalidate: the page can
    // rebuild as often as it likes without spending a quota unit each time.
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!res.ok) return SNAPSHOT.slice(0, limit)

    const data = await res.json()

    const dated = (data?.items || [])
      .map((item: any) => {
        const snippet = item?.snippet
        const videoId = snippet?.resourceId?.videoId
        const title = typeof snippet?.title === 'string' ? snippet.title.trim() : ''
        if (!videoId || !title || GONE.includes(title.toLowerCase())) return null
        return {
          addedAt: snippet.publishedAt || '',
          ...track(videoId, title, cleanArtist(snippet.videoOwnerChannelTitle || '')),
        }
      })
      .filter(Boolean) as Array<PlaylistTrack & { addedAt: string }>

    const tracks = dated
      .sort((a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0))
      .slice(0, limit)
      .map(({ addedAt: _addedAt, ...rest }) => rest)

    return tracks.length ? tracks : SNAPSHOT.slice(0, limit)
  } catch {
    return SNAPSHOT.slice(0, limit)
  }
}
