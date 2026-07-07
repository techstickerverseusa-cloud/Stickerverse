import type { NextConfig } from "next";

const SHOPIFY_STORE = "stickerverseusa.myshopify.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  async redirects() {
    const SHOP_ID = "78810906940";
    return [
      // Catch all routes containing the Shopify store ID
      {
        source: `/${SHOP_ID}/:path*`,
        destination: `https://${SHOPIFY_STORE}/${SHOP_ID}/:path*`,
        permanent: false,
      },
      {
        source: "/checkout/:path*",
        destination: `https://${SHOPIFY_STORE}/checkout/:path*`,
        permanent: false,
      },
      {
        source: "/account/:path*",
        destination: `https://${SHOPIFY_STORE}/account/:path*`,
        permanent: false,
      },
      {
        source: "/orders/:path*",
        destination: `https://${SHOPIFY_STORE}/orders/:path*`,
        permanent: false,
      },
      {
        source: "/payments/:path*",
        destination: `https://${SHOPIFY_STORE}/payments/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
