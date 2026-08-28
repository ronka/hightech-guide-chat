import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    pixelIdSet: !!process.env.META_PIXEL_ID,
    pixelIdLength: process.env.META_PIXEL_ID?.length ?? 0,
    tokenSet: !!process.env.META_CAPI_ACCESS_TOKEN,
    tokenLength: process.env.META_CAPI_ACCESS_TOKEN?.length ?? 0,
  });
}
