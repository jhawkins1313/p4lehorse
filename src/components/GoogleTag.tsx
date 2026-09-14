import Script from 'next/script'

/** GA4 measurement id. Hardcoded, not an env var: it is public, and a missing build arg fails silently. */
const MEASUREMENT_ID = 'G-FX890FL659'

/**
 * Google's gtag.js snippet through next/script. The layout stays mounted across client
 * navigations, so this runs once per visit and GA4's enhanced measurement picks up later page
 * changes from the history API.
 *
 * Only the front-end layout renders it, keeping admin sessions out of the numbers, and only in
 * production, so a dev server never reports localhost page views to the live property.
 */
export const GoogleTag = () => {
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <>
      <Script id="google-tag">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${MEASUREMENT_ID}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} />
    </>
  )
}
