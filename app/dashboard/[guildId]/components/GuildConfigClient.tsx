'use client';

import { useState } from 'react';
import { guardarConfig } from '../actions';
import SectionNiveles from './SectionNiveles';
import SectionAutomod from './SectionAutomod';
import SectionComandos from './SectionComandos';
import SectionAlianzas from './SectionAlianzas';
import SectionStaff from './SectionStaff';

interface Props {
    guildId: string;
    guildName: string;
    initialConfig: any;
    channels: any[];
    roles: any[];
    commands: any[];
    section: string;
}

const CARD = 'bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 space-y-4';
const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';
const BTN_SAVE = 'w-full bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all btn-glow';

export default function GuildConfigClient({
    guildId, guildName, initialConfig, channels, roles, commands, section,
}: Props) {
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    async function handleSave(updates: Record<string, any>, seccion: string) {
        setSaving(true);
        setMsg(null);
        try {
            await guardarConfig(guildId, guildName, updates, seccion);
            setMsg({ type: 'ok', text: '✅ Guardado. Revisa tu MD en Discord.' });
        } catch (e: any) {
            setMsg({ type: 'err', text: '❌ Error: ' + e.message });
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 5000);
        }
    }

    return (
        <div className="animate-slide-in">
            {msg && (
                <div className={`mb-5 p-3 rounded-xl border text-sm ${
                    msg.type === 'ok'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/40 text-red-300'
                }`}>
                    {msg.text}
                </div>
            )}

            {section === 'general'   && <SectionGeneral   config={initialConfig} roles={roles} onSave={handleSave} saving={saving} />}
            {section === 'welcome'   && <SectionWelcome   config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
            {section === 'goodbye'   && <SectionGoodbye   config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
            {section === 'automod'   && <SectionAutomod   config={initialConfig} channels={channels} roles={roles} onSave={handleSave} saving={saving} />}
            {section === 'niveles'   && <SectionNiveles   config={initialConfig} channels={channels} roles={roles} onSave={handleSave} saving={saving} />}
            {section === 'comandos'  && <SectionComandos  config={initialConfig} commands={commands} onSave={handleSave} saving={saving} />}
            {section === 'alianzas'  && <SectionAlianzas  config={initialConfig} channels={channels} roles={roles} onSave={handleSave} saving={saving} />}
            {section === 'staff'     && <SectionStaff     config={initialConfig} roles={roles} onSave={handleSave} saving={saving} />}
            {section === 'autoroles' && <SectionAutoRoles config={initialConfig} roles={roles} onSave={handleSave} saving={saving} />}
            {section === 'logs'      && <SectionLogs      config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── GENERAL ───
// ═══════════════════════════════════════════════════════
function SectionGeneral({ config, roles, onSave, saving }: any) {
    const [prefix, setPrefix] = useState(config.prefix || '!');
    const [dashboardRoles, setDashboardRoles] = useState<string[]>(config.dashboardAccessRoles || []);
    const [modRoles, setModRoles] = useState<string[]>(config.moderatorRoles || []);
    const [ecoRoles, setEcoRoles] = useState<string[]>(config.economyRoles || []);

    const assignableRoles = roles.filter((r: any) => r.name !== '@everyone' && !r.managed);

    function toggleIn(list: string[], setList: (v: string[]) => void, id: string) {
        setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
    }

    function handleSave() {
        onSave({
            prefix,
            dashboardAccessRoles: dashboardRoles,
            moderatorRoles: modRoles,
            economyRoles: ecoRoles,
        }, 'General');
    }

    const RoleList = ({ value, setValue }: any) => (
        <div className="max-h-60 overflow-y-auto bg-[#0f0f13]/60 border border-[#3b2d63]/50 rounded-xl p-2 space-y-1">
            {assignableRoles.length === 0 && (
                <p className="text-sm text-gray-500 italic p-2">Sin roles disponibles.</p>
            )}
            {assignableRoles.map((r: any) => (
                <label key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#3b2d63]/40 cursor-pointer transition-all">
                    <input
                        type="checkbox"
                        checked={value.includes(r.id)}
                        onChange={() => toggleIn(value, setValue, r.id)}
                        className="w-4 h-4 accent-[#5865F2]"
                    />
                    <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `#${(r.color || 0).toString(16).padStart(6, '0')}` }}
                    />
                    <span className="text-sm text-white">@{r.name}</span>
                </label>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">⚙️ Prefijo de comandos</h3>
                <p className="text-xs text-purple-200/70">El símbolo o palabra que precede a los comandos del bot.</p>
                <input
                    value={prefix}
                    onChange={e => setPrefix(e.target.value)}
                    maxLength={5}
                    className={INPUT + ' max-w-xs'}
                    placeholder="!"
                />
            </div>

            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🔐 Roles con acceso a la Dashboard</h3>
                <p className="text-xs text-purple-200/70">
                    Estos roles podrán entrar a este panel además de los administradores. <strong>Seleccionados: {dashboardRoles.length}</strong>
                </p>
                <RoleList value={dashboardRoles} setValue={setDashboardRoles} />
            </div>

            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🛡️ Roles de Moderador</h3>
                <p className="text-xs text-purple-200/70">
                    Estos roles podrán usar todos los comandos de moderación aunque no tengan el permiso de Discord. <strong>Seleccionados: {modRoles.length}</strong>
                </p>
                <RoleList value={modRoles} setValue={setModRoles} />
            </div>

            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">💰 Roles de Economía Local</h3>
                <p className="text-xs text-purple-200/70">
                    Estos roles tendrán acceso a comandos especiales de la economía local. <strong>Seleccionados: {ecoRoles.length}</strong>
                </p>
                <RoleList value={ecoRoles} setValue={setEcoRoles} />
            </div>

            <button type="button" onClick={handleSave} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── WELCOME ───
// ═══════════════════════════════════════════════════════
function SectionWelcome({ config, channels, onSave, saving }: any) {
    const c = config.welcome?.list?.[0] || {};
    const [enabled, setEnabled] = useState(c.enabled ?? false);
    const [channelId, setChannelId] = useState(c.channelId || '');
    const [message, setMessage] = useState(c.message || '¡Bienvenido {user} a {server}!');

    return (
        <div className={CARD}>
            <h3 className="text-lg font-semibold text-white">Mensaje de bienvenida</h3>

            <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                <span className="text-sm text-purple-100">Activar bienvenidas</span>
            </label>

            <div>
                <label className={LABEL}>Canal</label>
                <select value={channelId} onChange={e => setChannelId(e.target.value)} className={INPUT}>
                    <option value="">Selecciona un canal...</option>
                    {channels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
            </div>

            <div>
                <label className={LABEL}>Mensaje</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className={INPUT} />
                <p className="text-xs text-purple-300/50 mt-1">Variables: {'{user}'}, {'{server}'}, {'{memberCount}'}</p>
            </div>

            <button onClick={() => onSave({ 'welcome.list': [{ enabled, channelId, message, embedColor: '#3498DB' }] }, 'Bienvenidas')} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── GOODBYE ───
// ═══════════════════════════════════════════════════════
function SectionGoodbye({ config, channels, onSave, saving }: any) {
    const c = config.goodbye?.list?.[0] || {};
    const [enabled, setEnabled] = useState(c.enabled ?? false);
    const [channelId, setChannelId] = useState(c.channelId || '');
    const [message, setMessage] = useState(c.message || 'Hasta pronto {user}...');

    return (
        <div className={CARD}>
            <h3 className="text-lg font-semibold text-white">Mensaje de despedida</h3>

            <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                <span className="text-sm text-purple-100">Activar despedidas</span>
            </label>

            <div>
                <label className={LABEL}>Canal</label>
                <select value={channelId} onChange={e => setChannelId(e.target.value)} className={INPUT}>
                    <option value="">Selecciona un canal...</option>
                    {channels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
            </div>

            <div>
                <label className={LABEL}>Mensaje</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className={INPUT} />
            </div>

            <button onClick={() => onSave({ 'goodbye.list': [{ enabled, channelId, message, embedColor: '#E74C3C' }] }, 'Despedidas')} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── AUTOROLES ───
// ═══════════════════════════════════════════════════════
function SectionAutoRoles({ config, roles, onSave, saving }: any) {
    const [selected, setSelected] = useState<string[]>(config.autoRoles || []);
    const assignableRoles = roles.filter((r: any) => r.name !== '@everyone' && !r.managed);

    function toggleRole(roleId: string) {
        setSelected(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
    }

    return (
        <div className={CARD}>
            <h3 className="text-lg font-semibold text-white">🎭 AutoRoles</h3>
            <p className="text-sm text-purple-200/70">Roles que se asignan automáticamente a cada nuevo miembro.</p>

            <div className="max-h-96 overflow-y-auto bg-[#0f0f13]/60 border border-[#3b2d63]/50 rounded-xl p-2 space-y-1">
                {assignableRoles.map((r: any) => (
                    <label key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#3b2d63]/40 cursor-pointer transition-all">
                        <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleRole(r.id)} className="w-4 h-4 accent-[#5865F2]" />
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: `#${(r.color || 0).toString(16).padStart(6, '0')}` }} />
                        <span className="text-sm text-white">@{r.name}</span>
                    </label>
                ))}
            </div>

            <p className="text-xs text-purple-300/60">Seleccionados: <strong className="text-white">{selected.length}</strong></p>

            <button onClick={() => onSave({ autoRoles: selected }, 'AutoRoles')} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── LOGS ───
// ═══════════════════════════════════════════════════════
function SectionLogs({ config, channels, onSave, saving }: any) {
    const [modLogs, setModLogs] = useState(config.channels?.modLogs || '');
    const [automodLogs, setAutomodLogs] = useState(config.channels?.automodLogs || '');
    const [generalLogs, setGeneralLogs] = useState(config.channels?.generalLogs || '');

    const ChannelSelect = ({ value, onChange, label }: any) => (
        <div>
            <label className={LABEL}>{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} className={INPUT}>
                <option value="">Sin canal</option>
                {channels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
        </div>
    );

    return (
        <div className={CARD}>
            <h3 className="text-lg font-semibold text-white">📜 Canales de logs</h3>
            <ChannelSelect label="📜 Moderación" value={modLogs} onChange={setModLogs} />
            <ChannelSelect label="🛡️ AutoMod" value={automodLogs} onChange={setAutomodLogs} />
            <ChannelSelect label="📋 Generales" value={generalLogs} onChange={setGeneralLogs} />
            <button onClick={() => onSave({
                'channels.modLogs': modLogs || null,
                'channels.automodLogs': automodLogs || null,
                'channels.generalLogs': generalLogs || null,
            }, 'Logs')} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
        </div>
    );
}
