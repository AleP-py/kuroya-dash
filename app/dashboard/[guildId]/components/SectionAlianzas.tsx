'use client';

import { useState } from 'react';
import EmbedPickerPanel from './EmbedPickerPanel';

interface Props {
    config: any;
    channels: any[];
    roles: any[];
    embeds: any[];
    setEmbeds: (v: any[]) => void;
    onSave: (updates: Record<string, any>, seccion: string, incluirEmbeds?: boolean) => void;
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

export default function SectionAlianzas({ config, channels, roles, embeds, setEmbeds, onSave, saving }: Props) {
    const cfg = config.allyConfig || {};
    const puntos = cfg.puntosConfig || { alianza: 1, afiliacion: 2, socio: 3, network: 5 };

    // ─── Canales y roles ───
    const [channelId, setChannelId] = useState(cfg.channelId || '');
    const [pingRoleId, setPingRoleId] = useState(cfg.pingRoleId || '');
    const [logChannelId, setLogChannelId] = useState(cfg.logChannelId || '');
    const [managerRoleId, setManagerRoleId] = useState(cfg.managerRoleId || '');

    const [affChannelId, setAffChannelId] = useState(cfg.affiliationChannelId || '');
    const [affPing, setAffPing] = useState(cfg.affiliationPing || '');

    const [partnerCategoryId, setPartnerCategoryId] = useState(cfg.partnerCategoryId || '');
    const [partnerPing, setPartnerPing] = useState(cfg.partnerPing || '');

    const [networkCategoryId, setNetworkCategoryId] = useState(cfg.networkCategoryId || '');
    const [networkPing, setNetworkPing] = useState(cfg.networkPing || '');

    // ─── Embeds por módulo ───
    const [embedAlianza, setEmbedAlianza] = useState<string | null>(cfg.embedNombre || null);
    const [embedAfil, setEmbedAfil] = useState<string | null>(cfg.affiliationEmbedNombre || null);
    const [embedSocio, setEmbedSocio] = useState<string | null>(cfg.partnerEmbedNombre || null);
    const [embedNetwork, setEmbedNetwork] = useState<string | null>(cfg.networkEmbedNombre || null);

    // ─── Puntos ───
    const [puntosAlianza, setPuntosAlianza] = useState(puntos.alianza ?? 1);
    const [puntosAfil, setPuntosAfil] = useState(puntos.afiliacion ?? 2);
    const [puntosSocio, setPuntosSocio] = useState(puntos.socio ?? 3);
    const [puntosNetwork, setPuntosNetwork] = useState(puntos.network ?? 5);

    // ─── Seguridad ───
    const [antiDupe, setAntiDupe] = useState(cfg.antiDuplicados !== false);
    const [antiAuto, setAntiAuto] = useState(cfg.antiAutoAlianza !== false);
    const [cooldownStr, setCooldownStr] = useState(cfg.cooldownEntreAlianzasMs ? msToHuman(cfg.cooldownEntreAlianzasMs) : '');
    const [antiDupeStr, setAntiDupeStr] = useState(cfg.antiDuplicadosCooldownMs ? msToHuman(cfg.antiDuplicadosCooldownMs) : '');
    const [autoResetStr, setAutoResetStr] = useState(cfg.autoResetIntervalMs ? msToHuman(cfg.autoResetIntervalMs) : '');

    const textChannels = channels.filter((ch: any) => ch.type === 0);
    const categories = channels.filter((ch: any) => ch.type === 4);
    const assignableRoles = roles.filter((r: any) => r.name !== '@everyone' && !r.managed);

    function handleSave() {
        onSave({
            'allyConfig.channelId': channelId || null,
            'allyConfig.pingRoleId': pingRoleId || null,
            'allyConfig.logChannelId': logChannelId || null,
            'allyConfig.managerRoleId': managerRoleId || null,
            'allyConfig.embedNombre': embedAlianza || null,
            'allyConfig.affiliationChannelId': affChannelId || null,
            'allyConfig.affiliationPing': affPing || null,
            'allyConfig.affiliationEmbedNombre': embedAfil || null,
            'allyConfig.partnerCategoryId': partnerCategoryId || null,
            'allyConfig.partnerPing': partnerPing || null,
            'allyConfig.partnerEmbedNombre': embedSocio || null,
            'allyConfig.networkCategoryId': networkCategoryId || null,
            'allyConfig.networkPing': networkPing || null,
            'allyConfig.networkEmbedNombre': embedNetwork || null,
            'allyConfig.puntosConfig.alianza': puntosAlianza,
            'allyConfig.puntosConfig.afiliacion': puntosAfil,
            'allyConfig.puntosConfig.socio': puntosSocio,
            'allyConfig.puntosConfig.network': puntosNetwork,
            'allyConfig.cooldownEntreAlianzasMs': humanToMs(cooldownStr) || 0,
            'allyConfig.antiDuplicados': antiDupe,
            'allyConfig.antiDuplicadosCooldownMs': humanToMs(antiDupeStr) || 0,
            'allyConfig.antiAutoAlianza': antiAuto,
            'allyConfig.autoResetIntervalMs': humanToMs(autoResetStr) || 0,
            'allyConfig.autoResetNextTimestamp': (humanToMs(autoResetStr) || 0) > 0 ? Date.now() + (humanToMs(autoResetStr) || 0) : 0,
        }, 'Alianzas', true);
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
                <h3 className="text-lg font-semibold text-white">🤝 Alianzas</h3>
                <p className="text-xs text-purple-200/70">Canal principal donde se publican y detectan las invitaciones.</p>

                <ChannelSelect label="Canal de alianzas" value={channelId} onChange={setChannelId} />
                <RoleSelect label="Rol a mencionar" value={pingRoleId} onChange={setPingRoleId} />
                <RoleSelect label="Rol de Ally Manager" value={managerRoleId} onChange={setManagerRoleId} />
                <ChannelSelect label="Canal de auditoría (logs)" value={logChannelId} onChange={setLogChannelId} />

                <EmbedPickerPanel
                    embeds={embeds}
                    setEmbeds={setEmbeds}
                    selectedName={embedAlianza}
                    onSelect={setEmbedAlianza}
                    label="Embed personalizado para alianzas"
                    collapsible
                />
            </div>

            {/* ─── AFILIACIONES ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🎫 Afiliaciones</h3>
                <ChannelSelect label="Canal de afiliaciones" value={affChannelId} onChange={setAffChannelId} />
                <RoleSelect label="Rol a mencionar" value={affPing} onChange={setAffPing} />
                <EmbedPickerPanel
                    embeds={embeds}
                    setEmbeds={setEmbeds}
                    selectedName={embedAfil}
                    onSelect={setEmbedAfil}
                    label="Embed personalizado para afiliaciones"
                    collapsible
                />
            </div>

            {/* ─── SOCIOS ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">👑 Socios</h3>
                <CategorySelect label="Categoría de socios" value={partnerCategoryId} onChange={setPartnerCategoryId} />
                <RoleSelect label="Rol a mencionar" value={partnerPing} onChange={setPartnerPing} />
                <EmbedPickerPanel
                    embeds={embeds}
                    setEmbeds={setEmbeds}
                    selectedName={embedSocio}
                    onSelect={setEmbedSocio}
                    label="Embed personalizado para socios"
                    collapsible
                />
            </div>

            {/* ─── NETWORK ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">✨ Network</h3>
                <CategorySelect label="Categoría de network" value={networkCategoryId} onChange={setNetworkCategoryId} />
                <RoleSelect label="Rol a mencionar" value={networkPing} onChange={setNetworkPing} />
                <EmbedPickerPanel
                    embeds={embeds}
                    setEmbeds={setEmbeds}
                    selectedName={embedNetwork}
                    onSelect={setEmbedNetwork}
                    label="Embed personalizado para network"
                    collapsible
                />
            </div>

            {/* ─── PUNTOS ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🏆 Puntos por tipo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className={LABEL}>Alianza</label><input type="number" min={0} value={puntosAlianza} onChange={e => setPuntosAlianza(Number(e.target.value))} className={INPUT} /></div>
                    <div><label className={LABEL}>Afiliación</label><input type="number" min={0} value={puntosAfil} onChange={e => setPuntosAfil(Number(e.target.value))} className={INPUT} /></div>
                    <div><label className={LABEL}>Socio</label><input type="number" min={0} value={puntosSocio} onChange={e => setPuntosSocio(Number(e.target.value))} className={INPUT} /></div>
                    <div><label className={LABEL}>Network</label><input type="number" min={0} value={puntosNetwork} onChange={e => setPuntosNetwork(Number(e.target.value))} className={INPUT} /></div>
                </div>
            </div>

            {/* ─── SEGURIDAD ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🛡️ Seguridad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={LABEL}>Cooldown entre alianzas (30m, 1h)</label><input type="text" value={cooldownStr} onChange={e => setCooldownStr(e.target.value)} className={INPUT} placeholder="Vacío = sin cooldown" /></div>
                    <div><label className={LABEL}>Auto-reset puntos cada (7d, 30d)</label><input type="text" value={autoResetStr} onChange={e => setAutoResetStr(e.target.value)} className={INPUT} placeholder="Vacío = sin reset" /></div>
                </div>
                <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer">
                    <input type="checkbox" checked={antiAuto} onChange={e => setAntiAuto(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                    <span className="text-sm text-purple-100">Bloquear auto-alianza</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer">
                    <input type="checkbox" checked={antiDupe} onChange={e => setAntiDupe(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                    <span className="text-sm text-purple-100">Bloquear alianzas duplicadas</span>
                </label>
                {antiDupe && (
                    <div><label className={LABEL}>Cooldown anti-duplicados</label><input type="text" value={antiDupeStr} onChange={e => setAntiDupeStr(e.target.value)} className={INPUT} placeholder="Ej: 7d (vacío = permanente)" /></div>
                )}
            </div>

            <button type="button" onClick={handleSave} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar alianzas'}
            </button>
        </div>
    );
}
