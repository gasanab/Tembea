import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api-url";

const BACKEND = getApiBaseUrl();

export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get("listingId");
  const q = req.nextUrl.searchParams.get("q");

  if (q) {
    const res = await fetch(`${BACKEND}/products/search?q=${encodeURIComponent(q)}`);
    return NextResponse.json(await res.json(), { status: res.status });
  }
  if (!listingId) return NextResponse.json({ error: "listingId or q required" }, { status: 400 });
  const res = await fetch(`${BACKEND}/products/listing/${listingId}`);
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
