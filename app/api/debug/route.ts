import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: any = {
    env: {
      hasClientId: !!process.env.DISCORD_CLIENT_ID,
      hasSecret: !!process.env.DISCORD_CLIENT_SECRET,
      secretLength: process.env.DISCORD_CLIENT_SECRET?.length,
      nextauthUrl: process.env.NEXTAUTH_URL,
      hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
    },
    db: {},
  };

  // 1. Probar conexión básica
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.db.connection = "ok";
  } catch (e: any) {
    results.db.connection = "error: " + e.message;
    return NextResponse.json(results);
  }

  // 2. Probar cada tabla de NextAuth
  const tables = ["user", "account", "session", "verificationToken", "guild"];
  for (const t of tables) {
    try {
      // @ts-ignore
      const count = await prisma[t].count();
      results.db[t] = { status: "ok", count };
    } catch (e: any) {
      results.db[t] = { status: "error", message: e.message };
    }
  }

  return NextResponse.json(results);
}
