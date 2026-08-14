import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";

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
      if (token.email) {
        token.accessToken = crypto
          .createHmac("sha256", process.env.NEXTAUTH_SECRET)
          .update(token.email)
          .digest("hex");
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.token = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
