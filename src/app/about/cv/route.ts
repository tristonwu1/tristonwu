import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { CvDocument } from "@/cv/CvDocument";
import { getAbout } from "@/sanity/queries";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const about = await getAbout();
  const element = createElement(CvDocument, { about }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="triston-wu-cv.pdf"',
      "Cache-Control":
        "public, max-age=0, s-maxage=60, stale-while-revalidate=86400",
    },
  });
}
