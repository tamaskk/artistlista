import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// A web publikus — csak ezek az útvonalak igényelnek bejelentkezést.
// A /koncert-bekuldese SZÁNDÉKOSAN nem védett: a vendég is láthatja+kitöltheti
// az űrlapot, csak a tényleges beküldéshez kell fiók (U3 vendég-vázlat).
const PROTECTED_PREFIXES = ["/bekuldeseim", "/fiok", "/neked"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const loggedIn = !!req.auth?.user;

  if (isProtected && !loggedIn) {
    // Beküldés regisztrációhoz kötött → kilépett usert a regisztrációra küldjük
    // (a regisztrációs oldalon ott a "van már fiókod? Belépés" link).
    const url = new URL("/regisztracio", req.nextUrl);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  if (loggedIn && (pathname === "/belepes" || pathname === "/regisztracio")) {
    return NextResponse.redirect(new URL("/koncert-bekuldese", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
