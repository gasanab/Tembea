import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api-url";

const BACKEND = getApiBaseUrl();

export async function PATCH(req: NextRequest, { params }: { params: { packageId: string } }) {
  const body = await req.json();
  const res = await fetch(`${BACKEND}/guides/packages/${params.packageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: { packageId: string } }) {
  const res = await fetch(`${BACKEND}/guides/packages/${params.packageId}`, {
    method: "DELETE",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
