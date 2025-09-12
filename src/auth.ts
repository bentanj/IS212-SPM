import NextAuth, { User } from "next-auth"
import type { Provider } from "next-auth/providers"

const providers: Provider[] = [
  // Add your providers here
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user }: { user: User | null }) {
      // Edit code here to add functions to be taken during sign in
      return true;
    },

    async jwt({ token, user }) {
      // Edit code here to add attributes to jwt token
      return token;
    },

    async session({ session, token }) {
      // Edit code here to add attributes to session token
      return session;
    },
  },
})