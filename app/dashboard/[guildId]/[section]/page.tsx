import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/app/components/Header";
import StarfieldBackground from "@/app/components/StarfieldBackground";
import Link from "next/link";
import GuildConfigClient from "../components/GuildConfigClient";

const BOT_URL = process.env.BOT_WEBHOOK_URL?.replace('/api/notify-change', '')
    || 'http://194.163.175.95:3001';

const VALID_SECTIONS = [
    'general', 'welcome', 'goodbye', 'automod', 'niveles',
    'comandos', 'alianzas', 'staff', 'autoroles', 'logs', 'embeds'
];
async function getConfig(guildId: string) {
    const res = await fetch(`${BOT_URL}/api/guilds/${guildId}`, {
        headers: { 'Authorization': `Bearer ${process.env.DASHBOARD_SECRET}` },
        cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()).config;
}

async function getChannels(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
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

async function getCommands() {
    const res = await fetch(`${BOT_URL}/api/commands`, {
        headers: { 'Authorization': `Bearer ${process.env.DASHBOARD_SECRET}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()).commands || [];
}

export default async function SectionPage({
    params,
}: {
    params: { guildId: string; section: string };
}) {
    if (!VALID_SECTIONS.includes(params.section)) notFound();

    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const [config, channels, roles, guildInfo, commands] = await Promise.all([
        getConfig(params.guildId),
        getChannels(params.guildId),
        getRoles(params.guildId),
        getGuildInfo(params.guildId),
        getCommands(),
    ]);

    if (!config) {
        return (
            <>
                <StarfieldBackground />
                <Header />
                <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <div className="bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-12">
                        <h1 className="text-2xl text-white mb-4">No se pudo cargar la configuración</h1>
                        <Link href={`/dashboard/${params.guildId}`} className="inline-block bg-gradient-to-r from-[#5865F2] to-[#9B59B6] text-white font-bold px-6 py-3 rounded-xl">
                            ← Volver al inicio
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    const guildName = guildInfo?.name || params.guildId;
    const guildIcon = guildInfo?.icon
        ? `https://cdn.discordapp.com/icons/${params.guildId}/${guildInfo.icon}.png`
        : null;

    return (
        <>
            <StarfieldBackground />
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header con breadcrumb */}
                <div className="flex items-center gap-4 mb-8">
                    {guildIcon ? (
                        <img src={guildIcon} alt={guildName} className="w-14 h-14 rounded-full border-2 border-[#5865F2]/50" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5865F2] to-[#9B59B6] flex items-center justify-center font-bold text-xl text-white">
                            {guildName.charAt(0)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/${params.guildId}`} className="text-xs text-purple-300/70 hover:text-purple-200 transition-colors">
                            ← Volver al inicio
                        </Link>
                        <h1 className="text-2xl font-bold text-white truncate">
                            {guildName} <span className="text-purple-300/40">/</span> <span className="capitalize">{params.section}</span>
                        </h1>
                    </div>
                </div>

                <GuildConfigClient
                    guildId={params.guildId}
                    guildName={guildName}
                    initialConfig={config}
                    channels={channels}
                    roles={roles}
                    commands={commands}
                    section={params.section}
                />
            </main>
        </>
    );
}
