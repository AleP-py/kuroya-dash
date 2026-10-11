import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  // Forzamos el uso de JWT para manejar los tokens de acceso de Discord
  session: {
    strategy: "jwt", 
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      wellKnown: undefined, // <--- ESTA LÍNEA SOLUCIONA EL ERROR
      authorization: {
        params: { scope: "identify guilds" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Al iniciar sesión, guardamos el access_token de Discord en el token JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasamos el access_token y el id al frontend (Dashboard)
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.accessToken = token.accessToken; 
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
