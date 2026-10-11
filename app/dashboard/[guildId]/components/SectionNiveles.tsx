'use client';

import { useState } from 'react';

interface Props {
    config: any;
    channels: any[];
    roles: any[];
    onSave: (updates: Record<string, any>, seccion: string) => void;
    saving: boolean;
}

export default function SectionNiveles({ config, channels, roles, onSave, saving }: Props) {
    const nv = config.niveles || {};

    const [activo, setActivo] = useState(nv.activo ?? false);
    const [xpMin, setXpMin] = useState(nv.xpMin ?? 15);
    const [xpMax, setXpMax] = useState(nv.xpMax ?? 25);
    const [cooldown, setCooldown] = useState(nv.cooldownSegundos ?? 60);
    const [canalNotif, setCanalNotif] = useState<string>(nv.canalNotificaciones || 'actual');
    const [mensaje, setMensaje] = useState(
        nv.mensajeSubida || '🎉 ¡Felicidades {user}, has subido al **Nivel {nivel}**!'
    );

    const [multRoles, setMultRoles] = useState<{ rolId: string; multiplicador: number }[]>(
        nv.multiplicadoresRoles || []
    );
    const [multCanales, setMultCanales] = useState<{ canalId: string; multiplicador: number }[]>(
        nv.multiplicadoresCanales || []
    );
    const [recompensas, setRecompensas] = useState<{ nivel: number; rolId: string }[]>(
        nv.recompensasRoles || []
    );
    const [canalesIgnorados, setCanalesIgnorados] = useState<string[]>(nv.canalesIgnorados || []);
    const [rolesIgnorados, setRolesIgnorados] = useState<string[]>(nv.rolesIgnorados || []);

    // ─── Helpers para editar listas ───
    function addMultRol() {
        setMultRoles([...multRoles, { rolId: '', multiplicador: 1.5 }]);
    }
    function updateMultRol(i: number, patch: Partial<{ rolId: string; multiplicador: number }>) {
        setMultRoles(multRoles.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
    }
    function removeMultRol(i: number) {
        setMultRoles(multRoles.filter((_, idx) => idx !== i));
    }

    function addMultCanal() {
        setMultCanales([...multCanales, { canalId: '', multiplicador: 1.5 }]);
    }
    function updateMultCanal(i: number, patch: Partial<{ canalId: string; multiplicador: number }>) {
        setMultCanales(multCanales.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
    }
    function removeMultCanal(i: number) {
        setMultCanales(multCanales.filter((_, idx) => idx !== i));
    }

    function addRecompensa() {
        setRecompensas([...recompensas, { nivel: 1, rolId: '' }]);
    }
    function updateRecompensa(i: number, patch: Partial<{ nivel: number; rolId: string }>) {
        setRecompensas(recompensas.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    }
    function removeRecompensa(i: number) {
        setRecompensas(recompensas.filter((_, idx) => idx !== i));
    }

    function toggleItem(list: string[], setList: (v: string[]) => void, id: string) {
        setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
    }

    // ─── Guardar todo ───
    function handleSave() {
        // Validaciones básicas
        if (xpMax < xpMin) return alert('El XP máximo debe ser mayor o igual al mínimo.');
        if (cooldown < 0) return alert('El cooldown no puede ser negativo.');

        const updates = {
            'niveles.activo': activo,
            'niveles.xpMin': xpMin,
            'niveles.xpMax': xpMax,
            'niveles.cooldownSegundos': cooldown,
            'niveles.canalNotificaciones': canalNotif || 'actual',
            'niveles.mensajeSubida': mensaje,
            'niveles.multiplicadoresRoles': multRoles.filter(m => m.rolId),
            'niveles.multiplicadoresCanales': multCanales.filter(m => m.canalId),
            'niveles.recompensasRoles': recompensas.filter(r => r.rolId),
            'niveles.canalesIgnorados': canalesIgnorados,
            'niveles.rolesIgnorados': rolesIgnorados,
        };

        onSave(updates, 'Niveles');
    }

    // Filtramos roles asignables
    const assignableRoles = roles.filter((r: any) => r.name !== '@everyone' && !r.managed);

    return (
        <div className="space-y-6">
            {/* ─── CONFIGURACIÓN GENERAL ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
                <h2 className="text-xl font-semibold text-white">📈 Sistema de Niveles (Local)</h2>
                <p className="text-sm text-purple-200/70">
                    Solo afecta a este servidor. No interfiere con el XP de la economía global.
                </p>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={activo}
                        onChange={e => setActivo(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label className="text-sm text-purple-200">Activar sistema de niveles</label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">XP mínimo</label>
                        <input
                            type="number"
                            min={1}
                            max={500}
                            value={xpMin}
                            onChange={e => setXpMin(Number(e.target.value))}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">XP máximo</label>
                        <input
                            type="number"
                            min={1}
                            max={500}
                            value={xpMax}
                            onChange={e => setXpMax(Number(e.target.value))}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-200 mb-1">Cooldown (segundos)</label>
                        <input
                            type="number"
                            min={0}
                            value={cooldown}
                            onChange={e => setCooldown(Number(e.target.value))}
                            className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-purple-200 mb-1">Canal de notificaciones</label>
                    <select
                        value={canalNotif.startsWith('dm') || canalNotif === 'actual' ? canalNotif : `__channel__${canalNotif}`}
                        onChange={e => {
                            const v = e.target.value;
                            if (v.startsWith('__channel__')) setCanalNotif(v.replace('__channel__', ''));
                            else setCanalNotif(v);
                        }}
                        className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                    >
                        <option value="actual">Mismo canal donde sube de nivel</option>
                        <option value="dm">Mensaje Directo (DM)</option>
                        <optgroup label="Canal específico">
                            {channels.map((c: any) => (
                                <option key={c.id} value={`__channel__${c.id}`}>#{c.name}</option>
                            ))}
                        </optgroup>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Actual: <code>{canalNotif === 'dm' ? 'DM' : canalNotif === 'actual' ? 'Canal actual' : `#${channels.find((c: any) => c.id === canalNotif)?.name || 'desconocido'}`}</code>
                    </p>
                </div>

                <div>
                    <label className="block text-sm text-purple-200 mb-1">Mensaje al subir de nivel</label>
                    <textarea
                        value={mensaje}
                        onChange={e => setMensaje(e.target.value)}
                        rows={2}
                        className="w-full bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-4 py-2 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Variables: <code>{'{user}'}</code> (mención), <code>{'{username}'}</code>, <code>{'{nivel}'}</code>
                    </p>
                </div>
            </div>

            {/* ─── MULTIPLICADORES DE ROLES ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">🎭 Multiplicadores por Rol</h3>
                    <button
                        onClick={addMultRol}
                        className="text-sm bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1 rounded-lg text-white"
                    >
                        + Añadir
                    </button>
                </div>
                <p className="text-xs text-purple-200/70">
                    Se aplica el multiplicador más alto entre todos los roles del usuario. Multiplicador entre 0.1 y 10.
                </p>

                {multRoles.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No hay multiplicadores configurados.</p>
                )}

                {multRoles.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <select
                            value={m.rolId}
                            onChange={e => updateMultRol(i, { rolId: e.target.value })}
                            className="flex-1 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-3 py-2 text-white text-sm"
                        >
                            <option value="">Selecciona rol...</option>
                            {assignableRoles.map((r: any) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={m.multiplicador}
                            onChange={e => updateMultRol(i, { multiplicador: Number(e.target.value) })}
                            className="w-24 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <span className="text-purple-200 text-sm">x</span>
                        <button
                            onClick={() => removeMultRol(i)}
                            className="text-red-400 hover:text-red-300 px-2"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* ─── MULTIPLICADORES DE CANALES ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">💬 Multiplicadores por Canal</h3>
                    <button
                        onClick={addMultCanal}
                        className="text-sm bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1 rounded-lg text-white"
                    >
                        + Añadir
                    </button>
                </div>
                <p className="text-xs text-purple-200/70">
                    Se multiplica sobre el valor base. Ej: rol x2 + canal x1.5 = x3.
                </p>

                {multCanales.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No hay multiplicadores configurados.</p>
                )}

                {multCanales.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <select
                            value={m.canalId}
                            onChange={e => updateMultCanal(i, { canalId: e.target.value })}
                            className="flex-1 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-3 py-2 text-white text-sm"
                        >
                            <option value="">Selecciona canal...</option>
                            {channels.map((c: any) => (
                                <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={m.multiplicador}
                            onChange={e => updateMultCanal(i, { multiplicador: Number(e.target.value) })}
                            className="w-24 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <span className="text-purple-200 text-sm">x</span>
                        <button
                            onClick={() => removeMultCanal(i)}
                            className="text-red-400 hover:text-red-300 px-2"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* ─── RECOMPENSAS DE NIVEL ─── */}
            <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">🏆 Recompensas por Nivel</h3>
                    <button
                        onClick={addRecompensa}
                        className="text-sm bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1 rounded-lg text-white"
                    >
                        + Añadir
                    </button>
                </div>
                <p className="text-xs text-purple-200/70">
                    Se otorga el rol automáticamente al alcanzar ese nivel (o superior).
                </p>

                {recompensas.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No hay recompensas configuradas.</p>
                )}

                {recompensas.map((r, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <span className="text-purple-200 text-sm">Nivel</span>
                        <input
                            type="number"
                            min="1"
                            value={r.nivel}
                            onChange={e => updateRecompensa(i, { nivel: Number(e.target.value) })}
                            className="w-24 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <span className="text-purple-200 text-sm">→</span>
                        <select
                            value={r.rolId}
                            onChange={e => updateRecompensa(i, { rolId: e.target.value })}
                            className="flex-1 bg-[#0f0f13] border border-[#3b2d63] rounded-lg px-3 py-2 text-white text-sm"
                        >
                            <option value="">Selecciona rol...</option>
                            {assignableRoles.map((role: any) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => removeRecompensa(i)}
                            className="text-red-400 hover:text-red-300 px-2"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* ─── IGNORADOS ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Canales ignorados */}
                <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-3">
                    <h3 className="text-lg font-semibold text-white">🚫 Canales ignorados</h3>
                    <p className="text-xs text-purple-200/70">
                        No se otorgará XP en estos canales.
                    </p>
                    <div className="max-h-60 overflow-y-auto bg-[#0f0f13] border border-[#3b2d63] rounded-lg p-2 space-y-1">
                        {channels.map((c: any) => (
                            <label key={c.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#1b172e] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={canalesIgnorados.includes(c.id)}
                                    onChange={() => toggleItem(canalesIgnorados, setCanalesIgnorados, c.id)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-white">#{c.name}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">Seleccionados: {canalesIgnorados.length}</p>
                </div>

                {/* Roles ignorados */}
                <div className="bg-[#1b172e]/80 border border-[#3b2d63] p-6 rounded-xl space-y-3">
                    <h3 className="text-lg font-semibold text-white">🚫 Roles ignorados</h3>
                    <p className="text-xs text-purple-200/70">
                        Los usuarios con estos roles no ganarán XP.
                    </p>
                    <div className="max-h-60 overflow-y-auto bg-[#0f0f13] border border-[#3b2d63] rounded-lg p-2 space-y-1">
                        {assignableRoles.map((r: any) => (
                            <label key={r.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#1b172e] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rolesIgnorados.includes(r.id)}
                                    onChange={() => toggleItem(rolesIgnorados, setRolesIgnorados, r.id)}
                                    className="w-4 h-4"
                                />
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: `#${(r.color || 0).toString(16).padStart(6, '0')}` }}
                                />
                                <span className="text-sm text-white">{r.name}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">Seleccionados: {rolesIgnorados.length}</p>
                </div>
            </div>

            {/* ─── BOTÓN GUARDAR ─── */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-bold py-3 rounded-lg"
            >
                {saving ? 'Guardando...' : '💾 Guardar Configuración de Niveles'}
            </button>
        </div>
    );
}
