import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { User, connectDB } from "@artistlist/database";
import { loginSchema } from "@artistlist/types";
import { authConfig } from "./auth.config";

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      await connectDB();
      const user = await User.findOne({ email: parsed.data.email });
      // pending (jóváhagyásra váró) és banned fiók nem léphet be
      if (!user?.passwordHash || user.status === "banned" || user.status === "pending") return null;
      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;
      return {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId ? String(user.organizationId) : null,
        artistId: user.artistId ? String(user.artistId) : null,
      } as any;
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});
