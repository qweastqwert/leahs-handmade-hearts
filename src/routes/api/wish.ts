import { createFileRoute } from "@tanstack/react-router";

// POST /api/wish — forwards Leah's wish to Ishaan via Web3Forms.
// The access key lives ONLY in server env (WEB3FORMS_KEY) so it never
// ships to the client bundle or git.
export const Route = createFileRoute("/api/wish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { text?: string } = {};
        try {
          payload = await request.json();
        } catch {
          return new Response(JSON.stringify({ success: false, error: "bad_json" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const text = (payload.text || "").toString().trim();
        if (!text) {
          return new Response(JSON.stringify({ success: false, error: "empty" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        if (text.length > 4000) {
          return new Response(JSON.stringify({ success: false, error: "too_long" }), {
            status: 413,
            headers: { "content-type": "application/json" },
          });
        }

        const key = process.env.WEB3FORMS_KEY;
        const recipient = process.env.WISH_RECIPIENT_EMAIL;
        if (!key || !recipient) {
          return new Response(
            JSON.stringify({ success: false, error: "not_configured" }),
            { status: 503, headers: { "content-type": "application/json" } },
          );
        }

        const subjectPrefix = "🪔 Leah wished:";
        const subject = `${subjectPrefix} ${text.slice(0, 60)}${text.length > 60 ? "…" : ""}`;

        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              access_key: key,
              subject,
              from_name: "Leah (via Birthday Site)",
              to_email: recipient,
              message: text,
              sent_at: new Date().toISOString(),
            }),
          });
          const data = (await res.json().catch(() => ({}))) as { success?: boolean };
          return new Response(JSON.stringify({ success: !!data.success }), {
            status: res.ok ? 200 : 502,
            headers: { "content-type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ success: false, error: "network" }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
