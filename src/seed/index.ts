/**
 * Seeds a fresh database with the standing pages, the genre list,
 * and one worked example of every article format so the templates can be judged
 * with real copy in them.
 *
 * Safe to run more than once: it skips anything that already exists.
 *
 *   npm run seed
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { doc, p, em, h, pullQuote } from './lexical'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'seph@p4lehorse.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'changeme-p4lehorse'

const GENRES = [
  { name: 'Black metal', description: 'Cold, fast, and usually recorded somewhere it should not have been.' },
  { name: 'Atmospheric black metal' },
  { name: 'Death metal' },
  { name: 'Doom' },
  { name: 'Sludge' },
  { name: 'Hardcore' },
  { name: 'Grindcore' },
  { name: 'Dungeon synth', description: 'Keyboards, tape hiss, and a map of somewhere that does not exist.' },
  { name: 'Shoegaze' },
  { name: 'Post-punk' },
  { name: 'Darkwave' },
  { name: 'Ambient' },
  { name: 'Neofolk' },
]

const run = async () => {
  const payload = await getPayload({ config })

  // ---------------------------------------------------------------- Admin user
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  let admin = existingUsers.docs[0]

  if (!admin) {
    admin = await payload.create({
      collection: 'users',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: 'Seph Hawkins',
        role: 'admin',
        bio: 'Founded P4LEHORSE in 2026. Writes about the records nobody else is covering.',
      },
    })
    console.log(`  user      ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`)
  } else {
    console.log(`  user      ${admin.email} already exists, left alone`)
  }

  // -------------------------------------------------------------------- Genres
  const genreIds: Record<string, number | string> = {}
  for (const genre of GENRES) {
    const found = await payload.find({
      collection: 'genres',
      where: { name: { equals: genre.name } },
      limit: 1,
    })
    if (found.docs.length) {
      genreIds[genre.name] = found.docs[0].id
      continue
    }
    const created = await payload.create({ collection: 'genres', data: genre as any })
    genreIds[genre.name] = created.id
  }
  console.log(`  genres    ${GENRES.length} in place`)

  // ------------------------------------------------------------------- Artists
  const ensureArtist = async (data: any) => {
    const found = await payload.find({
      collection: 'artists',
      where: { name: { equals: data.name } },
      limit: 1,
    })
    if (found.docs.length) return found.docs[0]
    return payload.create({ collection: 'artists', data })
  }

  const daysOvYore = await ensureArtist({
    name: 'Days ov Yore',
    country: 'United States',
    bio: 'Dungeon synth and atmospheric black metal, released direct to Bandcamp with no label behind it.',
    links: { bandcamp: 'https://daysovyore.bandcamp.com' },
  })

  const veiledChoir = await ensureArtist({
    name: 'Veiled Choir',
    country: 'Norway',
    formed: 2019,
    bio: 'A three-piece who record live to tape in a converted chapel outside Bergen.',
  })

  console.log('  artists   2 in place')

  // --------------------------------------------------------------------- Pages
  const ensurePage = async (data: any) => {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: data.slug } },
      limit: 1,
    })
    if (found.docs.length) return found.docs[0]
    return payload.create({ collection: 'pages', data: { ...data, _status: 'published' } })
  }

  await ensurePage({
    title: 'About',
    slug: 'about',
    eyebrow: 'The publication',
    lede: 'P4LEHORSE is a digital space for the extreme and the fringe.',
    content: doc([
      p(
        'Extreme is everything metal and hardcore. Fringe is everything alternative, synth, post-punk, shoegaze, and the strange lands in between. It exists for artists doing serious work at the edges of music who get almost no press for doing it.',
      ),
      p(
        'Our name comes from an old vision of the end of things. We are more interested in what stands on the other side of it.',
      ),
      h(2, 'Values'),
      p(
        'P4LEHORSE takes an unconventional approach to extreme and fringe music journalism. It does not fit all the stereotypes associated with these scenes, and that is intentional. Due to our convictions, we do not support or promote NSBM or any ideology built on racial hatred, the occult, Satanism, self-harm, suicide, or misanthropy.',
      ),
      p(
        'We are not squeamish about darkness. Darkness is most of what these genres are made of, and we would be useless critics if we flinched at it. P4LEHORSE is built on a conviction that grief, doubt, rage, dread, death, war, and everything under the weight of being alive in a broken world belong in meaningful music, and the best records in these scenes are the ones that carry that honestly and creatively. What we will not do is treat despair as cool or contempt as a virtue.',
      ),
      pullQuote('Darkness is worth something when it is in tension with light.'),
      p(
        'The ultimate goal of P4LEHORSE is to elevate artists whose work inspires the human spirit rather than degrades it. Loud, bleak, symphonic, abrasive, dissonant, beautiful, whatever form that takes.',
      ),
      h(2, 'The underground'),
      p(
        "Thousands of exceptional artists have come out of these scenes writing about their faith, nature, mythology, fantasy, memory, love, loss, and the human spirit's fight against the dark. Most of them fall through the cracks. They release on Bandcamp, press fifty cassettes, play regional shows, and get overlooked by an industry with no incentive to look for them.",
      ),
      p(
        'Our coverage runs from the obscure to the cult-established: the artist with two hundred listeners and the artist with a devoted following who still cannot get a single publication to return an email. Both are underground by any measure that matters.',
      ),
      p(
        'We are here to uncover the lesser-known bands and artists who are already excellent and just need more of a push.',
      ),
      h(2, 'What we run'),
      p(
        "We do album reviews, artist interviews, scene features, retrospectives, and recommendation roundups for readers trying to find their next favorite band. We don't deal with numerical scores, star ratings, news and gossip, or takedowns of artists. That's just lame.",
      ),
      h(2, 'History'),
      p(
        'P4LEHORSE was founded in 2026 by Seph Hawkins out of a conviction that the most interesting music being made right now is happening in rooms nobody is covering, and that the people making it deserve journalism as serious as their work.',
      ),
    ]),
  })

  await ensurePage({
    title: 'Submit music',
    slug: 'submit',
    eyebrow: 'For artists',
    lede: 'Send us a record.',
    content: doc([
      p(
        'We listen to everything that comes in. We cannot write about everything, and a piece can take a few weeks to appear, but nothing goes unheard.',
      ),
      h(2, 'What helps'),
      p(
        'A Bandcamp link, a release date, and two or three sentences on what the record is about. Streaming links are fine. Please do not send a press release written in the third person about how the band is poised to redefine the genre.',
      ),
      h(2, 'Where the line sits'),
      p(
        'We do not support or promote NSBM or any ideology built on racial hatred, the occult, Satanism, self-harm, suicide, or misanthropy. Everything else in the dark is fair ground, and most of what we love lives there.',
      ),
      h(2, 'What we do not do'),
      p(
        'No scores, no star ratings, no news, no takedowns. If a record is not for us we simply do not write about it.',
      ),
    ]),
  })

  console.log('  pages     About, Submit music')

  // ------------------------------------------------------------------ Articles
  const ensurePost = async (data: any) => {
    const found = await payload.find({
      collection: 'posts',
      where: { slug: { equals: data.slug } },
      limit: 1,
    })
    if (found.docs.length) return found.docs[0]
    return payload.create({ collection: 'posts', data: { ...data, _status: 'published' } })
  }

  await ensurePost({
    title: 'A record that keeps a candle lit at the bottom of the well',
    slug: 'days-ov-yore-vlad-tepes-part-1',
    format: 'review',
    featured: true,
    author: admin.id,
    artist: daysOvYore.id,
    albumTitle: 'The Tale of Vlad Țepeș part 1',
    label: 'Self-released',
    releaseDate: new Date('2026-05-14').toISOString(),
    publishedAt: new Date('2026-08-19T09:00:00Z').toISOString(),
    genres: [genreIds['Dungeon synth'], genreIds['Atmospheric black metal']].filter(Boolean),
    excerpt:
      'Forty minutes of tape hiss and cheap keyboards that somehow arrive at grief. The most affecting dungeon synth record of the year came out of a bedroom with no label behind it.',
    bandcamp: {
      albumId: '1771381501',
      trackId: '1991934075',
      url: 'https://daysovyore.bandcamp.com/album/the-tale-of-vlad-epe-part-1',
      quote:
        'The keyboards are cheap and the tape hiss is loud, and neither one is an accident.',
    },
    content: doc([
      p(
        'The first thing you hear is a room. Not a reverb plugin, a room, with a ceiling and a corner and something humming in it.',
      ),
      p(
        'Days ov Yore is one person, recording direct to Bandcamp with no label behind them, and ',
        em('The Tale of Vlad Țepeș part 1'),
        ' is the fourth release under the name in two years. The others were sketches. This one is a record.',
      ),
      pullQuote(
        'The keyboards are cheap and the tape hiss is loud, and neither one is an accident.',
        'Days ov Yore · The Tale of Vlad Țepeș part 1',
      ),
      p(
        'Dungeon synth has a tolerance problem. The genre asks you to accept a preset string patch as a castle, and most records spend their whole runtime cashing that check without ever writing a tune underneath it. This one writes the tune first. "The Forest Road" is four notes and a drone, repeated for six minutes, and by the fourth minute those four notes have started to mean something they did not mean at the start.',
      ),
      h(2, 'Where the black metal comes in'),
      p(
        'Two tracks break the spell on purpose. "Impalement" drops a guitar into the mix at the halfway mark, distant and badly mic\'d, and the effect is less "heavy section" than a door opening onto weather. It does not resolve. It just gets colder.',
      ),
      p(
        'The closer, "A Candle at the Bottom of the Well", is the reason to hear this. It is the same four notes from the opening, played slower, on a patch that sounds like it is running out of batteries. Nothing is triumphant about it. Something is still burning, is all.',
      ),
      h(2, 'Where it sits'),
      p(
        'If you have worn out Depressive Silence and Mortiis, this is the record for you, and it is better written than either. It sits closer to the recent Fief albums in its willingness to be pretty, and closer to Old Sorcery in its willingness to be long. What it has over all of them is a sense that the person making it believes the story.',
      ),
      p(
        'Fifty cassettes exist. The download is name your price. Neither of those facts should be how you find a record this good, and both of them are.',
      ),
    ]),
  })

  await ensurePost({
    title: 'Veiled Choir on recording in a chapel with no heating',
    slug: 'veiled-choir-interview',
    format: 'interview',
    author: admin.id,
    artist: veiledChoir.id,
    publishedAt: new Date('2026-08-12T09:00:00Z').toISOString(),
    genres: [genreIds['Black metal'], genreIds['Atmospheric black metal']].filter(Boolean),
    excerpt:
      'The Bergen three-piece record live to tape in a building that has been cold since 1890. They explain why that matters, and why they will not do it any other way.',
    content: doc([
      p(
        'Veiled Choir have made three albums in a converted chapel outside Bergen. There is no heating in it. There is one microphone position that works and about forty that do not.',
      ),
      h(2, 'On the room'),
      p(
        'We spoke to the band the week their third record was mastered. The conversation is printed close to how it was said.',
      ),
      p(
        '"People assume the cold is a bit," the guitarist says. "It is not a bit. It is just where the piano is."',
      ),
      pullQuote(
        'You can hear us being cold on the record. That is not atmosphere. That is just what happened.',
      ),
      p(
        'What follows is a long argument about tape, about why the band refuses a click track, and about the one take on the album where somebody drops a cymbal stand and they kept it in.',
      ),
    ]),
  })

  await ensurePost({
    title: 'Six shoegaze records from small labels that deserved more than they got',
    slug: 'shoegaze-roundup-2026',
    format: 'roundup',
    author: admin.id,
    publishedAt: new Date('2026-08-05T09:00:00Z').toISOString(),
    genres: [genreIds['Shoegaze'], genreIds['Darkwave']].filter(Boolean),
    excerpt:
      'Six records from the last eighteen months, none of them on a label you have heard of, all of them worth the forty minutes.',
    content: doc([
      p(
        'None of these are new in the news sense. All of them are new to almost everybody, which is the only sense that matters here.',
      ),
      h(2, 'The list'),
      p(
        'What links them is a refusal to treat the genre as a texture. Every one of these records has songs under the noise, and every one of them would survive being played on an acoustic guitar in a kitchen.',
      ),
      p('Start anywhere. Finish all six.'),
    ]),
  })

  console.log('  articles  3 published')

  // ------------------------------------------------------------- Site settings
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      contactEmail: 'hello@p4lehorse.com',
      social: [{ label: 'Bandcamp', url: 'https://bandcamp.com' }],
    },
  })
  console.log('  settings  written')

  console.log('\nSeed complete. Sign in at /admin')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
