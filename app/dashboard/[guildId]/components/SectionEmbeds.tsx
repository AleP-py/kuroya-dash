'use client';

import { useState } from 'react';

interface Props {
    config: any;
    channels: any[];
    embeds: any[];
    setEmbeds: (v: any[]) => void;
    botones: any[];
    setBotones: (v: any[]) => void;
    onSave: (updates: Record<string, any>, seccion: string, incluirEmbeds?: boolean) => void;
    saving: boolean;
}

const CARD = 'bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 space-y-4';
const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';
const BTN_SAVE = 'w-full bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all btn-glow';
const BTN_SMALL = 'text-xs bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1.5 rounded-lg text-white transition-all btn-glow';
const BTN_GHOST = 'text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white transition-all';

const TIPOS_BLOQUE = [
    { id: 'header',    label: 'Header',     emoji: '🔠', desc: 'Título grande con ## markdown' },
    { id: 'text',      label: 'Texto',      emoji: '📝', desc: 'Párrafo normal' },
    { id: 'section',   label: 'Sección',    emoji: '🎴', desc: 'Texto + thumbnail o botón' },
    { id: 'separator', label: 'Separador',  emoji: '➖', desc: 'Línea divisoria' },
    { id: 'media',     label: 'Imagen',     emoji: '🖼️', desc: 'Galería de imágenes' },
    { id: 'actionrow', label: 'Botones',    emoji: '🔘', desc: 'Fila de botones' },
];

const VARIABLES_USUARIO = [
    ['{user}', 'Mención interactiva'],
    ['{user_name}', 'Nombre plano'],
    ['{user_tag}', 'Tag completo'],
    ['{user_id}', 'ID numérica'],
    ['{user_avatar}', 'URL de foto'],
    ['{user_created_at}', 'Antigüedad de cuenta'],
];
const VARIABLES_SERVER = [
    ['{server_name}', 'Nombre del servidor'],
    ['{server_id}', 'ID del servidor'],
    ['{server_icon}', 'URL del icono'],
    ['{server_banner}', 'URL del banner'],
    ['{server_owner}', 'Mención al dueño'],
    ['{member_count}', 'Total de miembros'],
    ['{boost_count}', 'Cantidad de boosts'],
    ['{boost_tier}', 'Nivel del servidor'],
];
const VARIABLES_TIME = [
    ['{time}', 'Hora interactiva'],
    ['{date}', 'Fecha interactiva'],
    ['{date_full}', 'Fecha y hora completa'],
    ['{relative_time}', 'Formato relativo'],
    ['{date_plain}', 'Fecha texto plano'],
    ['{time_plain}', 'Hora texto plano'],
];

function nuevoEmbedVacio(nombre: string, tipo: 'classic' | 'v2') {
    const base = {
        nombre,
        tipo,
        color: tipo === 'v2' ? '#9B59B6' : '#3498DB',
        botones: [] as string[],
        publishedMessages: [],
        editorChannelId: null,
        editorMessageId: null,
    };
    if (tipo === 'v2') {
        return {
            ...base,
            v2: {
                blocks: [
                    { tipo: 'header', texto: `## ${nombre}` },
                    { tipo: 'separator', divider: true, spacing: 1 },
                    { tipo: 'text', texto: 'Edita este contenido con los botones de abajo.' },
                ],
            },
        };
    }
    return {
        ...base,
        title: `Título de ${nombre}`,
        description: 'Personaliza este texto.',
        image: null,
        thumbnail: null,
        footer: null,
        fields: [],
    };
}

export default function SectionEmbeds({
    config,
    channels,
    embeds,
    setEmbeds,
    botones,
    setBotones,
    onSave,
    saving,
}: Props) {
    const [tab, setTab] = useState<'embeds' | 'botones' | 'vars'>('embeds');
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoTipo, setNuevoTipo] = useState<'classic' | 'v2'>('classic');

    const selected = selectedIdx !== null ? embeds[selectedIdx] : null;

    // ─── Helpers para actualizar ───
    function updateEmbed(idx: number, patch: Record<string, any>) {
        setEmbeds(embeds.map((e, i) => i === idx ? { ...e, ...patch } : e));
    }

    function updateBlock(embedIdx: number, blockIdx: number, patch: Record<string, any>) {
        setEmbeds(embeds.map((e, i) => {
            if (i !== embedIdx) return e;
            const nuevos = [...(e.v2?.blocks || [])];
            nuevos[blockIdx] = { ...nuevos[blockIdx], ...patch };
            return { ...e, v2: { ...e.v2, blocks: nuevos } };
        }));
    }

    function addBlock(embedIdx: number, tipo: string) {
        const base: any = { tipo };
        if (tipo === 'header' || tipo === 'text') base.texto = tipo === 'header' ? '## Nuevo encabezado' : 'Nuevo párrafo';
        if (tipo === 'section') base.texto = 'Texto de la sección';
        if (tipo === 'separator') { base.divider = true; base.spacing = 1; }
        if (tipo === 'media') base.urls = [];
        if (tipo === 'actionrow') base.botones = [];

        setEmbeds(embeds.map((e, i) => {
            if (i !== embedIdx) return e;
            const bloques = [...(e.v2?.blocks || []), base];
            return { ...e, v2: { ...e.v2, blocks: bloques } };
        }));
    }

    function removeBlock(embedIdx: number, blockIdx: number) {
        setEmbeds(embeds.map((e, i) => {
            if (i !== embedIdx) return e;
            const bloques = (e.v2?.blocks || []).filter((_: any, bi: number) => bi !== blockIdx);
            return { ...e, v2: { ...e.v2, blocks: bloques } };
        }));
    }

    function moveBlock(embedIdx: number, blockIdx: number, dir: 'up' | 'down') {
        setEmbeds(embeds.map((e, i) => {
            if (i !== embedIdx) return e;
            const bloques = [...(e.v2?.blocks || [])];
            const target = dir === 'up' ? blockIdx - 1 : blockIdx + 1;
            if (target < 0 || target >= bloques.length) return e;
            [bloques[blockIdx], bloques[target]] = [bloques[target], bloques[blockIdx]];
            return { ...e, v2: { ...e.v2, blocks: bloques } };
        }));
    }

    function addNuevoEmbed() {
        const nombre = nuevoNombre.trim();
        if (!nombre) return alert('Escribe un nombre.');
        if (embeds.some(e => e.nombre.toLowerCase() === nombre.toLowerCase())) {
            return alert('Ya existe un embed con ese nombre.');
        }
        const nuevo = nuevoEmbedVacio(nombre, nuevoTipo);
        setEmbeds([...embeds, nuevo]);
        setNuevoNombre('');
        setSelectedIdx(embeds.length);
    }

    function eliminarEmbed(idx: number) {
        if (!confirm(`¿Eliminar el embed "${embeds[idx].nombre}"?`)) return;
        setEmbeds(embeds.filter((_, i) => i !== idx));
        setSelectedIdx(null);
    }

    function clonarEmbed(idx: number) {
        const base = embeds[idx];
        const nombre = prompt('Nombre del clon:', `${base.nombre}_copia`);
        if (!nombre || embeds.some(e => e.nombre.toLowerCase() === nombre.toLowerCase())) return;
        const clon = JSON.parse(JSON.stringify(base));
        clon.nombre = nombre;
        clon.publishedMessages = [];
        clon.editorChannelId = null;
        clon.editorMessageId = null;
        setEmbeds([...embeds, clon]);
    }

    function guardarTodo() {
        // incluirEmbeds = false, porque ya los enviamos explícitamente en updates
        onSave({ customEmbeds: embeds, customButtons: botones }, 'Embeds', false);
    }

    // ─── Render principal ───
    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-[#3b2d63]/50">
                {[
                    { id: 'embeds',  label: '📄 Embeds',    count: embeds.length },
                    { id: 'botones', label: '🔘 Botones',   count: botones.length },
                    { id: 'vars',    label: '🧩 Variables', count: null },
                ].map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id as any)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                            tab === t.id
                                ? 'bg-[#1b172e] text-white border border-b-0 border-[#3b2d63]'
                                : 'text-purple-200/60 hover:text-purple-200'
                        }`}
                    >
                        {t.label}
                        {t.count !== null && <span className="ml-2 text-xs opacity-60">({t.count})</span>}
                    </button>
                ))}
            </div>

            {/* ─── TAB EMBEDS ─── */}
            {tab === 'embeds' && (
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                    {/* Columna izquierda: lista */}
                    <div className="space-y-4">
                        {/* Crear nuevo */}
                        <div className={CARD + ' !p-4'}>
                            <h3 className="text-sm font-semibold text-white mb-3">✨ Crear embed</h3>
                            <input
                                value={nuevoNombre}
                                onChange={e => setNuevoNombre(e.target.value)}
                                placeholder="Nombre único..."
                                className={INPUT + ' text-sm mb-2'}
                            />
                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setNuevoTipo('classic')}
                                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                                        nuevoTipo === 'classic'
                                            ? 'bg-[#3498DB]/20 border-[#3498DB]/50 text-white'
                                            : 'bg-transparent border-[#3b2d63]/50 text-purple-300/60'
                                    }`}
                                >
                                    📄 Clásico
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNuevoTipo('v2')}
                                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                                        nuevoTipo === 'v2'
                                            ? 'bg-[#9B59B6]/20 border-[#9B59B6]/50 text-white'
                                            : 'bg-transparent border-[#3b2d63]/50 text-purple-300/60'
                                    }`}
                                >
                                    🧱 V2
                                </button>
                            </div>
                            <button type="button" onClick={addNuevoEmbed} className={BTN_SMALL + ' w-full'}>
                                + Añadir
                            </button>
                        </div>

                        {/* Lista */}
                        <div className={CARD + ' !p-3'}>
                            <h3 className="text-sm font-semibold text-white mb-3 px-2">📋 Registrados</h3>
                            {embeds.length === 0 && (
                                <p className="text-xs text-gray-500 italic px-2">Sin embeds todavía.</p>
                            )}
                            <div className="space-y-1 max-h-[500px] overflow-y-auto">
                                {embeds.map((e, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                            selectedIdx === i
                                                ? 'bg-[#5865F2]/20 border border-[#5865F2]/50'
                                                : 'hover:bg-[#3b2d63]/30 border border-transparent'
                                        }`}
                                        onClick={() => setSelectedIdx(i)}
                                    >
                                        <span className="text-lg">{e.tipo === 'v2' ? '🧱' : '📄'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{e.nombre}</p>
                                            <p className="text-[10px] text-purple-300/50">
                                                {e.botones?.length > 0 && `🔘 ${e.botones.length} · `}
                                                {e.tipo === 'v2' ? `🧱 ${e.v2?.blocks?.length || 0} bloques` : `📄 clásico`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha: editor */}
                    <div className="space-y-4">
                        {!selected && (
                            <div className={CARD + ' text-center py-20'}>
                                <p className="text-4xl mb-3">📄</p>
                                <h3 className="text-lg text-white mb-1">Selecciona un embed</h3>
                                <p className="text-sm text-purple-300/60">O crea uno nuevo con el panel de la izquierda.</p>
                            </div>
                        )}

                        {selected && (
                            <EmbedEditor
                                embed={selected}
                                embedIdx={selectedIdx!}
                                botones={botones}
                                channels={channels}
                                updateEmbed={updateEmbed}
                                updateBlock={updateBlock}
                                addBlock={addBlock}
                                removeBlock={removeBlock}
                                moveBlock={moveBlock}
                                onDelete={() => eliminarEmbed(selectedIdx!)}
                                onClone={() => clonarEmbed(selectedIdx!)}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* ─── TAB BOTONES ─── */}
            {tab === 'botones' && (
                <SectionBotones botones={botones} setBotones={setBotones} embeds={embeds} setEmbeds={setEmbeds} />
            )}

            {/* ─── TAB VARIABLES ─── */}
            {tab === 'vars' && (
                <div className="space-y-6">
                    <div className={CARD}>
                        <h3 className="text-lg font-semibold text-white">👤 Variables de Usuario</h3>
                        <p className="text-xs text-purple-200/70 mb-3">Se reemplazan al publicar el embed.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {VARIABLES_USUARIO.map(([k, v]) => (
                                <div key={k} className="flex items-center gap-3 p-2 bg-[#0f0f13]/60 rounded-lg border border-[#3b2d63]/40">
                                    <code className="text-xs text-[#c084fc] bg-[#1b172e] px-2 py-1 rounded">{k}</code>
                                    <span className="text-xs text-purple-200/70">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={CARD}>
                        <h3 className="text-lg font-semibold text-white">🏰 Variables de Servidor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {VARIABLES_SERVER.map(([k, v]) => (
                                <div key={k} className="flex items-center gap-3 p-2 bg-[#0f0f13]/60 rounded-lg border border-[#3b2d63]/40">
                                    <code className="text-xs text-[#c084fc] bg-[#1b172e] px-2 py-1 rounded">{k}</code>
                                    <span className="text-xs text-purple-200/70">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={CARD}>
                        <h3 className="text-lg font-semibold text-white">⏳ Variables de Tiempo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {VARIABLES_TIME.map(([k, v]) => (
                                <div key={k} className="flex items-center gap-3 p-2 bg-[#0f0f13]/60 rounded-lg border border-[#3b2d63]/40">
                                    <code className="text-xs text-[#c084fc] bg-[#1b172e] px-2 py-1 rounded">{k}</code>
                                    <span className="text-xs text-purple-200/70">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={CARD}>
                        <h3 className="text-lg font-semibold text-white">💡 Ejemplo</h3>
                        <pre className="bg-[#0f0f13] border border-[#3b2d63]/50 rounded-xl p-4 text-xs text-purple-200 overflow-x-auto">
{`Bienvenido {user} a {server_name}!
Actualmente somos {member_count} miembros.
Unidos desde {date}.`}
                        </pre>
                    </div>
                </div>
            )}

            {/* Guardar */}
            {tab !== 'vars' && (
                <button type="button" onClick={guardarTodo} disabled={saving} className={BTN_SAVE}>
                    {saving ? 'Guardando...' : '💾 Guardar cambios'}
                </button>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── EDITOR DE EMBED ───
// ═══════════════════════════════════════════════════════
function EmbedEditor({
    embed, embedIdx, botones, channels, updateEmbed,
    updateBlock, addBlock, removeBlock, moveBlock, onDelete, onClone,
}: any) {
    const esV2 = embed.tipo === 'v2';

    return (
        <>
            <div className={CARD}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{esV2 ? '🧱' : '📄'}</span>
                            <span className="text-xs uppercase tracking-widest text-purple-300/60">
                                {esV2 ? 'Contenedor V2' : 'Embed Clásico'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white truncate">{embed.nombre}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClone} className={BTN_GHOST}>📋 Clonar</button>
                        <button type="button" onClick={onDelete} className="text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 px-3 py-1.5 rounded-lg text-red-300 transition-all">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL}>Color de acento</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={embed.color || '#3498DB'}
                                onChange={e => updateEmbed(embedIdx, { color: e.target.value })}
                                className="w-12 h-10 bg-[#0f0f13] border border-[#3b2d63]/60 rounded-lg cursor-pointer"
                            />
                            <input
                                type="text"
                                value={embed.color || ''}
                                onChange={e => updateEmbed(embedIdx, { color: e.target.value })}
                                className={INPUT}
                                placeholder="#3498DB"
                            />
                        </div>
                    </div>
                    <div>
                        <label className={LABEL}>Botones vinculados ({embed.botones?.length || 0})</label>
                        <div className="flex flex-wrap gap-1 p-2 bg-[#0f0f13]/60 border border-[#3b2d63]/40 rounded-lg min-h-[44px]">
                            {(embed.botones || []).length === 0 && (
                                <span className="text-xs text-gray-500 italic">Sin botones. Añádelos desde la pestaña Botones.</span>
                            )}
                            {(embed.botones || []).map((b: string, i: number) => (
                                <span key={i} className="text-xs bg-[#5865F2]/20 border border-[#5865F2]/40 text-white px-2 py-0.5 rounded">
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {!esV2 && (
                <div className={CARD}>
                    <h3 className="text-lg font-semibold text-white">📝 Contenido</h3>

                    <div>
                        <label className={LABEL}>Título</label>
                        <input
                            value={embed.title || ''}
                            onChange={e => updateEmbed(embedIdx, { title: e.target.value })}
                            className={INPUT}
                            placeholder="Título del embed"
                        />
                    </div>

                    <div>
                        <label className={LABEL}>Descripción</label>
                        <textarea
                            value={embed.description || ''}
                            onChange={e => updateEmbed(embedIdx, { description: e.target.value })}
                            rows={5}
                            className={INPUT}
                            placeholder="Descripción..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL}>URL Imagen</label>
                            <input
                                value={embed.image || ''}
                                onChange={e => updateEmbed(embedIdx, { image: e.target.value || null })}
                                className={INPUT}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className={LABEL}>URL Miniatura</label>
                            <input
                                value={embed.thumbnail || ''}
                                onChange={e => updateEmbed(embedIdx, { thumbnail: e.target.value || null })}
                                className={INPUT}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className={LABEL}>Footer (pie)</label>
                        <input
                            value={embed.footer || ''}
                            onChange={e => updateEmbed(embedIdx, { footer: e.target.value || null })}
                            className={INPUT}
                            placeholder="Pie de página"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className={LABEL + ' !mb-0'}>Campos ({embed.fields?.length || 0}/25)</label>
                            <button
                                type="button"
                                onClick={() => {
                                    const f = [...(embed.fields || []), { name: 'Nuevo', value: 'Contenido', inline: false }];
                                    updateEmbed(embedIdx, { fields: f });
                                }}
                                className={BTN_SMALL}
                            >
                                + Añadir campo
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(embed.fields || []).map((f: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center bg-[#0f0f13]/60 p-2 rounded-lg border border-[#3b2d63]/40">
                                    <input
                                        value={f.name}
                                        onChange={e => {
                                            const nf = [...embed.fields];
                                            nf[i] = { ...nf[i], name: e.target.value };
                                            updateEmbed(embedIdx, { fields: nf });
                                        }}
                                        placeholder="Título"
                                        className="flex-1 bg-[#1b172e]/80 border border-[#3b2d63]/50 rounded-lg px-3 py-1.5 text-white text-xs"
                                    />
                                    <input
                                        value={f.value}
                                        onChange={e => {
                                            const nf = [...embed.fields];
                                            nf[i] = { ...nf[i], value: e.target.value };
                                            updateEmbed(embedIdx, { fields: nf });
                                        }}
                                        placeholder="Valor"
                                        className="flex-1 bg-[#1b172e]/80 border border-[#3b2d63]/50 rounded-lg px-3 py-1.5 text-white text-xs"
                                    />
                                    <label className="flex items-center gap-1 text-xs text-purple-200">
                                        <input
                                            type="checkbox"
                                            checked={f.inline}
                                            onChange={e => {
                                                const nf = [...embed.fields];
                                                nf[i] = { ...nf[i], inline: e.target.checked };
                                                updateEmbed(embedIdx, { fields: nf });
                                            }}
                                            className="w-3 h-3 accent-[#5865F2]"
                                        />
                                        Inline
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => updateEmbed(embedIdx, { fields: embed.fields.filter((_: any, fi: number) => fi !== i) })}
                                        className="text-red-400 hover:text-red-300 px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {esV2 && (
                <div className={CARD}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-white">🧱 Bloques ({embed.v2?.blocks?.length || 0})</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {TIPOS_BLOQUE.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => addBlock(embedIdx, t.id)}
                                title={t.desc}
                                className="text-left bg-[#0f0f13]/60 hover:bg-[#3b2d63]/40 border border-[#3b2d63]/40 rounded-xl p-3 transition-all btn-glow"
                            >
                                <div className="text-xl mb-1">{t.emoji}</div>
                                <div className="text-xs font-medium text-white">{t.label}</div>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {(embed.v2?.blocks || []).length === 0 && (
                            <p className="text-sm text-gray-500 italic text-center py-6">Sin bloques. Añade uno arriba.</p>
                        )}
                        {(embed.v2?.blocks || []).map((b: any, i: number) => (
                            <BloqueEditor
                                key={i}
                                bloque={b}
                                idx={i}
                                total={(embed.v2?.blocks || []).length}
                                botones={botones}
                                onUpdate={(patch: any) => updateBlock(embedIdx, i, patch)}
                                onRemove={() => removeBlock(embedIdx, i)}
                                onMoveUp={() => moveBlock(embedIdx, i, 'up')}
                                onMoveDown={() => moveBlock(embedIdx, i, 'down')}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════
// ─── EDITOR DE BLOQUE INDIVIDUAL ───
// ═══════════════════════════════════════════════════════
function BloqueEditor({ bloque, idx, total, botones, onUpdate, onRemove, onMoveUp, onMoveDown }: any) {
    const meta = TIPOS_BLOQUE.find(t => t.id === bloque.tipo);

    return (
        <div className="bg-[#0f0f13]/60 border border-[#3b2d63]/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{meta?.emoji || '❓'}</span>
                    <span className="text-sm font-semibold text-white">{meta?.label || bloque.tipo}</span>
                    <span className="text-xs text-purple-300/50">#{idx + 1}</span>
                </div>
                <div className="flex gap-1">
                    <button type="button" onClick={onMoveUp} disabled={idx === 0} className="p-1.5 rounded hover:bg-[#3b2d63]/50 disabled:opacity-30 text-purple-200">▲</button>
                    <button type="button" onClick={onMoveDown} disabled={idx === total - 1} className="p-1.5 rounded hover:bg-[#3b2d63]/50 disabled:opacity-30 text-purple-200">▼</button>
                    <button type="button" onClick={onRemove} className="p-1.5 rounded hover:bg-red-500/20 text-red-400">✕</button>
                </div>
            </div>

            {(bloque.tipo === 'header' || bloque.tipo === 'text') && (
                <textarea
                    value={bloque.texto || ''}
                    onChange={e => onUpdate({ texto: e.target.value })}
                    rows={2}
                    className={INPUT}
                    placeholder={bloque.tipo === 'header' ? '## Título grande' : 'Párrafo normal'}
                />
            )}

            {bloque.tipo === 'section' && (
                <div className="space-y-3">
                    <textarea
                        value={bloque.texto || ''}
                        onChange={e => onUpdate({ texto: e.target.value })}
                        rows={2}
                        className={INPUT}
                        placeholder="Texto principal"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-purple-200/70">Thumbnail (URL)</label>
                            <input
                                value={bloque.thumbnail || ''}
                                onChange={e => onUpdate({ thumbnail: e.target.value })}
                                className={INPUT + ' text-sm'}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-purple-200/70">Botón Link (opcional)</label>
                            <input
                                value={bloque.buttonLabel || ''}
                                onChange={e => onUpdate({ buttonLabel: e.target.value })}
                                className={INPUT + ' text-sm'}
                                placeholder="Texto del botón"
                            />
                            <input
                                value={bloque.buttonUrl || ''}
                                onChange={e => onUpdate({ buttonUrl: e.target.value })}
                                className={INPUT + ' text-sm'}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {bloque.tipo === 'separator' && (
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-purple-200">
                        <input
                            type="checkbox"
                            checked={bloque.divider !== false}
                            onChange={e => onUpdate({ divider: e.target.checked })}
                            className="w-4 h-4 accent-[#5865F2]"
                        />
                        Con línea
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-200">Espaciado</span>
                        <input
                            type="number"
                            min={1}
                            max={3}
                            value={bloque.spacing ?? 1}
                            onChange={e => onUpdate({ spacing: Number(e.target.value) })}
                            className="w-16 bg-[#1b172e]/80 border border-[#3b2d63]/50 rounded-lg px-2 py-1 text-white text-xs"
                        />
                    </div>
                </div>
            )}

            {bloque.tipo === 'media' && (
                <div>
                    <label className="text-xs text-purple-200/70">URLs (una por línea, máx 10)</label>
                    <textarea
                        value={(bloque.urls || []).join('\n')}
                        onChange={e => onUpdate({ urls: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) })}
                        rows={3}
                        className={INPUT + ' text-sm font-mono'}
                        placeholder="https://...&#10;https://..."
                    />
                </div>
            )}

            {bloque.tipo === 'actionrow' && (
                <div>
                    <label className="text-xs text-purple-200/70 mb-2 block">Botones vinculados (máx 5)</label>
                    <div className="flex flex-wrap gap-2">
                        {botones.map((b: any) => {
                            const seleccionado = (bloque.botones || []).includes(b.nombre);
                            return (
                                <button
                                    key={b.nombre}
                                    type="button"
                                    onClick={() => {
                                        const actual = bloque.botones || [];
                                        const nuevos = seleccionado
                                            ? actual.filter((x: string) => x !== b.nombre)
                                            : [...actual, b.nombre].slice(0, 5);
                                        onUpdate({ botones: nuevos });
                                    }}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                        seleccionado
                                            ? 'bg-[#5865F2]/20 border-[#5865F2]/50 text-white'
                                            : 'bg-transparent border-[#3b2d63]/50 text-purple-200/60 hover:border-[#5865F2]/30'
                                    }`}
                                >
                                    {b.emoji || '🔘'} {b.label || b.nombre}
                                </button>
                            );
                        })}
                        {botones.length === 0 && (
                            <span className="text-xs text-gray-500 italic">Crea botones primero en la pestaña Botones.</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// ─── SECCIÓN BOTONES ───
// ═══════════════════════════════════════════════════════
function SectionBotones({ botones, setBotones, embeds, setEmbeds }: any) {
    const [nuevo, setNuevo] = useState({ nombre: '', label: '', emoji: '', style: 'PRIMARY' });

    function addBoton() {
        const n = nuevo.nombre.trim();
        if (!n) return alert('Nombre requerido');
        if (botones.some((b: any) => b.nombre.toLowerCase() === n.toLowerCase())) return alert('Ya existe');
        setBotones([...botones, {
            nombre: n,
            label: nuevo.label || n,
            emoji: nuevo.emoji || null,
            style: nuevo.style,
            action: { tipo: 'MESSAGE', roleId: null, channelName: null, responseMessage: '¡Acción ejecutada!', ephemeral: true }
        }]);
        setNuevo({ nombre: '', label: '', emoji: '', style: 'PRIMARY' });
    }

    function updateBoton(i: number, patch: any) {
        setBotones(botones.map((b: any, idx: number) => idx === i ? { ...b, ...patch } : b));
    }

    function removeBoton(i: number) {
        if (!confirm(`¿Eliminar botón "${botones[i].nombre}"?`)) return;
        const nombre = botones[i].nombre;
        setBotones(botones.filter((_: any, idx: number) => idx !== i));
        setEmbeds(embeds.map((e: any) => ({
            ...e,
            botones: (e.botones || []).filter((b: string) => b.toLowerCase() !== nombre.toLowerCase()),
            v2: e.v2 ? {
                ...e.v2,
                blocks: (e.v2.blocks || []).map((bl: any) =>
                    bl.tipo === 'actionrow'
                        ? { ...bl, botones: (bl.botones || []).filter((x: string) => x.toLowerCase() !== nombre.toLowerCase()) }
                        : bl
                )
            } : e.v2
        })));
    }

    return (
        <div className="space-y-4">
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">✨ Crear botón</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Nombre único" className={INPUT + ' text-sm'} />
                    <input value={nuevo.label} onChange={e => setNuevo({ ...nuevo, label: e.target.value })} placeholder="Texto visible" className={INPUT + ' text-sm'} />
                    <input value={nuevo.emoji} onChange={e => setNuevo({ ...nuevo, emoji: e.target.value })} placeholder="Emoji (opcional)" className={INPUT + ' text-sm'} />
                    <select value={nuevo.style} onChange={e => setNuevo({ ...nuevo, style: e.target.value })} className={INPUT + ' text-sm'}>
                        <option value="PRIMARY">🔵 Primary</option>
                        <option value="SECONDARY">⚪ Secondary</option>
                        <option value="SUCCESS">🟢 Success</option>
                        <option value="DANGER">🔴 Danger</option>
                    </select>
                </div>
                <button type="button" onClick={addBoton} className={BTN_SMALL}>+ Añadir botón</button>
            </div>

            {botones.length === 0 && (
                <div className={CARD + ' text-center py-12'}>
                    <p className="text-3xl mb-2">🔘</p>
                    <p className="text-sm text-purple-200/60">Sin botones registrados.</p>
                </div>
            )}

            <div className="space-y-3">
                {botones.map((b: any, i: number) => (
                    <div key={i} className={CARD + ' !p-4'}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{b.emoji || '🔘'}</span>
                                <span className="font-mono text-sm text-white">{b.nombre}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    b.style === 'PRIMARY' ? 'bg-blue-500/20 text-blue-300' :
                                    b.style === 'SUCCESS' ? 'bg-green-500/20 text-green-300' :
                                    b.style === 'DANGER' ? 'bg-red-500/20 text-red-300' :
                                    'bg-gray-500/20 text-gray-300'
                                }`}>{b.style}</span>
                            </div>
                            <button type="button" onClick={() => removeBoton(i)} className="text-red-400 hover:text-red-300 text-xs">🗑️ Eliminar</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className={LABEL + ' !text-xs'}>Texto</label>
                                <input value={b.label || ''} onChange={e => updateBoton(i, { label: e.target.value })} className={INPUT + ' text-sm'} />
                            </div>
                            <div>
                                <label className={LABEL + ' !text-xs'}>Emoji</label>
                                <input value={b.emoji || ''} onChange={e => updateBoton(i, { emoji: e.target.value || null })} className={INPUT + ' text-sm'} placeholder="(vacío = sin emoji)" />
                            </div>
                            <div>
                                <label className={LABEL + ' !text-xs'}>Tipo de acción</label>
                                <select
                                    value={b.action?.tipo || 'MESSAGE'}
                                    onChange={e => updateBoton(i, { action: { ...b.action, tipo: e.target.value } })}
                                    className={INPUT + ' text-sm'}
                                >
                                    <option value="MESSAGE">💬 Mensaje</option>
                                    <option value="ROLE">🎭 Dar/Quitar rol</option>
                                    <option value="CHANNEL">📁 Crear canal</option>
                                </select>
                            </div>
                        </div>

                        {b.action?.tipo === 'ROLE' && (
                            <div>
                                <label className={LABEL + ' !text-xs'}>ID del rol</label>
                                <input value={b.action.roleId || ''} onChange={e => updateBoton(i, { action: { ...b.action, roleId: e.target.value } })} className={INPUT + ' text-sm'} placeholder="123456789..." />
                            </div>
                        )}
                        {b.action?.tipo === 'CHANNEL' && (
                            <div>
                                <label className={LABEL + ' !text-xs'}>Nombre del canal (acepta variables)</label>
                                <input value={b.action.channelName || ''} onChange={e => updateBoton(i, { action: { ...b.action, channelName: e.target.value } })} className={INPUT + ' text-sm'} placeholder="canal-{user_name}" />
                            </div>
                        )}
                        {b.action?.tipo === 'MESSAGE' && (
                            <div>
                                <label className={LABEL + ' !text-xs'}>Mensaje de respuesta (acepta variables)</label>
                                <textarea value={b.action.responseMessage || ''} onChange={e => updateBoton(i, { action: { ...b.action, responseMessage: e.target.value } })} rows={2} className={INPUT + ' text-sm'} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
