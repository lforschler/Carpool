import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  parseCredentials,
  verifyPassword,
} from "@/lib/auth-credentials";
import { prisma } from "@/lib/prisma";

async function membershipForUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      membership: { include: { family: true } },
    },
  });
  if (!user) return null;
  return {
    familyId: user.membership?.familyId ?? null,
    groupId: user.membership?.family.groupId ?? null,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = parseCredentials(raw);
        if (!parsed) return null;

        const { email, password } = parsed;
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            membership: { include: { family: true } },
          },
        });
        if (!user) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          familyId: user.membership?.familyId ?? null,
          groupId: user.membership?.family.groupId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.familyId = (user as { familyId?: string | null }).familyId ?? null;
        token.groupId = (user as { groupId?: string | null }).groupId ?? null;
        return token;
      }

      // Re-seed / upsert can rotate family/group ids. Refresh from DB so Week
      // does not silently load an empty schedule for a stale groupId.
      if (token.userId) {
        try {
          const membership = await membershipForUserId(token.userId as string);
          if (!membership) {
            return {
              ...token,
              userId: undefined,
              familyId: null,
              groupId: null,
              email: undefined,
              name: undefined,
            };
          }
          token.familyId = membership.familyId;
          token.groupId = membership.groupId;
        } catch {
          /* keep prior token if DB briefly unavailable */
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.familyId = (token.familyId as string | null) ?? null;
        session.user.groupId = (token.groupId as string | null) ?? null;
      }
      return session;
    },
  },
});
