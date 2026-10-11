'use client';

import { useState } from 'react';
import EmbedPickerPanel from './EmbedPickerPanel';

interface Props {
    config: any;
    channels: any[];
    embeds: any[];
    setEmbeds: (v: any[]) => void;
    onSave: (updates: Record<string, any>, seccion: string, incluirEmbeds?: boolean) => void;
    saving: boolean;
}

const CARD = 'bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 space-y-4';
const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';
const BTN_SAVE = 'w-full bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all btn-glow';

const VARS_RAPIDAS = [
    ['{user}', 'Mención'],
    ['{user_name}', 'Nombre'],
    ['{user_avatar}', 'Foto'],
    ['{server_name}', 'Servidor'],
    ['{member_count}', 'Miembros'],
    ['{date}', 'Fecha'],
];

export default function SectionGoodbye({ config, channels, embeds, setEmbeds, onSave, saving }: Props) {
    const c = config.goodbye?.list?.[0] || {};
    const [enabled, setEnabled] = useState(c.enabled ?? false);
    const [channelId, setChannelId] = useState(c.channelId || '');
    const [message, setMessage] = useState(c.message || 'Hasta pronto {user}...');
    const [embedNombre, setEmbedNombre] = useState<string | null>(c.embedNombre || null);
    const [embedColor, setEmbedColor] = useState(c.embedColor || '#E74C3C');
    const [imageUrl, setImageUrl] = useState(c.imageUrl || '');
    const [botones, setBotones] = useState<string[]>(c.botones || []);
    const [showVars, setShowVars] = useState(false);

    const usaEmbed = !!embedNombre;

    function handleSave() {
        onSave({
            'goodbye.list': [{
                enabled,
                channelId,
                message: usaEmbed ? null : message,
                embedNombre: embedNombre || null,
                embedColor,
                imageUrl: imageUrl || null,
                botones,
            }]
        }, 'Despedidas', true);
    }

    return (
        <div className="space-y-6">
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">👋 Mensaje de despedida</h3>

                <label className="flex items-center gap-3 p-3 bg-[#0f0f13]/60 rounded-xl border border-[#3b2d63]/50 cursor-pointer">
                    <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4 accent-[#5865F2]" />
                    <span className="text-sm text-purple-100">Activar despedidas</span>
                </label>

                <div>
                    <label className={LABEL}>Canal</label>
                    <select value={channelId} onChange={e => setChannelId(e.target.value)} className={INPUT}>
                        <option value="">Selecciona un canal...</option>
                        {channels.map((ch: any) => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
                    </select>
                </div>
            </div>

            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🎨 Apariencia</h3>

                <EmbedPickerPanel
                    embeds={embeds}
                    setEmbeds={setEmbeds}
                    selectedName={embedNombre}
                    onSelect={setEmbedNombre}
                    label="Embed personalizado"
                />

                {!usaEmbed && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className={LABEL + ' !mb-0'}>Mensaje plano</label>
                            <button
                                type="button"
                                onClick={() => setShowVars(!showVars)}
                                className="text-xs bg-[#3b2d63]/40 hover:bg-[#3b2d63]/60 border border-[#3b2d63]/50 px-2.5 py-1 rounded-lg text-purple-200 transition-all"
                            >
                                🧩 {showVars ? 'Ocultar' : 'Ver'} variables
                            </button>
                        </div>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className={INPUT} />
                        {showVars && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 p-3 bg-[#0f0f13]/60 border border-[#3b2d63]/40 rounded-xl animate-slide-in">
                                {VARS_RAPIDAS.map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-1.5 text-[11px]">
                                        <code className="text-[#c084fc] bg-[#1b172e] px-1.5 py-0.5 rounded font-mono">{k}</code>
                                        <span className="text-purple-200/60">{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">✨ Extras</h3>

                <div>
                    <label className={LABEL}>URL de imagen grande (opcional)</label>
                    <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={INPUT} placeholder="https://..." />
                </div>

                <div>
                    <label className={LABEL}>Botones vinculados</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-[#0f0f13]/60 border border-[#3b2d63]/40 rounded-xl min-h-[50px]">
                        {botones.length === 0 && (
                            <span className="text-xs text-gray-500 italic">Sin botones.</span>
                        )}
                        {botones.map((b, i) => (
                            <span key={i} className="text-xs bg-[#5865F2]/20 border border-[#5865F2]/40 text-white px-2 py-1 rounded-md flex items-center gap-1">
                                {b}
                                <button type="button" onClick={() => setBotones(botones.filter((_, bi) => bi !== i))} className="text-red-400 hover:text-red-300 ml-1">✕</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <button type="button" onClick={handleSave} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar despedidas'}
            </button>
        </div>
    );
}
