import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./types/forms";
import { getUserByEmail, getUserById } from "./data/user";
import bcrypt from "bcryptjs";

declare module "@auth/core/types" {
  interface Session {
    user: User | null
  }
}

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validateFields = signInSchema.safeParse(credentials);

        if (validateFields.success) {
          const { email, password } = validateFields.data;

          const user = await getUserByEmail(email);

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (!token.sub) return session;

      const existingUser = await getUserById(token.sub as string);

      if (!existingUser) return session;

      session.user = existingUser;

      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub as string);

      if (!existingUser) return token;

      token.user = existingUser;

      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
} satisfies NextAuthConfig;
