import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/partner", "/client"];
const PROTECTED_ACCOUNT_ROUTES = [
  "/notifications",
  "/profile",
  "/settings",
  "/wishlist",
];
function matchesPath(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set("x-tembea-path", pathname);

  const isProtected = [...PROTECTED_PREFIXES, ...PROTECTED_ACCOUNT_ROUTES].some(
    (route) => matchesPath(pathname, route),
  );
  if (!isProtected) return response;

  const token = request.cookies.get("tembea_token")?.value;
  if (!token) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
