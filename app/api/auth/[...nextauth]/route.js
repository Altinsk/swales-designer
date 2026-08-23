import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signin: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Only present on the initial sign-in request. Persist Google's own
      // signed id_token so the backend can verify it against Google's public
      // keys (aud/iss/exp/signature) instead of trusting a value we made up.
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.token = token.idToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
