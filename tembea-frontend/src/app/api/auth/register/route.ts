import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api-url";

const BACKEND = getApiBaseUrl();

export async function POST(req: NextRequest) {
  const body = await req.json() as { name: string; email: string; password: string; role?: string };

  // Backend Role enum uses uppercase (CLIENT/PARTNER), frontend sends lowercase
  if (body.role) body.role = body.role.toUpperCase();

  const res = await fetch(`${BACKEND}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message ?? "Registration failed" },
      { status: res.status }
    );
  }

  const response = NextResponse.json(data, { status: 201 });
  // Forward Set-Cookie so the browser receives the httpOnly tembea_token cookie
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
