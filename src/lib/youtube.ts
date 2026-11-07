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

/**
 * How much of the playlist to read, and how much of it ends up on screen.
 *
 * The pool is one page of playlistItems, which is the most the API hands back
 * in a single call. The rotation is drawn from that pool at render time, and
 * its length is itself random inside the range, so two rebuilds of the
 * homepage do not produce a carousel of identical length and order.
 */
export const PICKS_POOL_LIMIT = 50
export const PICKS_ROTATION_MIN = 20
export const PICKS_ROTATION_MAX = 25

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
  limit: number = PICKS_POOL_LIMIT,
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

/**
 * The album a track belongs to, as far as anything here can know it.
 *
 * playlistItems carries no album: the Data API exposes none of YouTube Music's
 * release metadata, so there is nothing to read even with a second call. The
 * topic channel is the closest thing in the payload, and it is a safe key for
 * this job because every track off one album shares an artist. Spacing by
 * artist therefore guarantees the rule the block needs and then some: two
 * sleeves from one album can never land side by side, and neither can two
 * different albums by the same act, which read as a repeat anyway at carousel
 * size.
 */
const albumKey = (item: PlaylistTrack): string =>
  item.artist.trim().toLowerCase() || item.videoId

/** Fisher-Yates on a copy. */
const shuffled = <T,>(items: T[]): T[] => {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const held = out[i]
    out[i] = out[j]
    out[j] = held
  }
  return out
}

/**
 * Deal a run of `target` covers out of the pool with no album twice in a row.
 *
 * The playlist is shorter than the run, so tracks do repeat, which is fine; the
 * constraint is adjacency. Each slot is filled at random from the candidates
 * whose album is not the one just placed, preferring the tracks used fewest
 * times so far. That preference is what stops the run leaning on half a dozen
 * favourites: everything in the playlist gets a first airing before anything
 * gets a second.
 *
 * The last slot also avoids the first album, because the strip renders the run
 * twice and loops, so the end of a pass sits directly against its start.
 *
 * A pool with only one album in it has no legal ordering. That returns the
 * shuffled pool rather than nothing, since a carousel that repeats an artist
 * still beats an empty block.
 */
const buildRotation = (pool: PlaylistTrack[], target: number): PlaylistTrack[] => {
  if (pool.length < 2) return [...pool]

  const albums = new Set(pool.map(albumKey))
  if (albums.size < 2) return shuffled(pool).slice(0, target)

  const plays = new Map<string, number>()
  const run: PlaylistTrack[] = []

  while (run.length < target) {
    const previous = run.length ? albumKey(run[run.length - 1]) : null
    const opening = run.length ? albumKey(run[0]) : null
    const closing = run.length === target - 1

    const legal = pool.filter((item) => albumKey(item) !== previous)
    // Preferred: also clear of the loop seam. If the pool cannot manage both,
    // the seam gives way. A clash there is one frame of the animation, where a
    // run cut short is visible for the whole of it.
    const seamClear = closing ? legal.filter((item) => albumKey(item) !== opening) : legal
    const candidates = seamClear.length ? seamClear : legal

    const fewest = Math.min(...candidates.map((item) => plays.get(item.videoId) || 0))
    const freshest = candidates.filter((item) => (plays.get(item.videoId) || 0) === fewest)

    const pick = freshest[Math.floor(Math.random() * freshest.length)]
    run.push(pick)
    plays.set(pick.videoId, fewest + 1)
  }

  return run
}

/**
 * What the homepage block renders: a fresh 20 to 25 cover run off the playlist,
 * shuffled, with no album sitting next to itself.
 *
 * The order is decided here rather than in the component, so the carousel stays
 * a pure render of what it is handed. The page revalidates on its own clock and
 * the playlist read is cached for an hour, so this reshuffles on a rebuild
 * without spending another quota unit.
 */
export const getPicksRotation = async (
  playlistId: string = PICKS_PLAYLIST_ID,
): Promise<PlaylistTrack[]> => {
  const pool = await getPlaylistTracks(playlistId)
  const span = PICKS_ROTATION_MAX - PICKS_ROTATION_MIN + 1
  const target = PICKS_ROTATION_MIN + Math.floor(Math.random() * span)
  return buildRotation(pool, target)
}

// --- The embedded player -----------------------------------------------------

/**
 * A YouTube Music Pick, reduced to the two ids the embed needs.
 *
 * YouTube Music has no player of its own to embed: music.youtube.com serves no
 * iframe and refuses to be framed. What it hands out are ids, and the standard
 * YouTube player is the only way to put that audio on the page. Same track,
 * same OLAK5uy_ album playlists, a video shaped frame showing the topic
 * upload's cover art.
 */
export type YouTubeRef = { videoId: string | null; listId: string | null }

/** Video ids are 11 characters. Anything else is somebody's typo. */
const VIDEO_ID = /^[\w-]{11}$/
const LIST_ID = /^[\w-]{12,}$/
/** OLAK5uy_ is an album, PL a playlist, RD a radio mix. */
const BARE_LIST_ID = /^(OLAK5uy_|PL|RD|LL|UU|FL)[\w-]{10,}$/

const EMBED_HOSTS = [
  'youtube.com',
  'music.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'youtu.be',
]

/** Path segments that are followed by a video id rather than being one. */
const ID_PREFIXES = ['embed', 'shorts', 'live', 'v']

/**
 * Anything an editor is likely to paste, down to ids. Editors copy the share
 * link and nothing else, so this has to take every shape YouTube hands out:
 *
 *   music.youtube.com/watch?v=ID&list=OLAK5uy_ID   a track inside its album
 *   music.youtube.com/playlist?list=OLAK5uy_ID     a whole album
 *   youtube.com/watch?v=ID, youtu.be/ID, /shorts/  the ordinary site
 *   ID                                             a bare id, pasted alone
 *
 * Returns null for anything it cannot embed, which is what the field's
 * validation reports back to the editor.
 */
export const parseYouTubeRef = (input?: string | null): YouTubeRef | null => {
  const raw = (input || '').trim()
  if (!raw) return null

  if (VIDEO_ID.test(raw)) return { videoId: raw, listId: null }
  if (BARE_LIST_ID.test(raw)) return { videoId: null, listId: raw }

  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  if (!EMBED_HOSTS.includes(host)) return null

  let videoId = url.searchParams.get('v')

  if (!videoId) {
    const path = url.pathname.split('/').filter(Boolean)
    const last = path[path.length - 1] || ''
    const prefix = path[path.length - 2] || ''
    if (host === 'youtu.be' && VIDEO_ID.test(last)) videoId = last
    else if (ID_PREFIXES.includes(prefix) && VIDEO_ID.test(last)) videoId = last
  }

  if (videoId && !VIDEO_ID.test(videoId)) videoId = null

  const list = url.searchParams.get('list')
  const listId = list && LIST_ID.test(list) ? list : null

  if (!videoId && !listId) return null
  return { videoId, listId }
}

/**
 * The player's chrome is YouTube's and takes no palette: there is no bgcol to
 * set, the way bandcampEmbedSrc() sets one. color=white is the only choice that
 * is not YouTube red, so the progress bar does not fight the magenta.
 *
 * youtube-nocookie.com is the host because the Pick sits at the foot of a
 * review, where nobody asked to be tracked to read it.
 */
export const youtubeEmbedSrc = (ref: YouTubeRef): string => {
  const params = ['rel=0', 'playsinline=1', 'color=white', 'modestbranding=1']
  if (ref.listId) params.push(`list=${ref.listId}`)
  const target = ref.videoId || 'videoseries'
  return `https://www.youtube-nocookie.com/embed/${target}?${params.join('&')}`
}

/** Where the footer line sends people: Music, not the video site. */
export const youtubeMusicUrl = (ref: YouTubeRef): string => {
  if (ref.videoId) {
    const list = ref.listId ? `&list=${ref.listId}` : ''
    return `https://music.youtube.com/watch?v=${ref.videoId}${list}`
  }
  return `https://music.youtube.com/playlist?list=${ref.listId}`
}

/**
 * Field level validation for the paste a link field. An unparseable link is
 * caught in the admin, where somebody can fix it, rather than rendering as a
 * silently missing player on a published review.
 */
export const validateYouTubeUrl = (value: unknown): true | string => {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string' || !parseYouTubeRef(value)) {
    return 'That is not a link this can embed. Paste the share link from YouTube Music, e.g. https://music.youtube.com/watch?v=dQw4w9WgXcQ'
  }
  return true
}
