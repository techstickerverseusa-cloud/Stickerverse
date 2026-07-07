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
    return [
      {
        source: "/checkout/:path*",
        destination: `https://${SHOPIFY_STORE}/checkout/:path*`,
        permanent: false,
      },
      {
        source: "/:shopId(\\d+)/invoices/:path*",
        destination: `https://${SHOPIFY_STORE}/:shopId/invoices/:path*`,
        permanent: false,
      },
      {
        source: "/:shopId(\\d+)/payments/:path*",
        destination: `https://${SHOPIFY_STORE}/:shopId/payments/:path*`,
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
