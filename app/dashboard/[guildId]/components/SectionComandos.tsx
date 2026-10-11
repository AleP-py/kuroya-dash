'use client';

import { useState } from 'react';

interface Props {
    config: any;
    commands: any[];
    onSave: (updates: Record<string, any>, seccion: string) => void;
    saving: boolean;
}

const CATEGORIAS_VALIDAS = [
    'economia', 'alianzas', 'sorteos', 'niveles',
    'diversion', 'interaccion', 'moderacion', 'utilidad', 'configuracion'
];

const CATEGORIAS_ICONO: Record<string, string> = {
    economia: '💰', alianzas: '🤝', sorteos: '🎉', niveles: '📈',
    diversion: '🎮', interaccion: '💬', moderacion: '⚔️',
    utilidad: '🔧', configuracion: '⚙️', general: '📦',
};

const COMANDOS_PROTEGIDOS = ['help', 'disable', 'enable', 'setprefix', 'perm'];

const CARD = 'bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 space-y-4';
const BTN_SAVE = 'w-full bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all btn-glow';

export default function SectionComandos({ config, commands, onSave, saving }: Props) {
    const [modulosDeshabilitados, setModulos] = useState<string[]>(config.disabledModules || []);
    const [comandosDeshabilitados, setComandos] = useState<string[]>(config.disabledCommands || []);

    function toggleModulo(cat: string) {
        setModulos(prev => prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]);
    }

    function toggleComando(name: string) {
        setComandos(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
    }

    // Agrupar comandos por categoría
    const porCategoria: Record<string, any[]> = {};
    for (const cmd of commands) {
        const cat = cmd.categoria || 'general';
        if (!porCategoria[cat]) porCategoria[cat] = [];
        porCategoria[cat].push(cmd);
    }

    function handleSave() {
        onSave({
            disabledModules: modulosDeshabilitados,
            disabledCommands: comandosDeshabilitados,
        }, 'Comandos');
    }

    return (
        <div className="space-y-6">
            {/* ─── MÓDULOS ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">📦 Módulos (categorías)</h3>
                <p className="text-sm text-purple-200/70">
                    Desactivar un módulo apaga todos sus comandos de golpe. Útil para servidores que solo usan ciertas funciones.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CATEGORIAS_VALIDAS.filter(c => c !== 'configuracion').map(cat => {
                        const deshabilitado = modulosDeshabilitados.includes(cat);
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => toggleModulo(cat)}
                                className={`p-3 rounded-xl border text-left transition-all btn-glow ${
                                    deshabilitado
                                        ? 'bg-red-500/10 border-red-500/40 text-red-300'
                                        : 'bg-[#0f0f13]/60 border-[#3b2d63]/50 text-white hover:border-[#5865F2]/60'
                                }`}
                            >
                                <div className="text-2xl mb-1">{CATEGORIAS_ICONO[cat] || '📦'}</div>
                                <div className="text-sm font-medium capitalize">{cat}</div>
                                <div className="text-[10px] uppercase tracking-wider opacity-70">
                                    {deshabilitado ? 'Desactivado' : 'Activo'}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-purple-300/50">
                    ℹ️ El módulo <code>configuracion</code> no puede desactivarse (es vital).
                </p>
            </div>

            {/* ─── COMANDOS INDIVIDUALES ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">🛑 Comandos individuales</h3>
                <p className="text-sm text-purple-200/70">
                    Desactiva comandos específicos sin afectar todo su módulo. Los comandos vitales están protegidos.
                </p>

                {Object.keys(porCategoria).length === 0 && (
                    <p className="text-sm text-gray-500 italic">No se encontraron comandos. Verifica que el bot esté corriendo con el endpoint <code>/api/commands</code>.</p>
                )}

                <div className="space-y-4">
                    {Object.entries(porCategoria).map(([cat, cmds]) => (
                        <div key={cat} className="bg-[#0f0f13]/40 rounded-xl border border-[#3b2d63]/40 p-3">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">{CATEGORIAS_ICONO[cat] || '📦'}</span>
                                <h4 className="text-sm font-semibold text-purple-200 uppercase tracking-wide">{cat}</h4>
                                <span className="text-xs text-purple-300/50">({cmds.length})</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {cmds.map((cmd: any) => {
                                    const esProtegido = COMANDOS_PROTEGIDOS.includes(cmd.name);
                                    const deshabilitado = comandosDeshabilitados.includes(cmd.name);
                                    return (
                                        <button
                                            key={cmd.name}
                                            type="button"
                                            disabled={esProtegido}
                                            onClick={() => !esProtegido && toggleComando(cmd.name)}
                                            title={cmd.description}
                                            className={`p-2 rounded-lg border text-left text-xs transition-all ${
                                                esProtegido
                                                    ? 'bg-yellow-500/5 border-yellow-500/30 text-yellow-300/60 cursor-not-allowed'
                                                    : deshabilitado
                                                        ? 'bg-red-500/10 border-red-500/40 text-red-300 btn-glow'
                                                        : 'bg-[#1b172e]/60 border-[#3b2d63]/40 text-white hover:border-[#5865F2]/60 btn-glow'
                                            }`}
                                        >
                                            <div className="font-mono font-semibold truncate">
                                                {esProtegido && '🔒 '}
                                                {cmd.name}
                                            </div>
                                            <div className="text-[10px] opacity-60 truncate">{cmd.description || '—'}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── RESUMEN ─── */}
            <div className="bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-4">
                <div className="flex items-center gap-4 text-sm text-purple-200">
                    <span>📦 Módulos apagados: <strong className="text-white">{modulosDeshabilitados.length}</strong></span>
                    <span>🛑 Comandos apagados: <strong className="text-white">{comandosDeshabilitados.length}</strong></span>
                </div>
            </div>

            <button type="button" onClick={handleSave} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar configuración de comandos'}
            </button>
        </div>
    );
}
