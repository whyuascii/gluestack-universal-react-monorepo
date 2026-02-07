import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/seo";

export const runtime = "edge";

/**
 * Dynamic Open Graph Image Generator
 *
 * Generates branded OG images for social media sharing.
 *
 * Query Parameters:
 * - title: Main heading text (required)
 * - subtitle: Secondary text (optional)
 * - type: Image type - "default" | "article" | "product" (optional)
 *
 * @example
 * /og?title=Welcome%20to%20Our%20App
 * /og?title=How%20to%20Get%20Started&subtitle=A%20complete%20guide&type=article
 */

// Image dimensions (standard OG size)
const WIDTH = 1200;
const HEIGHT = 630;

// Design tokens - customize these to match your brand
const COLORS = {
  // Background gradient
  gradientStart: "#1a1a2e",
  gradientEnd: "#16213e",
  // Accent color (matches your theme)
  accent: "#F97066",
  // Text colors
  textPrimary: "#ffffff",
  textSecondary: "#a0aec0",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const title = searchParams.get("title") || siteConfig.tagline;
  const subtitle = searchParams.get("subtitle") || siteConfig.description;
  const type = searchParams.get("type") || "default";

  // Truncate long text
  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const truncatedSubtitle =
    subtitle && subtitle.length > 120 ? subtitle.slice(0, 117) + "..." : subtitle;

  // Adjust font size based on title length
  const titleFontSize = truncatedTitle.length > 30 ? 48 : 64;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 80px",
        background: `linear-gradient(135deg, ${COLORS.gradientStart} 0%, ${COLORS.gradientEnd} 100%)`,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Top decorative bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          background: `linear-gradient(90deg, ${COLORS.accent} 0%, ${COLORS.accent}88 100%)`,
        }}
      />

      {/* Header with logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Logo placeholder - replace with your actual logo */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            background: COLORS.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: 700,
            color: "white",
          }}
        >
          {siteConfig.shortName.charAt(0)}
        </div>
        <span
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          {siteConfig.name}
        </span>

        {/* Type badge */}
        {type !== "default" && (
          <div
            style={{
              marginLeft: "auto",
              padding: "8px 16px",
              borderRadius: "20px",
              background: `${COLORS.accent}22`,
              border: `1px solid ${COLORS.accent}44`,
              fontSize: "16px",
              fontWeight: 500,
              color: COLORS.accent,
              textTransform: "uppercase",
            }}
          >
            {type}
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: titleFontSize,
            fontWeight: 700,
            color: COLORS.textPrimary,
            lineHeight: 1.2,
            margin: 0,
            maxWidth: "900px",
          }}
        >
          {truncatedTitle}
        </h1>

        {truncatedSubtitle && (
          <p
            style={{
              fontSize: "24px",
              color: COLORS.textSecondary,
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "800px",
            }}
          >
            {truncatedSubtitle}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            color: COLORS.textSecondary,
          }}
        >
          {new URL(siteConfig.url).hostname}
        </span>

        {/* Decorative dots */}
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: COLORS.accent,
              opacity: 0.3,
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: COLORS.accent,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: COLORS.accent,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: COLORS.accent,
              opacity: 1,
            }}
          />
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}
