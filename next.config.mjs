import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Album art and masthead are served locally out of the Payload media dir.
    remotePatterns: [],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
