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
}

const SECTIONS = [
    { id: 'general',   label: 'General',     icon: '⚙️' },
    { id: 'welcome',   label: 'Bienvenidas', icon: '👋' },
    { id: 'goodbye',   label: 'Despedidas',  icon: '👋' },
    { id: 'automod',   label: 'AutoMod',     icon: '🛡️' },
    { id: 'niveles',   label: 'Niveles',     icon: '📈' },
    { id: 'comandos',  label: 'Comandos',    icon: '🚫' },
    { id: 'alianzas',  label: 'Alianzas',    icon: '🤝' },
    { id: 'staff',     label: 'Staff',       icon: '👔' },
    { id: 'autoroles', label: 'AutoRoles',   icon: '🎭' },
    { id: 'logs',      label: 'Logs',        icon: '📜' },
];

export default function ConfigTabs({ guildId, guildName, initialConfig, channels, roles, commands }: Props) {
    const [section, setSection] = useState('general');
    const [sidebarOpen, setSidebarOpen] = useState(true);
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

    const activeSection = SECTIONS.find(s => s.id === section);

    return (
        <div className="flex gap-6 min-h-[600px]">
            {/* ═══════════ SIDEBAR ═══════════ */}
            <aside
                className={`relative flex-shrink-0 transition-all duration-300 ease-out ${
                    sidebarOpen ? 'w-64' : 'w-16'
                }`}
            >
                <div className="sticky top-6 bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl overflow-hidden glow-purple">
                    {/* Header del sidebar */}
                    <div className="p-3 border-b border-[#3b2d63]/50 flex items-center justify-between">
                        {sidebarOpen && (
                            <span className="text-xs uppercase tracking-widest text-purple-300/70 font-semibold pl-1">
                                Secciones
                            </span>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg hover:bg-[#3b2d63]/50 text-purple-200 transition-all btn-glow"
                            title={sidebarOpen ? 'Cerrar' : 'Abrir'}
                        >
                            <span className="text-lg leading-none">{sidebarOpen ? '«' : '»'}</span>
                        </button>
                    </div>

                    {/* Items */}
                    <nav className="p-2 space-y-1">
                        {SECTIONS.map(s => {
                            const active = s.id === section;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSection(s.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative group ${
                                        active
                                            ? 'bg-gradient-to-r from-[#5865F2]/30 to-[#9B59B6]/20 text-white border border-[#5865F2]/50'
                                            : 'text-purple-200/70 hover:bg-[#3b2d63]/30 hover:text-white'
                                    }`}
                                >
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#5865F2] to-[#9B59B6] rounded-r-full" />
                                    )}
                                    <span className="text-lg flex-shrink-0">{s.icon}</span>
                                    {sidebarOpen && (
                                        <span className="font-medium truncate">{s.label}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* ═══════════ CONTENIDO ═══════════ */}
            <div className="flex-1 min-w-0">
                {/* Header de la sección */}
                <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{activeSection?.icon}</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                {activeSection?.label}
                            </h2>
                            <p className="text-xs text-purple-300/60">
                                Servidor: <code className="text-purple-300">{guildName}</code>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensaje flotante */}
                {msg && (
                    <div
                        className={`mb-5 p-3 rounded-xl border text-sm animate-slide-in ${
                            msg.type === 'ok'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-500/10 border-red-500/40 text-red-300'
                        }`}
                    >
                        {msg.text}
                    </div>
                )}

                {/* Contenido animado */}
                <div key={section} className="animate-slide-in">
                    {section === 'general'   && <SectionGeneral   config={initialConfig} onSave={handleSave} saving={saving} />}
                    {section === 'welcome'   && <SectionWelcome   config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
                    {section === 'goodbye'   && <SectionGoodbye   config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
                    {section === 'automod'   && <SectionAutomod   config={initialConfig} channels={channels} roles={roles} onSave={handleSave} saving={saving} />}
                    {section === 'niveles'   && <SectionNiveles   config={initialConfig} channels={channels} roles={roles} onSave={handleSave} saving={saving} />}
                    {section === 'autoroles' && <SectionAutoRoles config={initialConfig} roles={roles} onSave={handleSave} saving={saving} />}
                    {section === 'logs'      && <SectionLogs      config={initialConfig} channels={channels} onSave={handleSave} saving={saving} />}
                    {section === 'comandos'  && <SectionComandos  config={initialConfig} commands={commands} onSave={handleSave} saving={saving} />}
                    {section === 'alianzas'  && <SectionAlianzas  config={initialConfig} channels={channels} roles={roles} onSave={handleSave} saving={saving} />}
                    {section === 'staff'     && <SectionStaff     config={initialConfig} roles={roles} onSave={handleSave} saving={saving} />}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// Estilos base compartidos
// ═══════════════════════════════════════════════════════
const CARD = 'bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 space-y-4';
const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white placeholder-purple-300/30 focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';
const BTN_SAVE = 'w-full bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all btn-glow';

// ═══════════════════════════════════════════════════════
// ─── GENERAL ───
// ═══════════════════════════════════════════════════════
function SectionGeneral({ config, onSave, saving }: any) {
    const [prefix, setPrefix] = useState(config.prefix || '!');
    const [stealEnabled, setStealEnabled] = useState(config.stealEnabled ?? true);

    return (
        <div className={CARD}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Configuración básica</h3>
            </div>

            <div>
                <label className={LABEL}>Prefijo</label>
                <input value={prefix} onChange={e => setPrefix(e.target.value)} maxLength={5} className={INPUT} />
                <p className="text-xs text-purple-300/50 mt-1">Símbolo o palabra que precede los comandos.</p>
            </div>

            <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer hover:border-[#5865F2]/50 transition-all">
                <input type="checkbox" checked={stealEnabled} onChange={e => setStealEnabled(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                <span className="text-sm text-purple-100">Permitir comandos de &quot;steal&quot; (robar emojis)</span>
            </label>

            <button onClick={() => onSave({ prefix, stealEnabled }, 'General')} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── WELCOME ───
// ═══════════════════════════════════════════════════════
function SectionWelcome({ config, channels, onSave, saving }: any) {
    const current = config.welcome?.list?.[0] || {};
    const [enabled, setEnabled] = useState(current.enabled ?? false);
    const [channelId, setChannelId] = useState(current.channelId || '');
    const [message, setMessage] = useState(current.message || '¡Bienvenido {user} a {server}!');

    return (
        <div className={CARD}>
            <h3 className="text-lg font-semibold text-white">Mensaje de bienvenida</h3>

            <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer hover:border-[#5865F2]/50 transition-all">
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

            <button
                onClick={() => onSave({ 'welcome.list': [{ enabled, channelId, message, embedColor: '#3498DB' }] }, 'Bienvenidas')}
                disabled={saving}
                className={BTN_SAVE}
            >
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── GOODBYE ───
// ═══════════════════════════════════════════════════════
function SectionGoodbye({ config, channels, onSave, saving }: any) {
    const current = config.goodbye?.list?.[0] || {};
    const [enabled, setEnabled] = useState(current.enabled ?? false);
    const [channelId, setChannelId] = useState(current.channelId || '');
    const [message, setMessage] = useState(current.message || 'Hasta pronto {user}...');

    return (
        <div className={CARD}>
            <h3 className="text-lg font-semibold text-white">Mensaje de despedida</h3>

            <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer hover:border-[#5865F2]/50 transition-all">
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

            <button
                onClick={() => onSave({ 'goodbye.list': [{ enabled, channelId, message, embedColor: '#E74C3C' }] }, 'Despedidas')}
                disabled={saving}
                className={BTN_SAVE}
            >
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── AUTOROLES ───
// ═══════════════════════════════════════════════════════
function SectionAutoRoles({ config, roles, onSave, saving }: any) {
    const [selected, setSelected] = useState<string[]>(config.autoRoles || []);

    function toggleRole(roleId: string) {
        setSelected(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
    }

    return (
        <div className={CARD}>
            <h3 className="text-lg font-semibold text-white">AutoRoles</h3>
            <p className="text-sm text-purple-200/70">Roles que se asignan automáticamente a cada nuevo miembro.</p>

            <div className="max-h-96 overflow-y-auto bg-[#0f0f13]/60 border border-[#3b2d63]/50 rounded-xl p-2 space-y-1">
                {roles
                    .filter((r: any) => r.name !== '@everyone' && !r.managed)
                    .map((r: any) => (
                        <label key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#3b2d63]/40 cursor-pointer transition-all">
                            <input
                                type="checkbox"
                                checked={selected.includes(r.id)}
                                onChange={() => toggleRole(r.id)}
                                className="w-4 h-4 accent-[#5865F2]"
                            />
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: `#${(r.color || 0).toString(16).padStart(6, '0')}` }}
                            />
                            <span className="text-sm text-white">{r.name}</span>
                        </label>
                    ))
                }
            </div>

            <p className="text-xs text-purple-300/60">Seleccionados: <strong className="text-white">{selected.length}</strong></p>

            <button onClick={() => onSave({ autoRoles: selected }, 'AutoRoles')} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
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
            <h3 className="text-lg font-semibold text-white">Canales de logs</h3>
            <p className="text-sm text-purple-200/70">Los logs son independientes: puedes usar canales distintos o el mismo para todo.</p>

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
                className={BTN_SAVE}
            >
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
        </div>
    );
}
