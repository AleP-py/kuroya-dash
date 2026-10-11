'use client';

import { useState } from 'react';
import { guardarConfig } from '../actions';

interface Props {
    guildId: string;
    guildName: string;
    initialConfig: any;
    channels: any[];
    roles: any[];
}

const TABS = [
    { id: 'general',   label: '⚙️ General' },
    { id: 'welcome',   label: '👋 Bienvenidas' },
    { id: 'goodbye',   label: '👋 Despedidas' },
    { id: 'automod',   label: '🛡️ AutoMod' },
    { id: 'niveles',   label: '📈 Niveles' },
    { id: 'autoroles', label: '🎭 AutoRoles' },
    { id: 'logs',      label: '📜 Logs' },
];

export default function ConfigTabs({ guildId, guildName, initialConfig, channels, roles }: Props) {
    const [tab, setTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    async function handleSave(updates: Record<string, any>, seccion: string) {
        setSaving(true);
        setMsg(null);
        try {
            await guardarConfig(guildId, guildName, updates, seccion);
            setMsg('✅ Guardado correctamente. Revisa tu MD.');
        } catch (e: any) {
            setMsg('❌ Error: ' + e.message);
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 4000);
        }
    }

    return (
        <div>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[#3b2d63] mb-6">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                            tab === t.id
                                ? 'bg-[#1b172e] text-white border border-b-0 border-[#3b2d63]'
                                : 'text-purple-200/60 hover:text-purple-200'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Mensaje */}
            {msg && (
                <div className="mb-4 p-3 rounded-lg bg-[#1b172e] border border-[#3b2d63] text-sm text-white">
                    {msg}
                </div>
            )}

            {/* Contenido — UNA SOLA VEZ POR TAB */}
            {tab === 'general'   && <SectionGeneral   config={initialConfig} onSave={handleSave} saving={saving} />}
            {tab === 'welcome'   && <SectionWelcome   config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
            {tab === 'goodbye'   && <SectionGoodbye   config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
            {tab === 'automod'   && <SectionAutomod   config={initialConfig} channels={channels} roles={roles} onSave={handleSave} saving={saving} />}
            {tab === 'niveles'   && <SectionPlaceholder name="Niveles" />}
            {tab === 'autoroles' && <SectionAutoRoles config={initialConfig} roles={roles} onSave={handleSave} saving={saving} />}
            {tab === 'logs'      && <SectionLogs      config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
        </div>
    );
}

// ─── Placeholder ─────────────────────────────────────────
function SectionPlaceholder({ name }: { name: string }) {
    return (
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-8 rounded-xl text-center text-purple-200/60">
            🚧 Sección de <strong>{name}</strong> en construcción.
        </div>
    );
}

// ─── GENERAL ─────────────────────────────────────────────
function SectionGeneral({ config, onSave, saving }: any) {
    const [prefix, setPrefix] = useState(config.prefix || '!');
    const [stealEnabled, setStealEnabled] = useState(config.stealEnabled ?? true);

    return (
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-white">Configuración General</h2>

            <div>
                <label className="block text-sm text-purple-200 mb-1">Prefijo</label>
                <input
                    value={prefix}
                    onChange={e => setPrefix(e.target.value)}
                    maxLength={5}
                    className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                />
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" checked={stealEnabled} onChange={e => setStealEnabled(e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-purple-200">Permitir comandos de &quot;steal&quot;</label>
            </div>

            <button
                onClick={() => onSave({ prefix, stealEnabled }, 'General')}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-2 rounded-lg"
            >
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

// ─── WELCOME ─────────────────────────────────────────────
function SectionWelcome({ config, channels, onSave, saving }: any) {
    const current = config.welcome?.list?.[0] || {};
    const [enabled, setEnabled] = useState(current.enabled ?? false);
    const [channelId, setChannelId] = useState(current.channelId || '');
    const [message, setMessage] = useState(current.message || '¡Bienvenido {user} a {server}!');

    return (
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-white">Mensaje de Bienvenida</h2>

            <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-purple-200">Activar bienvenidas</label>
            </div>

            <div>
                <label className="block text-sm text-purple-200 mb-1">Canal</label>
                <select
                    value={channelId}
                    onChange={e => setChannelId(e.target.value)}
                    className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                >
                    <option value="">Selecciona un canal...</option>
                    {channels.map((c: any) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm text-purple-200 mb-1">Mensaje</label>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Variables: {'{user}'}, {'{server}'}, {'{memberCount}'}</p>
            </div>

            <button
                onClick={() => onSave({
                    'welcome.list': [{ enabled, channelId, message, embedColor: '#3498DB' }]
                }, 'Bienvenidas')}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-2 rounded-lg"
            >
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

// ─── GOODBYE ─────────────────────────────────────────────
function SectionGoodbye({ config, channels, onSave, saving }: any) {
    const current = config.goodbye?.list?.[0] || {};
    const [enabled, setEnabled] = useState(current.enabled ?? false);
    const [channelId, setChannelId] = useState(current.channelId || '');
    const [message, setMessage] = useState(current.message || 'Hasta pronto {user}...');

    return (
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-white">Mensaje de Despedida</h2>

            <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-purple-200">Activar despedidas</label>
            </div>

            <div>
                <label className="block text-sm text-purple-200 mb-1">Canal</label>
                <select
                    value={channelId}
                    onChange={e => setChannelId(e.target.value)}
                    className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                >
                    <option value="">Selecciona un canal...</option>
                    {channels.map((c: any) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm text-purple-200 mb-1">Mensaje</label>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Variables: {'{user}'}, {'{server}'}, {'{memberCount}'}</p>
            </div>

            <button
                onClick={() => onSave({
                    'goodbye.list': [{ enabled, channelId, message, embedColor: '#E74C3C' }]
                }, 'Despedidas')}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-2 rounded-lg"
            >
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

// ─── AUTOMOD ─────────────────────────────────────────────
function SectionAutomod({ config, onSave, saving }: any) {
    const am = config.automod || {};
    const [enabled, setEnabled] = useState(am.enabled ?? false);
    const [badwords, setBadwords] = useState(am.modules?.badwords ?? true);
    const [links, setLinks] = useState(am.modules?.links ?? true);
    const [invites, setInvites] = useState(am.modules?.invites ?? true);
    const [mentions, setMentions] = useState(am.modules?.mentions ?? true);
    const [mentionsLimit, setMentionsLimit] = useState(am.mentionsLimit ?? 4);

    return (
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-white">AutoMod</h2>

            <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-purple-200">Activar AutoMod</label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-purple-200">
                    <input type="checkbox" checked={badwords} onChange={e => setBadwords(e.target.checked)} /> Malas palabras
                </label>
                <label className="flex items-center gap-2 text-sm text-purple-200">
                    <input type="checkbox" checked={links} onChange={e => setLinks(e.target.checked)} /> Links
                </label>
                <label className="flex items-center gap-2 text-sm text-purple-200">
                    <input type="checkbox" checked={invites} onChange={e => setInvites(e.target.checked)} /> Invitaciones
                </label>
                <label className="flex items-center gap-2 text-sm text-purple-200">
                    <input type="checkbox" checked={mentions} onChange={e => setMentions(e.target.checked)} /> Menciones masivas
                </label>
            </div>

            <div>
                <label className="block text-sm text-purple-200 mb-1">Límite de menciones</label>
                <input
                    type="number"
                    value={mentionsLimit}
                    onChange={e => setMentionsLimit(Number(e.target.value))}
                    className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                />
            </div>

            <button
                onClick={() => onSave({
                    'automod.enabled': enabled,
                    'automod.modules.badwords': badwords,
                    'automod.modules.links': links,
                    'automod.modules.invites': invites,
                    'automod.modules.mentions': mentions,
                    'automod.mentionsLimit': mentionsLimit,
                }, 'AutoMod')}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-2 rounded-lg"
            >
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

// ─── AUTOROLES ───────────────────────────────────────────
function SectionAutoRoles({ config, roles, onSave, saving }: any) {
    const [selected, setSelected] = useState<string[]>(config.autoRoles || []);

    function toggleRole(roleId: string) {
        setSelected(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    }

    return (
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-white">AutoRoles</h2>
            <p className="text-sm text-purple-200/70">
                Roles que se asignan automáticamente a cada nuevo miembro.
            </p>

            <div className="max-h-80 overflow-y-auto bg-[#0f0f13] border border-[#3b2d63] rounded-lg p-3 space-y-1">
                {roles
                    .filter((r: any) => r.name !== '@everyone' && !r.managed)
                    .map((r: any) => (
                        <label key={r.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#1b172e] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.includes(r.id)}
                                onChange={() => toggleRole(r.id)}
                                className="w-4 h-4"
                            />
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: `#${(r.color || 0).toString(16).padStart(6, '0')}` }}
                            />
                            <span className="text-sm text-white">{r.name}</span>
                        </label>
                    ))
                }
            </div>

            <p className="text-xs text-gray-500">Seleccionados: {selected.length}</p>

            <button
                onClick={() => onSave({ autoRoles: selected }, 'AutoRoles')}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-2 rounded-lg"
            >
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}

// ─── LOGS ────────────────────────────────────────────────
function SectionLogs({ config, channels, onSave, saving }: any) {
    const [modLogs, setModLogs] = useState(config.channels?.modLogs || '');
    const [automodLogs, setAutomodLogs] = useState(config.channels?.automodLogs || '');
    const [generalLogs, setGeneralLogs] = useState(config.channels?.generalLogs || '');

    const ChannelSelect = ({ value, onChange, label }: any) => (
        <div>
            <label className="block text-sm text-purple-200 mb-1">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
            >
                <option value="">Sin canal</option>
                {channels.map((c: any) => (
                    <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-white">Canales de Logs</h2>
            <p className="text-sm text-purple-200/70">
                Los logs son independientes: puedes tener canales distintos o todos en uno solo.
            </p>

            <ChannelSelect label="📜 Logs de Moderación" value={modLogs} onChange={setModLogs} />
            <ChannelSelect label="🛡️ Logs de AutoMod" value={automodLogs} onChange={setAutomodLogs} />
            <ChannelSelect label="📋 Logs Generales" value={generalLogs} onChange={setGeneralLogs} />

            <button
                onClick={() => onSave({
                    'channels.modLogs': modLogs || null,
                    'channels.automodLogs': automodLogs || null,
                    'channels.generalLogs': generalLogs || null,
                }, 'Logs')}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-2 rounded-lg"
            >
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}
