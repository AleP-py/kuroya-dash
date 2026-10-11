import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  
  // 👇 CAMBIO AQUÍ: Validamos session Y session.user
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { guildId } = params;
  const formData = await req.formData();

  const prefix = formData.get("prefix") as string;
  const welcomeEnabled = formData.get("welcomeEnabled") === "on";
  const welcomeChannelId = formData.get("welcomeChannelId") as string;
  const welcomeMessage = formData.get("welcomeMessage") as string;

  // 1. Actualizamos en la base de datos (Postgres)
  const updatedGuild = await prisma.guild.update({
    where: { id: guildId },
    data: {
      prefix,
      welcomeEnabled,
      welcomeChannelId: welcomeChannelId || null,
      welcomeMessage: welcomeMessage || null,
    },
  });

  // 2. Enviamos la notificación al bot (Webhook)
  try {
    const botWebhookUrl = process.env.BOT_WEBHOOK_URL || "http://127.0.0.1:3001/api/notify-change";
    
    await fetch(botWebhookUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DASHBOARD_SECRET || ''}`
      },
      body: JSON.stringify({
        // @ts-ignore
        discordId: session.user.discordId,
        // 👇 CAMBIO AQUÍ: TypeScript ya sabe que session.user existe
        userName: session.user.name,
        guildId: guildId,
        guildName: updatedGuild.name,
        changes: { prefix, welcomeEnabled, welcomeChannelId, welcomeMessage }
      }),
    });
  } catch (error) {
    console.error("Error notificando al bot:", error);
  }

  // 3. Redirigimos de vuelta
  const baseUrl = process.env.NEXTAUTH_URL || "https://auuzbio7cj.apps.bot-hosting.cloud";
  return NextResponse.redirect(new URL(`/dashboard/${guildId}`, baseUrl));
}
