import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { guildId } = params;
  const formData = await req.formData();

  const prefix = formData.get("prefix") as string;
  const welcomeEnabled = formData.get("welcomeEnabled") === "on";
  const welcomeChannelId = formData.get("welcomeChannelId") as string;
  const welcomeMessage = formData.get("welcomeMessage") as string;

  // Actualizamos en la base de datos
  await prisma.guild.update({
    where: { id: guildId },
    data: {
      prefix,
      welcomeEnabled,
      welcomeChannelId: welcomeChannelId || null,
      welcomeMessage: welcomeMessage || null,
    },
  });

  // 👇 LA MAGIA ESTÁ AQUÍ: Usamos la URL pública de las variables de entorno
  const baseUrl = process.env.NEXTAUTH_URL || "https://auuzbio7cj.apps.bot-hosting.cloud";
  
  return NextResponse.redirect(new URL(`/dashboard/${guildId}`, baseUrl));
}
