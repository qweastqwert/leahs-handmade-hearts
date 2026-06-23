import { createFileRoute } from "@tanstack/react-router";

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
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/leah.html"
      title="Leah's Birthday Dimension"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
