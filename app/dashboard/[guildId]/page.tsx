import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/app/components/Header";
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
    return channels.filter((c: any) => c.type === 0); // solo texto
}

async function getRoles(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
}

export default async function GuildConfigPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const config = await getConfig(params.guildId);
    if (!config) return <div>Error cargando config</div>;

    const [channels, roles] = await Promise.all([
        getChannels(params.guildId),
        getRoles(params.guildId),
    ]);

    return (
        <>
            <Header />
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">← Volver</Link>
                    <h1 className="text-3xl font-bold text-white">Configurando: {config.guildId}</h1>
                </div>

                <ConfigTabs 
                    guildId={params.guildId} 
                    guildName={config.guildId}
                    initialConfig={config}
                    channels={channels}
                    roles={roles}
                />
            </main>
        </>
    );
}
