import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export const alt = "SPE University of Ibadan Student Chapter";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const regularFontData = fs.readFileSync(
    path.join(process.cwd(), "lib/fonts/HostGrotesk-Regular.woff")
  );
  const semiBoldFontData = fs.readFileSync(
    path.join(process.cwd(), "lib/fonts/HostGrotesk-SemiBold.woff")
  );
  const boldFontData = fs.readFileSync(
    path.join(process.cwd(), "lib/fonts/HostGrotesk-Bold.woff")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f4f6",
          padding: "48px",
          fontFamily: "Host Grotesk",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "44px",
            border: "1.5px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Top metadata */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              color: "#71717a",
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            society of petroleum engineers • university of ibadan
          </div>

          {/* Main title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              fontWeight: 700,
              color: "#09090b",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            SPE University of Ibadan
          </div>

          {/* Bottom metadata */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              fontSize: 24,
              letterSpacing: "-0.02em",
            }}
          >
            <div
              style={{
                color: "#52525b",
                fontWeight: 400,
              }}
            >
              official student chapter
            </div>
            <div
              style={{
                color: "#a1a1aa",
                fontWeight: 500,
              }}
            >
              speui.org
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Host Grotesk",
          data: regularFontData,
          style: "normal",
          weight: 400,
        },
        {
          name: "Host Grotesk",
          data: semiBoldFontData,
          style: "normal",
          weight: 600,
        },
        {
          name: "Host Grotesk",
          data: boldFontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
