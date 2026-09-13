// middleware.ts works on the edge only, but prisma is not available on the edge.
// so we will trigger the auth.config.ts file instead of auth.ts
import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import {
  DEFAULT_REDIRECT_URL,
  apiAuthPrefix,
  authRoutes,
  publicPrefixes,
  publicRoutes,
} from "@/lib/routes";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute =
    publicRoutes.includes(nextUrl.pathname) ||
    publicPrefixes.some((prefix) => nextUrl.pathname.startsWith(prefix));
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Inngest calls this server-to-server, it is verified with INNGEST_SIGNING_KEY
  if (isApiAuthRoute || nextUrl.pathname.startsWith("/api/inngest")) {
    return;
  }
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_REDIRECT_URL, nextUrl));
    }
    return;
  }
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(authRoutes[0], nextUrl));
  }
});

export const config = {
  // "/" and "/about" are left out on purpose: they are static public pages, so they must carry no auth cookies
  matcher: ["/((?!.+\\.[\\w]+$|_next|about$).+)", "/(api|trpc)(.*)"],
};
