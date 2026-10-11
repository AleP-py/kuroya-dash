'use client';

import { useState } from 'react';

interface Props {
    config: any;
    channels: any[];
    roles: any[];
    onSave: (updates: Record<string, any>, seccion: string) => void;
    saving: boolean;
}

const CARD = 'bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 space-y-4';
const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';
const BTN_SAVE = 'w-full bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all btn-glow';

function msToHuman(ms: number): string {
    if (!ms) return '';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
}

function humanToMs(str: string): number | null {
    if (!str || !str.trim()) return null;
    const match = str.trim().toLowerCase().match(/^(\d+)\s*(s|m|h|d|w)?$/);
    if (!match) return null;
    const val = parseInt(match[1]);
    const unit = match[2] || 'm';
    const mult: any = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
    return val * mult[unit];
}

export default function SectionAlianzas({ config, channels, roles, onSave, saving }: Props) {
    const cfg = config.allyConfig || {};
    const puntos = cfg.puntosConfig || { alianza: 1, afiliacion: 2, socio: 3, network: 5 };

    // ─── Alianzas ───
    const [channelId, setChannelId] = useState(cfg.channelId || '');
    const [pingRoleId, setPingRoleId] = useState(cfg.pingRoleId || '');
    const [logChannelId, setLogChannelId] = useState(cfg.logChannelId || '');
    const [managerRoleId, setManagerRoleId] = useState(cfg.managerRoleId || '');

    // ─── Afiliaciones ───
    const [affChannelId, setAffChannelId] = useState(cfg.affiliationChannelId || '');
    const [affPing, setAffPing] = useState(cfg.affiliationPing || '');

    // ─── Socios ───
    const [partnerCategoryId, setPartnerCategoryId] = useState(cfg.partnerCategoryId || '');
    const [partnerPing, setPartnerPing] = useState(cfg.partnerPing || '');

    // ─── Network ───
    const [networkCategoryId, setNetworkCategoryId] = useState(cfg.networkCategoryId || '');
    const [networkPing, setNetworkPing] = useState(cfg.networkPing || '');

    // ─── Puntos ───
    const [puntosAlianza, setPuntosAlianza] = useState(puntos.alianza ?? 1);
    const [puntosAfil, setPuntosAfil] = useState(puntos.afiliacion ?? 2);
    const [puntosSocio, setPuntosSocio] = useState(puntos.socio ?? 3);
    const [puntosNetwork, setPuntosNetwork] = useState(puntos.network ?? 5);

    // ─── Seguridad ───
    const [cooldownMs, setCooldownMs] = useState(cfg.cooldownEntreAlianzasMs || 0);
    const [antiDupe, setAntiDupe] = useState(cfg.antiDuplicados !== false);
    const [antiDupeCooldown, setAntiDupeCooldown] = useState(cfg.antiDuplicadosCooldownMs || 0);
    const [antiAuto, setAntiAuto] = useState(cfg.antiAutoAlianza !== false);

    // ─── Auto-reset ───
    const [autoResetMs, setAutoResetMs] = useState(cfg.autoResetIntervalMs || 0);

    const textChannels = channels.filter((c: any) => c.type === 0);
    const categories = channels.filter((c: any) => c.type === 4);
    const assignableRoles = roles.filter((r: any) => r.name !== '@everyone' && !r.managed);

    const [cooldownStr, setCooldownStr] = useState(cfg.cooldownEntreAlianzasMs ? msToHuman(cfg.cooldownEntreAlianzasMs) : '');
    const [antiDupeStr, setAntiDupeStr] = useState(cfg.antiDuplicadosCooldownMs ? msToHuman(cfg.antiDuplicadosCooldownMs) : '');
    const [autoResetStr, setAutoResetStr] = useState(cfg.autoResetIntervalMs ? msToHuman(cfg.autoResetIntervalMs) : '');

    function handleSave() {
        const cdMs = humanToMs(cooldownStr) || 0;
        const dupeMs = humanToMs(antiDupeStr) || 0;
        const resetMs = humanToMs(autoResetStr) || 0;

        onSave({
            'allyConfig.channelId': channelId || null,
            'allyConfig.pingRoleId': pingRoleId || null,
            'allyConfig.logChannelId': logChannelId || null,
            'allyConfig.managerRoleId': managerRoleId || null,
            'allyConfig.affiliationChannelId': affChannelId || null,
            'allyConfig.affiliationPing': affPing || null,
            'allyConfig.partnerCategoryId': partnerCategoryId || null,
            'allyConfig.partnerPing': partnerPing || null,
            'allyConfig.networkCategoryId': networkCategoryId || null,
            'allyConfig.networkPing': networkPing || null,
            'allyConfig.puntosConfig.alianza': puntosAlianza,
            'allyConfig.puntosConfig.afiliacion': puntosAfil,
            'allyConfig.puntosConfig.socio': puntosSocio,
            'allyConfig.puntosConfig.network': puntosNetwork,
            'allyConfig.cooldownEntreAlianzasMs': cdMs,
            'allyConfig.antiDuplicados': antiDupe,
            'allyConfig.antiDuplicadosCooldownMs': dupeMs,
            'allyConfig.antiAutoAlianza': antiAuto,
            'allyConfig.autoResetIntervalMs': resetMs,
            'allyConfig.autoResetNextTimestamp': resetMs > 0 ? Date.now() + resetMs : 0,
        }, 'Alianzas');
    }

    const ChannelSelect = ({ value, onChange, label }: any) => (
        <div>
            <label className={LABEL}>{label}</label>
            <select value={value} onChange={(e: any) => onChange(e.target.value)} className={INPUT}>
                <option value="">Sin canal</option>
                {textChannels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
        </div>
    );

    const RoleSelect = ({ value, onChange, label }: any) => (
        <div>
            <label className={LABEL}>{label}</label>
            <select value={value} onChange={(e: any) => onChange(e.target.value)} className={INPUT}>
                <option value="">Sin rol</option>
                {assignableRoles.map((r: any) => <option key={r.id} value={r.id}>@{r.name}</option>)}
            </select>
        </div>
    );

    const CategorySelect = ({ value, onChange, label }: any) => (
        <div>
            <label className={LABEL}>{label}</label>
            <select value={value} onChange={(e: any) => onChange(e.target.value)} className={INPUT}>
                <option value="">Sin categoría</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>📁 {c.name}</option>)}
            </select>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* ─── ALIANZAS ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🤝 Canal principal de Alianzas</h3>
                <p className="text-xs text-purple-200/70">Aquí se publican las alianzas y se detectan los links de invitación.</p>
                <ChannelSelect label="Canal de alianzas" value={channelId} onChange={setChannelId} />
                <RoleSelect label="Rol a mencionar al recibir alianza" value={pingRoleId} onChange={setPingRoleId} />
                <RoleSelect label="Rol de Ally Manager (puede configurar sin ser admin)" value={managerRoleId} onChange={setManagerRoleId} />
                <ChannelSelect label="Canal de auditoría (logs)" value={logChannelId} onChange={setLogChannelId} />
            </div>

            {/* ─── AFILIACIONES ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🎫 Afiliaciones</h3>
                <ChannelSelect label="Canal de afiliaciones" value={affChannelId} onChange={setAffChannelId} />
                <RoleSelect label="Rol a mencionar" value={affPing} onChange={setAffPing} />
            </div>

            {/* ─── SOCIOS ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">👑 Socios</h3>
                <p className="text-xs text-purple-200/70">Se activa al enviar una invitación dentro de la categoría asignada.</p>
                <CategorySelect label="Categoría de socios" value={partnerCategoryId} onChange={setPartnerCategoryId} />
                <RoleSelect label="Rol a mencionar" value={partnerPing} onChange={setPartnerPing} />
            </div>

            {/* ─── NETWORK ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">✨ Network</h3>
                <CategorySelect label="Categoría de network" value={networkCategoryId} onChange={setNetworkCategoryId} />
                <RoleSelect label="Rol a mencionar" value={networkPing} onChange={setNetworkPing} />
            </div>

            {/* ─── PUNTOS ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🏆 Puntos por tipo de relación</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className={LABEL}>Alianza</label>
                        <input type="number" min={0} value={puntosAlianza} onChange={e => setPuntosAlianza(Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Afiliación</label>
                        <input type="number" min={0} value={puntosAfil} onChange={e => setPuntosAfil(Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Socio</label>
                        <input type="number" min={0} value={puntosSocio} onChange={e => setPuntosSocio(Number(e.target.value))} className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Network</label>
                        <input type="number" min={0} value={puntosNetwork} onChange={e => setPuntosNetwork(Number(e.target.value))} className={INPUT} />
                    </div>
                </div>
            </div>

            {/* ─── SEGURIDAD ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🛡️ Seguridad y límites</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL}>Cooldown entre alianzas (ej: 30m, 1h)</label>
                        <input type="text" placeholder="Vacío = sin cooldown" value={cooldownStr} onChange={e => setCooldownStr(e.target.value)} className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Auto-reset puntos cada (ej: 7d, 30d)</label>
                        <input type="text" placeholder="Vacío = sin reset" value={autoResetStr} onChange={e => setAutoResetStr(e.target.value)} className={INPUT} />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50">
                    <input type="checkbox" checked={antiAuto} onChange={e => setAntiAuto(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                    <span className="text-sm text-purple-100">Bloquear auto-alianza (no puedes aliarte con tu propio servidor)</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50">
                    <input type="checkbox" checked={antiDupe} onChange={e => setAntiDupe(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                    <span className="text-sm text-purple-100">Bloquear alianzas duplicadas con el mismo servidor</span>
                </div>

                {antiDupe && (
                    <div>
                        <label className={LABEL}>Cooldown anti-duplicados (vacío = permanente)</label>
                        <input type="text" placeholder="Ej: 7d (permite re-aliarse después)" value={antiDupeStr} onChange={e => setAntiDupeStr(e.target.value)} className={INPUT} />
                    </div>
                )}
            </div>

            <button type="button" onClick={handleSave} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar configuración de alianzas'}
            </button>
        </div>
    );
}
