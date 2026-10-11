'use client';

import { useState } from 'react';

const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';

interface Props {
    embeds: any[];
    setEmbeds: (v: any[]) => void;
    selectedName: string | null;
    onSelect: (name: string | null) => void;
    label?: string;
    collapsible?: boolean;    // Si true, empieza colapsado (útil en Alianzas)
    defaultOpen?: boolean;
}

export default function EmbedPickerPanel({
    embeds,
    setEmbeds,
    selectedName,
    onSelect,
    label = 'Embed personalizado (opcional)',
    collapsible = false,
    defaultOpen = true,
}: Props) {
    const selectedIdx = embeds.findIndex((e: any) => e.nombre === selectedName);
    const selected = selectedIdx !== -1 ? embeds[selectedIdx] : null;
    const [showEditor, setShowEditor] = useState(collapsible ? false : defaultOpen);

    function updateEmbed(patch: Record<string, any>) {
        if (selectedIdx === -1) return;
        const nuevos = [...embeds];
        nuevos[selectedIdx] = { ...nuevos[selectedIdx], ...patch };
        setEmbeds(nuevos);
    }

    return (
        <div className="space-y-3">
            <div>
                <label className={LABEL}>{label}</label>
                <select
                    value={selectedName || ''}
                    onChange={e => {
                        onSelect(e.target.value || null);
                        if (e.target.value) setShowEditor(true);
                    }}
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

            {selected && (
                <div className="border border-[#3b2d63]/40 rounded-xl overflow-hidden bg-[#0f0f13]/30">
                    <button
                        type="button"
                        onClick={() => setShowEditor(!showEditor)}
                        className="w-full flex items-center justify-between p-3 hover:bg-[#0f0f13]/60 transition-all"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span>{selected.tipo === 'v2' ? '🧱' : '📄'}</span>
                            <span className="text-sm text-white font-medium truncate">{selected.nombre}</span>
                            <span className="text-xs text-purple-300/50 flex-shrink-0">
                                · {selected.tipo === 'v2' ? 'V2' : 'Clásico'}
                            </span>
                        </div>
                        <span className="text-purple-300/60 text-xs flex-shrink-0 ml-2">
                            {showEditor ? '▲ Ocultar' : '▼ Editar propiedades'}
                        </span>
                    </button>

                    {showEditor && selected.tipo === 'classic' && (
                        <div className="p-4 space-y-3 border-t border-[#3b2d63]/40">
                            {/* Color */}
                            <div>
                                <label className={LABEL + ' !text-xs'}>Color</label>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className={LABEL + ' !text-xs'}>URL Imagen</label>
                                    <input
                                        value={selected.image || ''}
                                        onChange={e => updateEmbed({ image: e.target.value || null })}
                                        className={INPUT + ' text-sm'}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className={LABEL + ' !text-xs'}>URL Thumbnail</label>
                                    <input
                                        value={selected.thumbnail || ''}
                                        onChange={e => updateEmbed({ thumbnail: e.target.value || null })}
                                        className={INPUT + ' text-sm'}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={LABEL + ' !text-xs'}>Footer</label>
                                <input
                                    value={selected.footer || ''}
                                    onChange={e => updateEmbed({ footer: e.target.value || null })}
                                    className={INPUT + ' text-sm'}
                                    placeholder="Pie de página"
                                />
                            </div>
                        </div>
                    )}

                    {showEditor && selected.tipo === 'v2' && (
                        <div className="p-4 space-y-3 border-t border-[#3b2d63]/40">
                            <div className="bg-[#9B59B6]/10 border border-[#9B59B6]/30 rounded-lg p-3">
                                <p className="text-xs text-purple-200/80">
                                    🧱 Este es un contenedor V2. Para editarlo, ve a la sección <strong>Embeds</strong> (tiene su editor visual con bloques).
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
                    )}
                </div>
            )}
        </div>
    );
}
