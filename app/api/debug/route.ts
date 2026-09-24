import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.DISCORD_CLIENT_ID,
    clientId: process.env.DISCORD_CLIENT_ID?.slice(0, 6) + "...",
    hasSecret: !!process.env.DISCORD_CLIENT_SECRET,
    secretLength: process.env.DISCORD_CLIENT_SECRET?.length,
    nextauthUrl: process.env.NEXTAUTH_URL,
    hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
  });
}
