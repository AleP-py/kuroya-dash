'use client';

import { useState } from 'react';

interface Props {
    config: any;
    roles: any[];
    onSave: (updates: Record<string, any>, seccion: string) => void;
    saving: boolean;
}

const CARD = 'bg-[#1b172e]/60 backdrop-blur-xl border border-[#3b2d63]/60 rounded-2xl p-6 space-y-4';
const INPUT = 'w-full bg-[#0f0f13]/80 border border-[#3b2d63]/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 transition-all';
const LABEL = 'block text-sm font-medium text-purple-200 mb-1.5';
const BTN_SAVE = 'w-full bg-gradient-to-r from-[#5865F2] to-[#9B59B6] hover:from-[#4752C4] hover:to-[#8e44ad] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all btn-glow';

export default function SectionStaff({ config, roles, onSave, saving }: Props) {
    const sc = config.staffConfig || {};
    const [managerRoleId, setManagerRoleId] = useState(sc.managerRoleId || '');
    const [cooldownDias, setCooldownDias] = useState(sc.cooldownRatingDias ?? 30);
    const [roleMapping, setRoleMapping] = useState<{ rolId: string; nivel: number }[]>(
        sc.roleMapping || []
    );

    const assignableRoles = roles.filter((r: any) => r.name !== '@everyone' && !r.managed);

    function addMapping() {
        const niveles = roleMapping.map(m => m.nivel);
        const next = niveles.length > 0 ? Math.max(...niveles) + 1 : 1;
        setRoleMapping([...roleMapping, { rolId: '', nivel: next }]);
    }

    function updateMapping(i: number, patch: Partial<{ rolId: string; nivel: number }>) {
        setRoleMapping(roleMapping.map((m, idx) => idx === i ? { ...m, ...patch } : m));
    }

    function removeMapping(i: number) {
        setRoleMapping(roleMapping.filter((_, idx) => idx !== i));
    }

    function handleSave() {
        // Ordenar por nivel
        const mappingLimpio = roleMapping
            .filter(m => m.rolId && m.nivel >= 1)
            .sort((a, b) => a.nivel - b.nivel);

        onSave({
            'staffConfig.managerRoleId': managerRoleId || null,
            'staffConfig.cooldownRatingDias': cooldownDias,
            'staffConfig.roleMapping': mappingLimpio,
        }, 'Staff');
    }

    return (
        <div className="space-y-6">
            {/* ─── CONFIGURACIÓN GENERAL ─── */}
            <div className={CARD}>
                <h3 className="text-lg font-semibold text-white">👔 Configuración general</h3>
                <p className="text-xs text-purple-200/70">
                    El Staff Manager puede gestionar roles y calificaciones sin necesitar permisos de Administrador.
                </p>

                <div>
                    <label className={LABEL}>Rol de Staff Manager</label>
                    <select value={managerRoleId} onChange={e => setManagerRoleId(e.target.value)} className={INPUT}>
                        <option value="">Sin rol asignado</option>
                        {assignableRoles.map((r: any) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className={LABEL}>Cooldown entre calificaciones (días)</label>
                    <input type="number" min={1} max={365} value={cooldownDias} onChange={e => setCooldownDias(Number(e.target.value))} className={INPUT} />
                    <p className="text-xs text-purple-300/50 mt-1">Cada cuántos días un staff puede calificar al mismo usuario.</p>
                </div>
            </div>

            {/* ─── MAPEO DE ROLES ─── */}
            <div className={CARD}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-white">🎭 Mapeo de roles por nivel</h3>
                        <p className="text-xs text-purple-200/70">
                            Nivel 1 = rango más bajo, número mayor = rango más alto. Los staff solo pueden calificar a rangos inferiores.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addMapping}
                        className="text-sm bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1.5 rounded-lg text-white btn-glow"
                    >
                        + Añadir rol
                    </button>
                </div>

                {roleMapping.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Sin roles configurados. Añade al menos uno para activar el sistema.</p>
                )}

                <div className="space-y-3">
                    {[...roleMapping]
                        .sort((a, b) => a.nivel - b.nivel)
                        .map((m, i) => {
                            const realIdx = roleMapping.findIndex(x => x === m);
                            return (
                                <div key={i} className="flex gap-3 items-center bg-[#0f0f13]/60 p-3 rounded-xl border border-[#3b2d63]/50">
                                    <div className="flex flex-col items-center gap-1">
                                        <label className="text-[10px] text-purple-300/60 uppercase">Nivel</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={99}
                                            value={m.nivel}
                                            onChange={e => updateMapping(realIdx, { nivel: Number(e.target.value) })}
                                            className="w-16 bg-[#1b172e]/80 border border-[#3b2d63]/50 rounded-lg px-2 py-1.5 text-white text-center text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-purple-300/60 uppercase">Rol</label>
                                        <select
                                            value={m.rolId}
                                            onChange={e => updateMapping(realIdx, { rolId: e.target.value })}
                                            className="w-full bg-[#1b172e]/80 border border-[#3b2d63]/50 rounded-lg px-3 py-1.5 text-white text-sm"
                                        >
                                            <option value="">Selecciona rol...</option>
                                            {assignableRoles.map((r: any) => (
                                                <option key={r.id} value={r.id}>@{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeMapping(realIdx)}
                                        className="text-red-400 hover:text-red-300 px-2 py-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                </div>
                <p className="text-xs text-purple-300/50">
                    ℹ️ {roleMapping.length} rol(es) configurado(s)
                </p>
            </div>

            <button type="button" onClick={handleSave} disabled={saving} className={BTN_SAVE}>
                {saving ? 'Guardando...' : '💾 Guardar configuración de staff'}
            </button>
        </div>
    );
}
