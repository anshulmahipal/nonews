import { ImageResponse } from "next/og";
import { getEditorialBySlug } from "./getEditorialBySlug";

export const alt = "Editorial summary — Author and stance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** ISR: align with editorial detail page (1 hour). */
export const revalidate = 3600;

/** Stance label for OG image; emphasize Critical/Supportive per spec. */
const STANCE_DISPLAY: Record<string, string> = {
  Critical: "Critical",
  Supportive: "Supportive",
  Neutral: "Neutral",
  Sarcastic: "Sarcastic",
  Balanced: "Balanced",
};

function getStanceColor(stance: string | null): string {
  switch (stance) {
    case "Critical":
      return "#ec4899";
    case "Supportive":
      return "#10b981";
    case "Balanced":
      return "#f59e0b";
    case "Sarcastic":
      return "#6366f1";
    case "Neutral":
    default:
      return "#64748b";
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const editorial = await getEditorialBySlug(slug);

  const authorName = editorial?.author?.trim() || "Unknown Author";
  const stance = editorial?.ai_stance ?? null;
  const stanceLabel = stance ? STANCE_DISPLAY[stance] ?? stance : "—";
  const stanceColor = getStanceColor(stance);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            padding: 48,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            NoNews
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "#f8fafc",
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            {authorName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 14,
              paddingBottom: 14,
              borderRadius: 12,
              backgroundColor: stanceColor,
              color: "#fff",
              fontSize: 32,
              fontWeight: 600,
            }}
          >
            {stanceLabel}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
