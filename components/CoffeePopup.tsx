"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

// Shown once per session, after the user's first successful project save
// (see maybeShowCoffeePopup in app/page.tsx) — only ever reached by signed-in
// users, since saving requires an account.
// Presets open static Stripe Payment Links (no backend/webhook needed) —
// set these in .env.local once the Stripe account/links exist:
//   NEXT_PUBLIC_STRIPE_LINK_3, _5, _10   — fixed-price links
//   NEXT_PUBLIC_STRIPE_LINK_CUSTOM       — a link with "customer chooses price" enabled
// (Same env var names as services/src/components/ui/CoffeePopup.jsx, so the
// same Stripe links can be reused across both apps.)
const PRESETS = [
  { amount: 3, envVar: "NEXT_PUBLIC_STRIPE_LINK_3", suggested: false },
  { amount: 5, envVar: "NEXT_PUBLIC_STRIPE_LINK_5", suggested: true },
  { amount: 10, envVar: "NEXT_PUBLIC_STRIPE_LINK_10", suggested: false },
] as const;

// Next.js only inlines NEXT_PUBLIC_* vars for statically-written
// `process.env.X` member expressions — `process.env[envVar]` with a runtime
// variable is never replaced and resolves to undefined in the client
// bundle. These literal accesses let the build-time replacement work, and
// openLink looks the resolved value up from this object instead.
const STRIPE_LINKS: Record<string, string | undefined> = {
  NEXT_PUBLIC_STRIPE_LINK_3: process.env.NEXT_PUBLIC_STRIPE_LINK_3,
  NEXT_PUBLIC_STRIPE_LINK_5: process.env.NEXT_PUBLIC_STRIPE_LINK_5,
  NEXT_PUBLIC_STRIPE_LINK_10: process.env.NEXT_PUBLIC_STRIPE_LINK_10,
  NEXT_PUBLIC_STRIPE_LINK_CUSTOM: process.env.NEXT_PUBLIC_STRIPE_LINK_CUSTOM,
};

function openLink(envVar: string) {
  const url = STRIPE_LINKS[envVar];
  if (!url) {
    // eslint-disable-next-line no-console
    console.warn(`${envVar} is not configured — add the Stripe Payment Link to .env.local`);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

interface CoffeePopupProps {
  onClose: () => void;
}

export default function CoffeePopup({ onClose }: CoffeePopupProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const customConfigured = !!process.env.NEXT_PUBLIC_STRIPE_LINK_CUSTOM;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl px-7 pt-8 pb-7 text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 text-[#9ca3af] hover:text-[#262626] transition-colors"
        >
          <X className="w-[18px] h-[18px]" />
        </button>

        <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="Swales"
            width={128}
            height={128}
            className="object-contain"
            priority
          />
        </div>

        <h3 className="text-[17px] font-extrabold text-[#111827] mb-2">
          Enjoying Swales Designer?
        </h3>
        <p className="text-[13.5px] text-[#6b7280] leading-relaxed mb-4">
          Swales is free to use. If it&apos;s helping you plan your garden,
          consider buying us a coffee — it goes straight into building the
          next feature.
        </p>

        <div className="flex gap-2 mb-2.5">
          {PRESETS.map(({ amount, envVar, suggested }) => (
            <button
              key={amount}
              onClick={() => openLink(envVar)}
              className={`flex-1 py-2.5 rounded-[10px] font-extrabold text-sm border-[1.5px] transition-colors ${
                suggested
                  ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                  : "bg-white text-[#111827] border-[#e5e7eb] hover:border-[#d1d5db]"
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        <button
          onClick={() => openLink("NEXT_PUBLIC_STRIPE_LINK_CUSTOM")}
          disabled={!customConfigured}
          className={`block w-full py-2.5 rounded-[10px] border border-dashed border-[#d1d5db] font-semibold text-[13px] mb-2.5 ${
            customConfigured
              ? "text-[#6b7280] cursor-pointer"
              : "text-[#d1d5db] cursor-not-allowed"
          }`}
        >
          Choose your own amount
        </button>

        <button
          onClick={onClose}
          className="text-[13px] text-[#9ca3af] hover:text-[#404040] py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
