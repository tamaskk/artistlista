import type { NextAuthConfig } from "next-auth";

/**
 * Edge-kompatibilis auth config (Mongoose nélkül) — a middleware ezt használja.
 * A providereket a teljes `auth.ts` adja hozzá. A web app publikus: csak
 * kevés útvonal védett (pl. koncert-beküldés).
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/belepes" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId ?? null;
        token.artistId = (user as any).artistId ?? null;
        token.userId = (user as any).id;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).id = token.userId;
      (session.user as any).role = token.role;
      (session.user as any).organizationId = token.organizationId;
      (session.user as any).artistId = token.artistId;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
