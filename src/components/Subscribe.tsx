'use client'

import { useState } from 'react'

type Props = {
  heading?: string
  sub?: string
  source?: string
}

export const Subscribe = ({
  heading = 'Get the next one in your inbox.',
  sub = 'No spam, no algorithm, no filler. Just the records worth your time.',
  source = 'site',
}: Props) => {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="ph-section">
      <div className="ph-container ph-container--prose ph-center">
        <p className="ph-eyebrow">Join</p>
        <h2 className="ph-h2" style={{ marginTop: 0 }}>
          {heading}
        </h2>
        <p className="ph-lede" style={{ marginInline: 'auto' }}>
          {sub}
        </p>

        {state === 'done' ? (
          <p style={{ marginTop: 'var(--ph-space-5)', color: 'var(--ph-accent)' }}>
            You&rsquo;re in. First one lands soon.
          </p>
        ) : (
          <form
            className="ph-field"
            onSubmit={submit}
            style={{ marginTop: 'var(--ph-space-5)', justifyContent: 'center' }}
          >
            <label className="ph-visually-hidden" htmlFor="subscribe-email">
              Email address
            </label>
            <input
              className="ph-input"
              id="subscribe-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="ph-btn ph-btn--primary"
              type="submit"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? 'Sending' : 'Subscribe'}
            </button>
          </form>
        )}

        {state === 'error' && (
          <p style={{ marginTop: 'var(--ph-space-3)', color: 'var(--ph-muted)' }}>
            That didn&rsquo;t go through. Try again?
          </p>
        )}
      </div>
    </section>
  )
}
