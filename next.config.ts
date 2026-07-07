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
  async rewrites() {
    return [
      // Shopify checkout, payment, account, orders
      {
        source: "/checkout/:path*",
        destination: `https://${SHOPIFY_STORE}/checkout/:path*`,
      },
      {
        source: "/:shopId(\\d+)/invoices/:path*",
        destination: `https://${SHOPIFY_STORE}/:shopId/invoices/:path*`,
      },
      {
        source: "/:shopId(\\d+)/payments/:path*",
        destination: `https://${SHOPIFY_STORE}/:shopId/payments/:path*`,
      },
      {
        source: "/account/:path*",
        destination: `https://${SHOPIFY_STORE}/account/:path*`,
      },
      {
        source: "/orders/:path*",
        destination: `https://${SHOPIFY_STORE}/orders/:path*`,
      },
      {
        source: "/payments/:path*",
        destination: `https://${SHOPIFY_STORE}/payments/:path*`,
      },
    ];
  },
};

export default nextConfig;
