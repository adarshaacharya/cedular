import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function Mark({ color }: { color: string }) {
  return (
    <svg
      fill="none"
      height="132"
      viewBox="0 0 64 64"
      width="132"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={color} height="56" opacity="0.12" rx="16" width="56" x="4" y="4" />
      <path
        d="M44 20a16 16 0 1 0 0 24"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M32 24v10l6 6"
        opacity="0.9"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <circle cx="44" cy="20" fill={color} r="3" />
    </svg>
  );
}

export default function TwitterImage() {
  const primary = "#111827";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(900px 520px at 30% 30%, rgba(17,24,39,0.07) 0%, rgba(255,255,255,0) 55%), linear-gradient(135deg, #ffffff 0%, #f6f7f9 70%, #ffffff 100%)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, rgba(17,24,39,0.025) 0px, rgba(17,24,39,0.025) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 22px)",
          }}
        />

        <div
          style={{
            position: "relative",
            width: 1080,
            height: 470,
            display: "flex",
            alignItems: "center",
            gap: 52,
            padding: "70px 80px",
            borderRadius: 54,
            backgroundColor: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(17,24,39,0.12)",
            boxShadow: "0 40px 110px rgba(17,24,39,0.14)",
          }}
        >
          <div
            style={{
              width: 190,
              height: 190,
              borderRadius: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(180deg, rgba(17,24,39,0.06) 0%, rgba(17,24,39,0.03) 100%)",
              border: "1px solid rgba(17,24,39,0.10)",
              color: primary,
            }}
          >
            <Mark color={primary} />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              lineHeight: 1.05,
              color: primary,
              paddingTop: 4,
            }}
          >
            <div
              style={{
                fontSize: 92,
                fontWeight: 800,
                letterSpacing: "-0.05em",
              }}
            >
              Cedular
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 36,
                fontWeight: 600,
                color: "rgba(17,24,39,0.72)",
                letterSpacing: "-0.02em",
              }}
            >
              AI Scheduling Assistant
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 26,
                fontWeight: 500,
                color: "rgba(17,24,39,0.56)",
                letterSpacing: "-0.01em",
                maxWidth: 720,
              }}
            >
              Just CC your assistant. Let AI do the coordination.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

