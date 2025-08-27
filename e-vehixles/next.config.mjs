/** @type {import('next').NextConfig} */
const nextConfig = {
      // remember to do all this 
   experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },

    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "adxgehfdjcwfztigarlt.supabase.co",
      },
    ],
  },
  // do it the hostname is gotten from the enviroment
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://roadsidecoder.created.app",
          },
        ],
      },
    ];
  },

};

export default nextConfig;
