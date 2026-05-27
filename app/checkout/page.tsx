"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import type { CartItem } from "@/lib/cart-types";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function CheckoutPage() {
  const { items, total, subtotal, itemCount, isHydrated, pendingCheckout, setPendingCheckout, clearPendingCheckout } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // When user navigates back from Shopify payment page via browser back button,
  // the browser may restore this page from bfcache with status="loading" still set.
  // Reset to "idle" so the form is usable again.
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) setStatus("idle");
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0 && !pendingCheckout) {
    return (
      <main className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-500 mb-6 text-sm">Your cart is empty.</p>
        <Link
          href="/#categories"
          className="inline-flex items-center gap-2 text-xs font-bold px-10 py-4 tracking-[0.2em] uppercase bg-white text-black hover:opacity-90 transition-all"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          Shop Now →
        </Link>
      </main>
    );
  }

  // If there's a pending order, show resume payment screen
  if (pendingCheckout) {
    return (
      <main className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full border border-indigo-500/30 bg-indigo-500/[0.06] flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.6 1.97"/>
          </svg>
        </div>
        <p className="text-[9px] tracking-[0.45em] uppercase text-indigo-400 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
          Order Ready
        </p>
        <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-orbitron)" }}>
          {pendingCheckout.name ?? "Your Order"}
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Your order has been created. Click below to complete payment on Shopify&apos;s secure checkout.
        </p>
        <a
          href={pendingCheckout.invoiceUrl}
          className="inline-flex items-center justify-center w-full max-w-xs py-4 text-xs font-bold tracking-[0.2em] uppercase bg-white text-black hover:opacity-90 transition-all mb-4"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          Continue to Payment →
        </a>
        <p className="text-[11px] text-gray-600 mb-6">Redirects to Shopify secure checkout</p>
        <button
          onClick={() => { clearPendingCheckout(); router.push("/cart"); }}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          ← Back to cart
        </button>
      </main>
    );
  }

  async function handleCheckout() {
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const resp = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email }),
      });

      const data = (await resp.json()) as {
        draftOrderId?: string;
        name?: string;
        invoiceUrl?: string;
        error?: string;
      };

      if (!resp.ok || data.error) throw new Error(data.error ?? "Checkout failed");
      if (!data.invoiceUrl) throw new Error("No invoice URL returned");

      // Store pending order — cart stays intact until payment is confirmed
      setPendingCheckout({
        draftOrderId: data.draftOrderId ?? "",
        name: data.name,
        invoiceUrl: data.invoiceUrl,
        createdAt: Date.now(),
      });

      // Redirect to Shopify payment
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14">

      {/* Header */}
      <div className="mb-10">
        <p className="text-[9px] tracking-[0.45em] uppercase text-gray-600 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
          Checkout
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
          Complete Your Order
        </h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">

        {/* Left */}
        <div className="lg:col-span-3 flex flex-col gap-8">

          {/* Email */}
          <div className="border border-white/[0.07] p-6" style={{ background: "rgba(255,255,255,0.015)" }}>
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-5" style={{ fontFamily: "var(--font-orbitron)" }}>
              Contact Information
            </h2>
            <div>
              <label className="block text-[10px] text-gray-500 mb-2 tracking-widest uppercase">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                placeholder="you@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.09] text-white text-sm px-4 py-3 focus:outline-none focus:border-white/30 placeholder:text-gray-600"
              />
              <p className="text-[10px] text-gray-600 mt-2">
                Order confirmation and tracking will be sent here.
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="border border-white/[0.07] p-6" style={{ background: "rgba(255,255,255,0.015)" }}>
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-5" style={{ fontFamily: "var(--font-orbitron)" }}>
              Order Items ({itemCount})
            </h2>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <CheckoutItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 border border-indigo-500/15 bg-indigo-500/[0.02]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              After clicking Complete Order, you&apos;ll be redirected to Shopify&apos;s secure payment page. Your cart will remain saved until payment is confirmed.
            </p>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <div className="border border-white/[0.08] p-7 sticky top-24" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            <h2 className="text-[11px] font-bold text-white tracking-[0.2em] uppercase mb-6" style={{ fontFamily: "var(--font-orbitron)" }}>
              Order Summary
            </h2>

            <div className="flex flex-col gap-3.5 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-white font-medium">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-400 text-xs">Calculated at payment</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxes</span>
                <span className="text-gray-500 text-xs">Calculated at payment</span>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-5 mb-7">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">Estimated Total</span>
                <span className="text-2xl font-bold text-white">{fmt(total)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-start gap-2.5 p-3 border border-red-500/25 bg-red-500/[0.04]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" className="flex-shrink-0 mt-0.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <p className="text-[11px] text-red-400">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={status === "loading"}
              className="w-full py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-200 mb-4 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
              style={{ fontFamily: "var(--font-orbitron)", background: "#ffffff", color: "#000000" }}
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Creating Order…
                </>
              ) : (
                <>Complete Order →</>
              )}
            </button>

            <Link href="/cart" className="block text-center text-[11px] text-gray-600 hover:text-gray-400 transition-colors">
              ← Back to Cart
            </Link>

            <div className="border-t border-white/[0.05] pt-5 mt-5 flex flex-col gap-2">
              {[
                "Secure SSL checkout via Shopify",
                "Free shipping on orders over $50",
                "100% satisfaction guarantee",
              ].map((txt) => (
                <div key={txt} className="flex items-center gap-2.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[10px] text-gray-600">{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutItemRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="relative flex-shrink-0 w-14 h-14 border border-white/[0.06] overflow-hidden bg-white/[0.02]">
        {item.thumbnail ? (
          <Image src={item.thumbnail} alt={item.title} fill className="object-contain p-1.5" sizes="56px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white/10" style={{ fontFamily: "var(--font-orbitron)" }}>
              {item.title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
          {item.title}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
        {item.kind === "vinyl-sticker" && item.proof?.status === "approved" && (
          <p className="text-[9px] text-green-500/80 mt-0.5 tracking-wide">✓ Proof approved</p>
        )}
      </div>
      <p className="text-sm font-bold text-white flex-shrink-0">{fmt(item.totalPrice)}</p>
    </div>
  );
}
