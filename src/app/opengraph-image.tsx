import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function loadLocalFont(filename: string): Promise<ArrayBuffer> {
  // In serverless (e.g. Vercel), cwd is the deployment root and fonts are traced there.
  const fromCwd = path.join(process.cwd(), "src/app/_og/fonts", filename);
  const buf = await readFile(fromCwd);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

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

export default async function OpenGraphImage() {
  const bg = "#07080a";
  const fg = "rgba(255,255,255,0.92)";
  const muted = "rgba(255,255,255,0.62)";
  let playfair700: ArrayBuffer | undefined;
  let nunito600: ArrayBuffer | undefined;
  try {
    const [a, b] = await Promise.all([
      loadLocalFont("Playfair_144pt-Bold.ttf"),
      loadLocalFont("nunito-sans-latin-600-normal.ttf"),
    ]);
    playfair700 = a;
    nunito600 = b;
  } catch (e) {
    // Don’t fail the OG route if font loading fails; fall back to system fonts.
    console.error("OG font load failed:", e);
  }

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
          backgroundColor: bg,
          backgroundImage:
            // Dark premium base + vignette + a subtle center aura.
            "radial-gradient(900px 520px at 50% 48%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 60%), radial-gradient(1200px 700px at 50% 60%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 55%), radial-gradient(1200px 900px at 50% 40%, rgba(56,189,248,0.10) 0%, rgba(56,189,248,0.00) 55%), radial-gradient(1400px 900px at 50% 50%, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.62) 78%, rgba(0,0,0,0.82) 100%)",
          fontFamily:
            '"Nunito Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              // Subtle grid (like landing), both directions.
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 22px)",
            opacity: 0.55,
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.10,
            }}
          >
            <div style={{ display: "flex", transform: "scale(2.6)" }}>
              <Mark color="#ffffff" />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 18,
              paddingLeft: 90,
              paddingRight: 90,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.78)",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Save 2+ hours weekly on scheduling
            </div>

            <div
              style={{
                fontFamily:
                  '"Playfair 144pt", ui-serif, Georgia, "Times New Roman", Times, serif',
                fontSize: 132,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: fg,
                lineHeight: 1.0,
                textShadow: "0 10px 40px rgba(0,0,0,0.55)",
              }}
            >
              Cedular
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 600,
                color: muted,
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
              }}
            >
              Meetings on Autopilot
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...((playfair700 || nunito600) && {
        fonts: [
          ...(playfair700
            ? [
                {
                  name: "Playfair 144pt",
                  data: playfair700,
                  weight: 700,
                  style: "normal",
                } as const,
              ]
            : []),
          ...(nunito600
            ? [
                {
                  name: "Nunito Sans",
                  data: nunito600,
                  weight: 600,
                  style: "normal",
                } as const,
              ]
            : []),
        ],
      }),
    },
  );
}
