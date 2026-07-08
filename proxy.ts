import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_STORE = "stickerverseusa.myshopify.com";
const SHOP_ID = "78810906940";

// Paths Shopify must handle (checkout, Shop Pay callbacks, order status, etc.)
// Note: /cart, /checkout, /account, /login are OUR pages — do not redirect them.
const SHOPIFY_PREFIXES = [
  `/${SHOP_ID}`,
  "/checkouts",
  "/wallets",
  "/services",
  "/payments",
  "/orders",
  "/do",
  "/a",
  "/apps",
  "/auth",
  "/pay",
  "/challenge",
  "/password",
  "/policies",
  "/gift_cards",
  "/admin",
];

// Shopify cart permalinks like /cart/123456:1 — but bare /cart is our page
const SUBPATH_ONLY_PREFIXES = ["/cart"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isShopifyPath =
    SHOPIFY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    ) ||
    SUBPATH_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix + "/"));

  if (isShopifyPath) {
    const destination = `https://${SHOPIFY_STORE}${pathname}${search}`;
    return NextResponse.redirect(destination, { status: 307 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)"],
};
