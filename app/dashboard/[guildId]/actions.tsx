'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BOT_URL = process.env.BOT_WEBHOOK_URL?.replace('/api/notify-change', '')
    || 'http://194.163.175.95:3001';
const SECRET = process.env.DASHBOARD_SECRET || '';

export async function guardarConfig(
    guildId: string,
    guildName: string,
    updates: Record<string, any>,
    seccion: string,
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("No autorizado");

    // 1. Guardar en MongoDB vía bot (el bot calculará los diffs y enviará el MD)
    const res = await fetch(`${BOT_URL}/api/guilds/${guildId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SECRET}`,
        },
        body: JSON.stringify({
            updates,
            meta: {
                // @ts-ignore
                discordId: session.user.discordId,
                userName: session.user.name,
                guildName,
                seccion,
            },
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || 'Error guardando en el bot');
    }

    return { success: true };
}
