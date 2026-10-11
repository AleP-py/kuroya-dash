import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/app/components/Header";

// Función para obtener los canales de Discord usando el Token del Bot
async function getGuildChannels(guildId: string) {
  const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function GuildConfigPage({ params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { guildId } = params;

  // 1. Obtenemos la configuración guardada en Prisma (o la creamos si no existe)
  const guildConfig = await prisma.guild.upsert({
    where: { id: guildId },
    update: {},
    create: { id: guildId, name: "Servidor Nuevo" },
  });

  // 2. Obtenemos los canales de texto de Discord
  const channels = await getGuildChannels(guildId);
  const textChannels = channels.filter((c: any) => c.type === 0); // Tipo 0 = Canal de texto

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
            ← Volver
          </Link>
          <h1 className="text-3xl font-bold text-white">Configurando: {guildConfig.name}</h1>
        </div>

        <form action={`/api/guilds/${guildId}`} method="POST" className="space-y-8">
          
          {/* Sección: General */}
          <section className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">⚙️ General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-purple-200 mb-1">Prefijo del Bot</label>
                <input 
                  type="text" 
                  name="prefix" 
                  defaultValue={guildConfig.prefix} 
                  className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Sección: Bienvenidas */}
          <section className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">👋 Bienvenidas</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="welcomeEnabled" defaultChecked={guildConfig.welcomeEnabled} className="w-4 h-4" />
                <label className="text-sm text-purple-200">Activar mensaje de bienvenida</label>
              </div>
              <div>
                <label className="block text-sm text-purple-200 mb-1">Canal de Bienvenida</label>
                <select name="welcomeChannelId" defaultValue={guildConfig.welcomeChannelId || ""} className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white">
                  <option value="">Selecciona un canal...</option>
                  {textChannels.map((ch: any) => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-purple-200 mb-1">Mensaje de Bienvenida</label>
                <textarea 
                  name="welcomeMessage" 
                  defaultValue={guildConfig.welcomeMessage || "¡Bienvenido {user} a {server}!"} 
                  rows={3}
                  className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Variables: {"{user}"}, {"{server}"}, {"{memberCount}"}</p>
              </div>
            </div>
          </section>

          {/* Botón Guardar */}
          <button type="submit" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 rounded-lg transition-colors">
            Guardar Cambios
          </button>
        </form>
      </main>
    </>
  );
}
