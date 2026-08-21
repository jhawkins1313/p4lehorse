import React from 'react'

/** Wordmark shown on the admin login screen. */
export const Logo = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
    }}
  >
    <span
      style={{
        fontFamily:
          "'Alte Haas Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '0.06em',
        color: '#ff2bd6',
      }}
    >
      P4LEHORSE
    </span>
    <span style={{ fontSize: '0.8125rem', color: '#a0a0aa', letterSpacing: '0.02em' }}>
      A digital space for the extreme and the fringe.
    </span>
  </div>
)

/** Small mark in the sidebar header. */
export const Icon = () => (
  <span
    style={{
      fontFamily:
        "'Alte Haas Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      fontWeight: 700,
      fontSize: '1.125rem',
      letterSpacing: '0.08em',
      color: '#ff2bd6',
    }}
  >
    P4
  </span>
)
