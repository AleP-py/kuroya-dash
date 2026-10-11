'use client';

import { useState } from 'react';

const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';

const VARIABLES_GRUPOS = [
    {
        titulo: '👤 Usuario',
        items: [
            ['{user}', 'Mención interactiva'],
            ['{user_name}', 'Nombre plano'],
            ['{user_tag}', 'Tag completo'],
            ['{user_id}', 'ID numérica'],
            ['{user_avatar}', 'URL de la foto'],
            ['{user_created_at}', 'Antigüedad de la cuenta'],
        ],
    },
    {
        titulo: '🏰 Servidor',
        items: [
            ['{server_name}', 'Nombre del servidor'],
            ['{server_id}', 'ID del servidor'],
            ['{server_icon}', 'URL del icono'],
            ['{server_banner}', 'URL del banner'],
            ['{server_owner}', 'Mención al dueño'],
            ['{member_count}', 'Total de miembros'],
            ['{boost_count}', 'Cantidad de boosts'],
            ['{boost_tier}', 'Nivel del servidor'],
        ],
    },
    {
        titulo: '⏳ Tiempo',
        items: [
            ['{time}', 'Hora interactiva'],
            ['{date}', 'Fecha interactiva'],
            ['{date_full}', 'Fecha y hora completa'],
            ['{relative_time}', 'Formato relativo'],
        ],
    },
    {
        titulo: '🤝 Alianzas',
        items: [
            ['{invite_server_name}', 'Nombre del servidor aliado'],
            ['{invite_server_icon}', 'Icono del servidor aliado'],
            ['{ally_points}', 'Puntos totales'],
            ['{points_gained}', 'Puntos ganados'],
            ['{invite_link}', 'Código de invitación'],
            ['{relation_type}', 'Tipo de relación'],
        ],
    },
];

interface Props {
    embeds: any[];
    setEmbeds: (v: any[]) => void;
    selectedName: string | null;
    onSelect: (name: string | null) => void;
    label?: string;
    collapsible?: boolean; // sin uso ahora, se mantiene por compatibilidad
    defaultOpen?: boolean;
}

export default function EmbedPickerPanel({
    embeds,
    setEmbeds,
    selectedName,
    onSelect,
    label = 'Embed personalizado (opcional)',
}: Props) {
    const selectedIdx = embeds.findIndex((e: any) => e.nombre === selectedName);
    const selected = selectedIdx !== -1 ? embeds[selectedIdx] : null;

    const [showVars, setShowVars] = useState(false);

    function updateEmbed(patch: Record<string, any>) {
        if (selectedIdx === -1) return;
        const nuevos = [...embeds];
        nuevos[selectedIdx] = { ...nuevos[selectedIdx], ...patch };
        setEmbeds(nuevos);
    }

    return (
        <div className="space-y-3">
            {/* Selector */}
            <div>
                <label className={LABEL}>{label}</label>
                <select
                    value={selectedName || ''}
                    onChange={e => onSelect(e.target.value || null)}
                    className={INPUT}
                >
                    <option value="">Sin embed (usar mensaje plano)</option>
                    {embeds.map((e: any) => (
                        <option key={e.nombre} value={e.nombre}>
                            {e.tipo === 'v2' ? '🧱' : '📄'} {e.nombre}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-purple-300/50 mt-1">
                    {embeds.length === 0
                        ? 'No hay embeds creados. Ve a la sección Embeds para crear uno.'
                        : 'Si seleccionas uno, se usará en lugar del mensaje plano.'}
                </p>
            </div>

            {/* Botón de variables */}
            <button
                type="button"
                onClick={() => setShowVars(!showVars)}
                className="text-xs bg-[#3b2d63]/40 hover:bg-[#3b2d63]/60 border border-[#3b2d63]/50 px-3 py-1.5 rounded-lg text-purple-200 transition-all"
            >
                🧩 {showVars ? 'Ocultar' : 'Ver'} variables disponibles
            </button>

            {/* Lista de variables */}
            {showVars && (
                <div className="bg-[#0f0f13]/60 border border-[#3b2d63]/40 rounded-xl p-4 space-y-4">
                    {VARIABLES_GRUPOS.map(g => (
                        <div key={g.titulo}>
                            <h4 className="text-xs uppercase tracking-widest text-purple-300/70 mb-2">{g.titulo}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                {g.items.map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-2 text-xs">
                                        <code className="text-[#c084fc] bg-[#1b172e] px-1.5 py-0.5 rounded font-mono">{k}</code>
                                        <span className="text-purple-200/60">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Editor SIEMPRE VISIBLE ─── */}
            {selected && selected.tipo === 'classic' && (
                <div className="border border-[#3b2d63]/40 rounded-xl overflow-hidden bg-[#0f0f13]/30">
                    <div className="flex items-center gap-2 p-3 bg-[#0f0f13]/60 border-b border-[#3b2d63]/40">
                        <span>📄</span>
                        <span className="text-sm text-white font-medium">{selected.nombre}</span>
                        <span className="text-xs text-purple-300/50">· Clásico</span>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Color */}
                        <div>
                            <label className={LABEL + ' !text-xs'}>Color de acento</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={selected.color || '#3498DB'}
                                    onChange={e => updateEmbed({ color: e.target.value })}
                                    className="w-10 h-9 bg-[#0f0f13] border border-[#3b2d63]/60 rounded-lg cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selected.color || ''}
                                    onChange={e => updateEmbed({ color: e.target.value })}
                                    className={INPUT + ' text-sm'}
                                    placeholder="#3498DB"
                                />
                            </div>
                        </div>

                        {/* Título */}
                        <div>
                            <label className={LABEL + ' !text-xs'}>Título</label>
                            <input
                                value={selected.title || ''}
                                onChange={e => updateEmbed({ title: e.target.value })}
                                className={INPUT + ' text-sm'}
                                placeholder="Título del embed"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className={LABEL + ' !text-xs'}>Descripción</label>
                            <textarea
                                value={selected.description || ''}
                                onChange={e => updateEmbed({ description: e.target.value })}
                                rows={4}
                                className={INPUT + ' text-sm'}
                                placeholder="Acepta variables como {user}, {server_name}..."
                            />
                            <p className="text-[10px] text-purple-300/50 mt-1">
                                Usa el botón &quot;Ver variables&quot; arriba para ver todas las disponibles.
                            </p>
                        </div>

                        {/* Imagen / Thumbnail */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={LABEL + ' !text-xs'}>URL Imagen grande</label>
                                <input
                                    value={selected.image || ''}
                                    onChange={e => updateEmbed({ image: e.target.value || null })}
                                    className={INPUT + ' text-sm'}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className={LABEL + ' !text-xs'}>URL Thumbnail (mini)</label>
                                <input
                                    value={selected.thumbnail || ''}
                                    onChange={e => updateEmbed({ thumbnail: e.target.value || null })}
                                    className={INPUT + ' text-sm'}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div>
                            <label className={LABEL + ' !text-xs'}>Footer (pie)</label>
                            <input
                                value={selected.footer || ''}
                                onChange={e => updateEmbed({ footer: e.target.value || null })}
                                className={INPUT + ' text-sm'}
                                placeholder="Pie de página"
                            />
                        </div>
                    </div>
                </div>
            )}

            {selected && selected.tipo === 'v2' && (
                <div className="border border-[#9B59B6]/40 rounded-xl overflow-hidden bg-[#9B59B6]/5">
                    <div className="flex items-center gap-2 p-3 bg-[#9B59B6]/10 border-b border-[#9B59B6]/30">
                        <span>🧱</span>
                        <span className="text-sm text-white font-medium">{selected.nombre}</span>
                        <span className="text-xs text-purple-300/70">· Contenedor V2</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="bg-[#0f0f13]/60 border border-[#3b2d63]/40 rounded-lg p-3">
                            <p className="text-xs text-purple-200/80">
                                Para editar los bloques, ve a la sección <strong>Embeds</strong> (tiene editor visual completo).
                            </p>
                        </div>
                        <div>
                            <label className={LABEL + ' !text-xs'}>Color de acento</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={selected.color || '#9B59B6'}
                                    onChange={e => updateEmbed({ color: e.target.value })}
                                    className="w-10 h-9 bg-[#0f0f13] border border-[#3b2d63]/60 rounded-lg cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selected.color || ''}
                                    onChange={e => updateEmbed({ color: e.target.value })}
                                    className={INPUT + ' text-sm'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
