import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/app/components/Header";
import StarfieldBackground from "@/app/components/StarfieldBackground";
import Link from "next/link";
import ConfigTabs from "./components/ConfigTabs";

const BOT_URL = process.env.BOT_WEBHOOK_URL?.replace('/api/notify-change', '') 
    || 'http://194.163.175.95:3001';

async function getConfig(guildId: string) {
    const res = await fetch(`${BOT_URL}/api/guilds/${guildId}`, {
        headers: { 'Authorization': `Bearer ${process.env.DASHBOARD_SECRET}` },
        cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.config;
}

async function getChannels(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    const channels = await res.json();
    return channels.filter((c: any) => c.type === 0);
}

async function getRoles(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
}

async function getGuildInfo(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
}

export default async function GuildConfigPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const config = await getConfig(params.guildId);
    if (!config) {
        return (
            <>
                <StarfieldBackground />
                <Header />
                <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <div className="bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-12">
                        <p className="text-4xl mb-4">😢</p>
                        <h1 className="text-2xl text-white mb-2">No se pudo cargar la configuración</h1>
                        <p className="text-purple-300/70 mb-6">Verifica que el bot esté en línea.</p>
                        <Link href="/dashboard" className="inline-block bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl transition-all">
                            ← Volver al dashboard
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    const [channels, roles, guildInfo] = await Promise.all([
        getChannels(params.guildId),
        getRoles(params.guildId),
        getGuildInfo(params.guildId),
    ]);

    const guildName = guildInfo?.name || config.guildId;

    return (
        <>
            <StarfieldBackground />
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center gap-4 mb-8">
                    {guildInfo?.icon ? (
                        <img
                            src={`https://cdn.discordapp.com/icons/${params.guildId}/${guildInfo.icon}.png`}
                            alt={guildName}
                            className="w-14 h-14 rounded-full border-2 border-[#5865F2]/50"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5865F2] to-[#9B59B6] flex items-center justify-center font-bold text-xl text-white border-2 border-[#5865F2]/50">
                            {guildName.charAt(0)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <Link href="/dashboard" className="text-xs text-purple-300/70 hover:text-purple-200 transition-colors">
                            ← Volver al listado
                        </Link>
                        <h1 className="text-3xl font-bold text-white tracking-tight truncate">
                            Configurando: <span className="bg-gradient-to-r from-[#5865F2] to-[#9B59B6] bg-clip-text text-transparent">{guildName}</span>
                        </h1>
                    </div>
                </div>

                <ConfigTabs
                    guildId={params.guildId}
                    guildName={guildName}
                    initialConfig={config}
                    channels={channels}
                    roles={roles}
                />
            </main>
        </>
    );
}
