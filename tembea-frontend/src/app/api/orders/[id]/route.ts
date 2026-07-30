import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api-url";

const BACKEND = getApiBaseUrl();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(`${BACKEND}/orders/${params.id}`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
