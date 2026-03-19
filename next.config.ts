import type { NextConfig } from 'next'
import withMotionwind from 'motionwind-react/next'

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseBuiltinBabel: true,
  },
}

export default withMotionwind(nextConfig as Parameters<typeof withMotionwind>[0])
