import type { NextAuthConfig } from "next-auth";

/**
 * Shared base config, imported by both `auth.ts` (full config) and
 * `proxy.ts` (route protection). Providers stay out of this file on
 * purpose: the Credentials provider's `authorize()` needs bcrypt + Prisma,
 * and this file is the one place both entry points import from — keeping
 * it dependency-light means `proxy.ts` never has to load either.
 */
export default {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/shows") ||
        request.nextUrl.pathname.startsWith("/upcoming") ||
        request.nextUrl.pathname.startsWith("/search");

      if (isProtected && !isLoggedIn) {
        return false; // redirects to `pages.signIn`
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
