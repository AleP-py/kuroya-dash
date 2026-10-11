'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BOT_URL = process.env.BOT_WEBHOOK_URL?.replace('/api/notify-change', '') 
    || 'http://194.163.175.95:3001';
const SECRET = process.env.DASHBOARD_SECRET || '';

export async function guardarConfig(guildId: string, guildName: string, updates: Record<string, any>, seccion: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("No autorizado");

    // 1. Guardar en MongoDB vía bot
    const res = await fetch(`${BOT_URL}/api/guilds/${guildId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SECRET}`,
        },
        body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Error guardando en el bot");

    // 2. Notificar por MD (opcional, sin bloquear)
    fetch(`${BOT_URL}/api/notify-change`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SECRET}`,
        },
        body: JSON.stringify({
            // @ts-ignore
            discordId: session.user.discordId,
            userName: session.user.name,
            guildId,
            guildName,
            changes: { seccion, campos: Object.keys(updates) }
        }),
    }).catch(() => {});

    return { success: true };
}
