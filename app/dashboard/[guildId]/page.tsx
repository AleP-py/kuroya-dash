import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/app/components/Header";
import StarfieldBackground from "@/app/components/StarfieldBackground";
import Link from "next/link";

const BOT_URL = process.env.BOT_WEBHOOK_URL?.replace('/api/notify-change', '')
    || 'http://194.163.175.95:3001';

async function getGuildInfo(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}?with_counts=true`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
}

async function getChannelsCount(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    const channels = await res.json();
    return channels;
}

async function getRolesCount(guildId: string) {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/roles`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
}

const CATEGORIES = [
    {
        title: 'Principal',
        subtitle: 'Explora la categoría Principal',
        items: [
            { href: 'general',      icon: '⚙️', title: 'Ajustes',       desc: 'Prefijo, roles con acceso, moderación y economía local.' },
            { href: 'welcome',      icon: '👋', title: 'Bienvenidas',   desc: 'Mensajes automáticos de bienvenida.' },
            { href: 'goodbye',      icon: '👋', title: 'Despedidas',    desc: 'Mensajes automáticos de despedida.' },
        ],
    },
    {
        title: 'Moderación',
        subtitle: 'Herramientas de control y protección',
        items: [
            { href: 'automod',      icon: '🛡️', title: 'AutoMod',       desc: 'Filtros automáticos con IA contextual.' },
            { href: 'comandos',     icon: '🚫', title: 'Comandos',      desc: 'Activa o desactiva comandos y módulos.' },
            { href: 'logs',         icon: '📜', title: 'Logs',          desc: 'Canales de auditoría y registros.' },
        ],
    },
    {
        title: 'Comunidad',
        subtitle: 'Niveles, roles y relaciones',
        items: [
            { href: 'niveles',      icon: '📈', title: 'Niveles',       desc: 'Sistema de XP local, recompensas y multiplicadores.' },
            { href: 'autoroles',    icon: '🎭', title: 'AutoRoles',     desc: 'Roles que se asignan al entrar.' },
            { href: 'staff',        icon: '👔', title: 'Staff',         desc: 'Directorio, mapeo de roles y calificaciones.' },
            { href: 'alianzas',     icon: '🤝', title: 'Alianzas',      desc: 'Sistema de alianzas, afiliaciones y network.' },
        ],
    },
];

export default async function GuildHome({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const [guildInfo, channels, roles] = await Promise.all([
        getGuildInfo(params.guildId),
        getChannelsCount(params.guildId),
        getRolesCount(params.guildId),
    ]);

    if (!guildInfo) {
        return (
            <>
                <StarfieldBackground />
                <Header />
                <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <div className="bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-12">
                        <p className="text-4xl mb-4">😢</p>
                        <h1 className="text-2xl text-white mb-2">No pude cargar el servidor</h1>
                        <Link href="/dashboard" className="inline-block mt-6 bg-gradient-to-r from-[#5865F2] to-[#9B59B6] text-white font-bold px-6 py-3 rounded-xl">
                            ← Volver
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    const guildName = guildInfo.name;
    const memberCount = guildInfo.approximate_member_count || 0;
    const channelCount = channels.length;
    const roleCount = roles.length;

    const icon = guildInfo.icon
        ? `https://cdn.discordapp.com/icons/${params.guildId}/${guildInfo.icon}.png`
        : null;

    return (
        <>
            <StarfieldBackground />
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Banner bienvenida */}
                <div className="relative bg-gradient-to-br from-[#1b172e]/80 to-[#2a1f4d]/80 backdrop-blur-xl border border-[#3b2d63]/60 rounded-3xl p-8 md:p-12 overflow-hidden glow-purple">
                    <div className="absolute top-4 left-4">
                        <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-purple-200/80">
                            ✨ Dashboard del servidor
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-4">
                                {icon ? (
                                    <img src={icon} alt={guildName} className="w-20 h-20 rounded-2xl border-2 border-[#5865F2]/40 shadow-lg" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#9B59B6] flex items-center justify-center font-bold text-3xl text-white">
                                        {guildName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                                Bienvenido a <span className="bg-gradient-to-r from-[#5865F2] to-[#c084fc] bg-clip-text text-transparent">{guildName}</span>
                            </h1>
                            <p className="text-purple-200/70 text-lg max-w-2xl leading-relaxed">
                                Empieza desde aquí con una vista general de los módulos disponibles. 
                                Kuroya es un bot multifunción y desde aquí puedes explorar todo lo que puede hacer por tu servidor.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <Link href={`/dashboard/${params.guildId}/general`}
                                    className="bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] text-white font-semibold px-5 py-2.5 rounded-xl transition-all btn-glow">
                                    ⚙️ Ajustes
                                </Link>
                                <Link href={`/dashboard/${params.guildId}/welcome`}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-5 py-2.5 rounded-xl transition-all">
                                    👋 Bienvenidas
                                </Link>
                                <Link href={`/dashboard/${params.guildId}/autoroles`}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-5 py-2.5 rounded-xl transition-all">
                                    🎭 AutoRoles
                                </Link>
                            </div>
                        </div>

                        {/* Stats a la derecha */}
                        <div className="grid grid-cols-1 gap-3 w-full md:w-72">
                            <div className="bg-[#0f0f13]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-white">{memberCount.toLocaleString()}</p>
                                    <p className="text-xs text-purple-300/70">Miembros</p>
                                </div>
                                <span className="text-2xl opacity-60">👥</span>
                            </div>
                            <div className="bg-[#0f0f13]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-white">{channelCount.toLocaleString()}</p>
                                    <p className="text-xs text-purple-300/70">Canales</p>
                                </div>
                                <span className="text-2xl opacity-60">#️⃣</span>
                            </div>
                            <div className="bg-[#0f0f13]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-white">{roleCount.toLocaleString()}</p>
                                    <p className="text-xs text-purple-300/70">Roles</p>
                                </div>
                                <span className="text-2xl opacity-60">🛡️</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categorías */}
                <div className="mt-12 space-y-12">
                    {CATEGORIES.map(cat => (
                        <section key={cat.title}>
                            <h2 className="text-2xl font-bold text-white mb-1">{cat.title}</h2>
                            <p className="text-sm text-purple-300/60 mb-5">{cat.subtitle}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {cat.items.map(item => (
                                    <Link
                                        key={item.href}
                                        href={`/dashboard/${params.guildId}/${item.href}`}
                                        className="group bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 hover:border-[#5865F2]/60 hover:bg-[#221c3a]/80 transition-all btn-glow flex flex-col"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-3xl">{item.icon}</span>
                                            <span className="text-purple-300/40 group-hover:text-[#5865F2] transition-colors text-xl">→</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                        <p className="text-sm text-purple-200/60 leading-relaxed flex-1">{item.desc}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <footer className="mt-16 pb-8 text-center text-xs text-purple-300/30">
                    © 2026 Kuroya Dashboard · Todos los derechos reservados
                </footer>
            </main>
        </>
    );
}
