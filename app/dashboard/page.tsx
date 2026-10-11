import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/app/components/Header"; // Usamos tu componente Header
import { redirect } from "next/navigation";

async function getDiscordGuilds(accessToken: string) {
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Si no hay sesión, lo mandamos a la página de inicio a loguearse
  if (!session) {
    redirect("/");
  }

  const accessToken = (session as any).accessToken;
  const guilds = await getDiscordGuilds(accessToken);

  // Filtramos: El usuario debe ser Admin (0x8) o tener permiso de Gestionar Servidor (0x20)
  const adminGuilds = guilds.filter((g: any) => {
    const perms = BigInt(g.permissions);
    return (perms & BigInt(0x8)) === BigInt(0x8) || (perms & BigInt(0x20)) === BigInt(0x20);
  });

  // Sincronizamos con la base de datos (Prisma)
  for (const guild of adminGuilds) {
    await prisma.guild.upsert({
      where: { id: guild.id },
      update: { name: guild.name, icon: guild.icon },
      create: { id: guild.id, name: guild.name, icon: guild.icon },
    });
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Tus Servidores</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Hola, {session.user?.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-1 rounded">
              Cerrar sesión
            </Link>
          </div>
        </div>

        {adminGuilds.length === 0 ? (
          <div className="bg-[#1b172e]/80 border border-[#3b2d63] rounded-xl p-8 text-center text-purple-200/60">
            No tienes servidores donde seas administrador o donde puedas configurar a Kuroya.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminGuilds.map((guild: any) => (
              <Link 
                key={guild.id} 
                href={`/dashboard/${guild.id}`}
                className="bg-[#1b172e]/80 border border-[#3b2d63] p-5 rounded-xl hover:border-purple-500 hover:bg-[#25203b] transition-all flex items-center gap-4 group"
              >
                {guild.icon ? (
                  <img 
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                    alt={guild.name} 
                    className="w-14 h-14 rounded-full shadow-lg group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                    {guild.name.charAt(0)}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-bold text-lg truncate text-white">{guild.name}</h3>
                  <p className="text-xs text-gray-500">ID: {guild.id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
