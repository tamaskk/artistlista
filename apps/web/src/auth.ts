import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
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
      if (!user?.passwordHash || user.status === "banned") return null;
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});
