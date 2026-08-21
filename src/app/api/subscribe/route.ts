import { payloadClient } from '../../../lib/site'

/**
 * Newsletter signup. The Subscribers collection blocks public creates, so this
 * route is the only way in and it writes with an override. That keeps the list
 * write-only from outside: nobody can read it back through the REST API.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || '')
      .trim()
      .toLowerCase()
    const source = String(body?.source || 'site').slice(0, 120)

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: 'invalid_email' }, { status: 400 })
    }

    const payload = await payloadClient()

    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      // Already on the list. Quietly re-subscribe rather than telling a stranger
      // whether an address is on file.
      await payload.update({
        collection: 'subscribers',
        id: existing.docs[0].id,
        data: { status: 'subscribed' },
        overrideAccess: true,
      })
      return Response.json({ ok: true })
    }

    await payload.create({
      collection: 'subscribers',
      data: { email, source, status: 'subscribed' },
      overrideAccess: true,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[subscribe]', err)
    return Response.json({ error: 'failed' }, { status: 500 })
  }
}
