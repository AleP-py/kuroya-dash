'use client';

import { useState } from 'react';

interface Props {
    config: any;
    channels: any[];
    roles: any[];
    onSave: (updates: Record<string, any>, seccion: string) => void;
    saving: boolean;
}

const MODULOS = [
    { key: 'badwords', label: '📝 Palabras prohibidas' },
    { key: 'links',    label: '🔗 Enlaces' },
    { key: 'invites',  label: '📨 Invitaciones' },
    { key: 'images',   label: '🖼️ Imágenes' },
    { key: 'mentions', label: '👥 Anti-menciones' },
];

const ACCIONES_SANCION = ['WARN', 'MUTE', 'KICK', 'TEMPBAN', 'BAN'];

const CATEGORIAS_IA = [
    { key: 'toxicity',    label: 'Toxicidad',      emoji: '💢', desc: 'Insultos, acoso, discriminación' },
    { key: 'spam',        label: 'Spam',           emoji: '📢', desc: 'Flood, repetición, mayúsculas' },
    { key: 'scam',        label: 'Estafa/Phishing',emoji: '⚠️', desc: 'Links falsos, nitro gratis, crypto' },
    { key: 'nsfw',        label: 'Contenido NSFW', emoji: '🔞', desc: 'Contenido sexual o adulto' },
    { key: 'advertising', label: 'Publicidad',     emoji: '📣', desc: 'Promoción de otros servidores' },
    { key: 'harassment',  label: 'Acoso',          emoji: '🚨', desc: 'Amenazas, hostigamiento, bullying' },
];

export default function SectionAutomod({ config, channels, roles, onSave, saving }: Props) {
    const am = config.automod || {};
    const modules = am.modules || {};
    const ignoreLists = am.ignoreLists || {};
    const ai = am.ai || {};
    const categorias = ai.categorias || {};

    // ─── Estados base ───
    const [enabled, setEnabled] = useState(am.enabled ?? false);
    const [mods, setMods] = useState<Record<string, boolean>>({
        badwords: modules.badwords ?? true,
        links: modules.links ?? true,
        invites: modules.invites ?? true,
        images: modules.images ?? true,
        mentions: modules.mentions ?? true,
    });
    const [mentionsLimit, setMentionsLimit] = useState(am.mentionsLimit ?? 4);

    const [badwordsList, setBadwordsList] = useState<string[]>(am.badwordsList || []);
    const [allowedDomains, setAllowedDomains] = useState<string[]>(am.allowedDomains || []);
    const [nuevaBadword, setNuevaBadword] = useState('');
    const [nuevoDominio, setNuevoDominio] = useState('');

    const [punishments, setPunishments] = useState<{ nivel: number; accion: string; tiempo: string | null }[]>(
        am.punishments || []
    );

    const [iaEnabled, setIaEnabled] = useState(ai.enabled ?? false);
    const [iaModel, setIaModel] = useState(ai.model || 'gemini-3.8-flash');
    const [iaCooldown, setIaCooldown] = useState(ai.cooldownPorUsuario ?? 5000);
    const [iaMaxAnalisis, setIaMaxAnalisis] = useState(ai.maxAnalisisPorMinuto ?? 30);
    const [iaMinLength, setIaMinLength] = useState(ai.minLength ?? 8);
    const [iaLogCanal, setIaLogCanal] = useState(ai.logCanalId || '');
    const [iaCats, setIaCats] = useState<Record<string, { enabled: boolean; threshold: number }>>(() => {
        const obj: Record<string, { enabled: boolean; threshold: number }> = {};
        for (const c of CATEGORIAS_IA) {
            obj[c.key] = {
                enabled: categorias[c.key]?.enabled ?? false,
                threshold: categorias[c.key]?.threshold ?? 70,
            };
        }
        return obj;
    });

    // ─── Helpers de listas simples ───
    function addBadword() {
        const w = nuevaBadword.trim().toLowerCase();
        if (!w || badwordsList.includes(w)) return;
        setBadwordsList([...badwordsList, w]);
        setNuevaBadword('');
    }
    function removeBadword(w: string) {
        setBadwordsList(badwordsList.filter(x => x !== w));
    }

    function addDominio() {
        let d = nuevoDominio.trim().toLowerCase();
        if (!d) return;
        d = d.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        if (!d.includes('.') || allowedDomains.includes(d)) return;
        setAllowedDomains([...allowedDomains, d]);
        setNuevoDominio('');
    }
    function removeDominio(d: string) {
        setAllowedDomains(allowedDomains.filter(x => x !== d));
    }

    // ─── Sanciones ───
    function addPunishment() {
        const siguienteNivel = punishments.length + 1;
        if (siguienteNivel > 6) return;
        setPunishments([...punishments, { nivel: siguienteNivel, accion: 'WARN', tiempo: null }]);
    }
    function updatePunishment(i: number, patch: Partial<{ nivel: number; accion: string; tiempo: string | null }>) {
        setPunishments(punishments.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
    }
    function removePunishment(i: number) {
        setPunishments(punishments.filter((_, idx) => idx !== i));
    }

    // ─── Guardar todo ───
    function handleSave() {
        // Validación: si AutoMod está activo, debe haber canal de logs
        if (enabled && !config.channels?.automodLogs) {
            alert('⚠️ Para activar AutoMod, primero asigna un canal de logs de AutoMod en la pestaña "Logs".');
            return;
        }

        const updates: Record<string, any> = {
            'automod.enabled': enabled,
            'automod.modules.badwords': mods.badwords,
            'automod.modules.links': mods.links,
            'automod.modules.invites': mods.invites,
            'automod.modules.images': mods.images,
            'automod.modules.mentions': mods.mentions,
            'automod.mentionsLimit': mentionsLimit,
            'automod.badwordsList': badwordsList,
            'automod.allowedDomains': allowedDomains,
            'automod.punishments': punishments,
            'automod.ai.enabled': iaEnabled,
            'automod.ai.model': iaModel,
            'automod.ai.cooldownPorUsuario': iaCooldown,
            'automod.ai.maxAnalisisPorMinuto': iaMaxAnalisis,
            'automod.ai.minLength': iaMinLength,
            'automod.ai.logCanalId': iaLogCanal || null,
        };

        // Categorías IA
        for (const c of CATEGORIAS_IA) {
            updates[`automod.ai.categorias.${c.key}.enabled`] = iaCats[c.key].enabled;
            updates[`automod.ai.categorias.${c.key}.threshold`] = iaCats[c.key].threshold;
        }

        onSave(updates, 'AutoMod');
    }

    const assignableRoles = roles.filter((r: any) => r.name !== '@everyone' && !r.managed);
    const textChannels = channels;

    return (
        <div className="space-y-6">
            {/* ─── SWITCH PRINCIPAL ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
                <h2 className="text-xl font-semibold text-white">🛡️ AutoMod</h2>
                <p className="text-sm text-purple-200/70">
                    Sistema de moderación automática con filtros clásicos e IA contextual (Gemini).
                </p>

                <div className="flex items-center gap-2 p-3 bg-[#0f0f13] rounded-lg border border-[#3b2d63]">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={e => setEnabled(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label className="text-sm text-purple-200">
                        Activar AutoMod {!config.channels?.automodLogs && <span className="text-yellow-400">(requiere canal de logs)</span>}
                    </label>
                </div>
            </div>

            {/* ─── MÓDULOS ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold text-white">🧩 Módulos clásicos</h3>
                <p className="text-xs text-purple-200/70">
                    Filtros de texto/imágenes que se aplican antes que la IA.
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {MODULOS.map(m => (
                        <label key={m.key} className="flex items-center gap-2 p-3 bg-[#0f0f13] rounded-lg border border-[#3b2d63] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={mods[m.key]}
                                onChange={e => setMods({ ...mods, [m.key]: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-white">{m.label}</span>
                        </label>
                    ))}
                </div>

                <div>
                    <label className="block text-sm text-purple-200 mb-1">
                        Límite de menciones masivas (2-50)
                    </label>
                    <input
                        type="number"
                        min={2}
                        max={50}
                        value={mentionsLimit}
                        onChange={e => setMentionsLimit(Number(e.target.value))}
                        className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                    />
                </div>
            </div>

            {/* ─── BADWORDS ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-3">
                <h3 className="text-lg font-semibold text-white">📝 Lista de palabras prohibidas</h3>

                <div className="flex gap-2">
                    <input
                        value={nuevaBadword}
                        onChange={e => setNuevaBadword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addBadword()}
                        placeholder="Escribe una palabra y presiona Enter"
                        className="flex-1 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white text-sm"
                    />
                    <button
                        type="button"
                        onClick={addBadword}
                        className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Añadir
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-[#0f0f13] rounded-lg border border-[#3b2d63]">
                    {badwordsList.length === 0 && (
                        <span className="text-sm text-gray-500 italic p-2">Sin palabras registradas.</span>
                    )}
                    {badwordsList.map(w => (
                        <span key={w} className="inline-flex items-center gap-1 bg-[#1b172e] border border-[#3b2d63] px-2 py-1 rounded-md text-xs text-white">
                            <code>{w}</code>
                            <button
                                type="button"
                                onClick={() => removeBadword(w)}
                                className="text-red-400 hover:text-red-300 ml-1"
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* ─── DOMINIOS PERMITIDOS ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-3">
                <h3 className="text-lg font-semibold text-white">🌐 Dominios permitidos</h3>
                <p className="text-xs text-purple-200/70">
                    Solo estos dominios podrán enviarse. Todo link externo será eliminado.
                </p>

                <div className="flex gap-2">
                    <input
                        value={nuevoDominio}
                        onChange={e => setNuevoDominio(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addDominio()}
                        placeholder="ej: youtube.com"
                        className="flex-1 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white text-sm"
                    />
                    <button
                        type="button"
                        onClick={addDominio}
                        className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg text-sm"
                    >
                        + Añadir
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-[#0f0f13] rounded-lg border border-[#3b2d63]">
                    {allowedDomains.length === 0 && (
                        <span className="text-sm text-gray-500 italic p-2">Ningún dominio autorizado.</span>
                    )}
                    {allowedDomains.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 bg-[#1b172e] border border-[#3b2d63] px-2 py-1 rounded-md text-xs text-white">
                            <code>{d}</code>
                            <button
                                type="button"
                                onClick={() => removeDominio(d)}
                                className="text-red-400 hover:text-red-300 ml-1"
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* ─── SANCIONES PROGRESIVAS ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-white">⚖️ Sanciones progresivas</h3>
                        <p className="text-xs text-purple-200/70">
                            Nivel 1 → Nivel 6. A mayor número de faltas, mayor el castigo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addPunishment}
                        disabled={punishments.length >= 6}
                        className="text-sm bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-40 px-3 py-1 rounded-lg text-white"
                    >
                        + Añadir nivel
                    </button>
                </div>

                {punishments.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Sin sanciones configuradas.</p>
                )}

                {punishments.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center flex-wrap bg-[#0f0f13] p-3 rounded-lg border border-[#3b2d63]">
                        <span className="text-purple-200 text-sm">Nivel</span>
                        <input
                            type="number"
                            min={1}
                            max={6}
                            value={p.nivel}
                            onChange={e => updatePunishment(i, { nivel: Number(e.target.value) })}
                            className="w-16 bg-[#1b172e] border border-[#3b2d63] rounded-lg px-2 py-1 text-white text-sm"
                        />
                        <select
                            value={p.accion}
                            onChange={e => updatePunishment(i, { accion: e.target.value })}
                            className="flex-1 min-w-[120px] bg-[#1b172e] border border-[#3b2d63] rounded-lg px-3 py-1 text-white text-sm"
                        >
                            {ACCIONES_SANCION.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                        {['MUTE', 'TEMPBAN'].includes(p.accion) && (
                            <input
                                type="text"
                                placeholder="10m / 1h / 7d"
                                value={p.tiempo || ''}
                                onChange={e => updatePunishment(i, { tiempo: e.target.value || null })}
                                className="w-32 bg-[#1b172e] border border-[#3b2d63] rounded-lg px-2 py-1 text-white text-sm"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => removePunishment(i)}
                            className="text-red-400 hover:text-red-300 px-2"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* ─── AUTOMOD IA ─── */}
            <div className="bg-[#1b172e]/80 border border-[#9B59B6]/40 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">🧠 AutoMod IA</h3>
                    <span className="text-xs bg-[#9B59B6]/20 text-[#c084fc] px-2 py-0.5 rounded-full border border-[#9B59B6]/40">
                        Gemini
                    </span>
                </div>
                <p className="text-xs text-purple-200/70">
                    Análisis contextual con inteligencia artificial. <strong>Requiere GEMINI_API_KEY</strong> en el bot.
                </p>

                <div className="flex items-center gap-2 p-3 bg-[#0f0f13] rounded-lg border border-[#3b2d63]">
                    <input
                        type="checkbox"
                        checked={iaEnabled}
                        onChange={e => setIaEnabled(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label className="text-sm text-purple-200">Activar análisis con IA</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Modelo</label>
                        <select
                            value={iaModel}
                            onChange={e => setIaModel(e.target.value)}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        >
                            <option value="gemini-3.8-flash">gemini-3.8-flash (recomendado)</option>
                            <option value="gemini-3.7-flash">gemini-3.7-flash</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Canal de logs IA</label>
                        <select
                            value={iaLogCanal}
                            onChange={e => setIaLogCanal(e.target.value)}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        >
                            <option value="">Usar canal de AutoMod</option>
                            {textChannels.map((c: any) => (
                                <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Cooldown usuario (ms)</label>
                        <input
                            type="number"
                            min={0}
                            step={500}
                            value={iaCooldown}
                            onChange={e => setIaCooldown(Number(e.target.value))}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Max análisis/min</label>
                        <input
                            type="number"
                            min={1}
                            value={iaMaxAnalisis}
                            onChange={e => setIaMaxAnalisis(Number(e.target.value))}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Largo mínimo</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={iaMinLength}
                            onChange={e => setIaMinLength(Number(e.target.value))}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-semibold text-purple-200">Categorías detectadas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {CATEGORIAS_IA.map(c => (
                            <div key={c.key} className="bg-[#0f0f13] border border-[#3b2d63] p-3 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={iaCats[c.key].enabled}
                                            onChange={e => setIaCats({ ...iaCats, [c.key]: { ...iaCats[c.key], enabled: e.target.checked } })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm text-white">{c.emoji} {c.label}</span>
                                    </label>
                                    <span className="text-xs text-purple-300 font-mono">{iaCats[c.key].threshold}%</span>
                                </div>
                                <p className="text-[10px] text-gray-500">{c.desc}</p>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={iaCats[c.key].threshold}
                                    onChange={e => setIaCats({ ...iaCats, [c.key]: { ...iaCats[c.key], threshold: Number(e.target.value) } })}
                                    className="w-full accent-[#9B59B6]"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── BOTÓN GUARDAR ─── */}
            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-3 rounded-lg"
            >
                {saving ? 'Guardando...' : '💾 Guardar Configuración de AutoMod'}
            </button>
        </div>
    );
}
