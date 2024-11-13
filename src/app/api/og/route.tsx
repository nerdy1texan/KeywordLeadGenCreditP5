import { SITE } from "@/config/site";
import { ImageResponse } from "@vercel/og";
export const runtime = "edge";

const font = fetch(
  new URL("../../../assets/fonts/CalSans-SemiBold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(request: Request) {
  const fontData = await font;

  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.has("title")
      ? searchParams.get("title")
      : SITE.title;

    // Built using satori (https://github.com/vercel/satori)
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            height: 630,
            width: 1200,
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "-.02em",
            fontWeight: 700,
            background:
              "linear-gradient(90deg, rgba(79,70,229,1) 0%, rgba(147,51,234,1) 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "20px 50px",
              margin: "0 42px",
              fontSize: 40,
              width: "auto",
              maxWidth: 630,
              alignItems: "center",
              lineHeight: 1.4,
              fontFamily: '"Inter"',
              color: "white",
              textAlign: "center",
            }}
          >
            <img
              src={`${SITE.url}/logo_dark.svg`}
              style={{
                height: 40,
                width: 200,
                marginBottom: 50,
              }}
            />
            <span>{title}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
