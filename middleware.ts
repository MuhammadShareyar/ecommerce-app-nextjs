import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const protectedPaths = [
    /\/shipping-address/,
    /\/payment-method/,
    /\/place-order/,
    /\/profile/,
    /\/user\/(.*)/,
    /\/order\/(.*)/,
    /\/admin/,
  ];

  const isProtected = protectedPaths.some((p) =>
    p.test(request.nextUrl.pathname)
  );

  if (!request.auth && isProtected) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
});

export const config = {
  matcher: [
    "/shipping-address",
    "/payment-method",
    "/place-order",
    "/profile",
    "/user/:path*",
    "/order/:path*",
    "/admin/:path*",
  ],
  runtime:'nodejs'
};
