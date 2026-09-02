import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Run on every route except static assets and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
