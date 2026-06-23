import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import bodyHtml from "../leah/body.html?raw";
import leahScript from "../leah/leah.script.js?raw";
import "../leah/leah.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leah's Birthday Dimension 🎨" },
      {
        name: "description",
        content: "A handmade, doodle-style birthday site for Leah, made by Ishaan.",
      },
      { property: "og:title", content: "Leah's Birthday Dimension 🎨" },
      {
        property: "og:description",
        content: "A handmade, doodle-style birthday site for Leah, made by Ishaan.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&family=Gochi+Hand&family=Patrick+Hand&family=Inter:wght@400;600;800;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      },
    ],
    scripts: [
      // Tailwind Play CDN — preserves arbitrary utility classes used in the original HTML.
      { src: "https://cdn.tailwindcss.com" },
    ],
  }),
  component: LeahBirthdayPage,
});

// Tailwind config injected globally so font-hand / font-doodle / font-sketch resolve
// exactly like in the original HTML (must run before Tailwind CDN finishes scanning).
const TAILWIND_CONFIG = `
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          hand: ['Patrick Hand', 'cursive'],
          doodle: ['Gochi Hand', 'cursive'],
          sketch: ['Architects Daughter', 'cursive'],
        }
      }
    }
  };
`;

function LeahBirthdayPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Apply the same body classes the original page used.
    const bodyClasses = [
      "min-h-screen",
      "relative",
      "flex",
      "flex-col",
      "justify-between",
      "selection:bg-yellow-100",
      "selection:text-stone-900",
      "transition-all",
      "duration-300",
      "leah-page-body",
    ];
    bodyClasses.forEach((c) => document.body.classList.add(c));
    document.documentElement.classList.add("light");

    // 1) Inject Tailwind config (sync, before main script runs).
    const cfg = document.createElement("script");
    cfg.textContent = TAILWIND_CONFIG;
    cfg.dataset.leah = "tw-config";
    document.head.appendChild(cfg);

    // 2) Inject the original page script in global scope so inline
    //    onclick="..." attributes (tryOpenVault, setPickupCategory, etc.)
    //    can still find their handlers on window.
    const main = document.createElement("script");
    main.textContent = leahScript;
    main.dataset.leah = "main";
    document.body.appendChild(main);

    return () => {
      bodyClasses.forEach((c) => document.body.classList.remove(c));
      cfg.remove();
      main.remove();
      // Best-effort: remove any DOM nodes the script appended to <body> root
      // (toasts/canvases live inside our container and unmount with it).
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="leah-root"
      // The original page is a tightly-coupled doodle app with ~2k lines of
      // imperative JS driving these exact DOM nodes (canvas IDs, modal IDs,
      // onclick handlers). Rendering the markup verbatim keeps the UI
      // pixel-identical; future passes can extract sub-trees into real
      // components without changing the visual output.
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
