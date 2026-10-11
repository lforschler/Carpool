import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const needsAuth =
    pathname === "/week" ||
    pathname.startsWith("/week/") ||
    pathname === "/agenda" ||
    pathname.startsWith("/agenda/") ||
    pathname === "/family" ||
    pathname.startsWith("/family/");

  if (needsAuth && !req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/week/:path*", "/agenda/:path*", "/family/:path*"],
};
