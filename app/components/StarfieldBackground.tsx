'use client';

import { useMemo } from 'react';

export default function StarfieldBackground() {
    // Generamos las estrellas UNA VEZ con useMemo
    const stars = useMemo(() => {
        const result: { id: number; x: number; y: number; size: number; delay: number; duration: number }[] = [];
        for (let i = 0; i < 120; i++) {
            result.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2.2 + 0.6,
                delay: Math.random() * 4,
                duration: 2 + Math.random() * 3,
            });
        }
        return result;
    }, []);

    return (
        <div
            aria-hidden
            className="fixed inset-0 -z-10 overflow-hidden"
            style={{
                background: 'radial-gradient(ellipse at top, #1a0f3d 0%, #0a0618 50%, #050208 100%)',
            }}
        >
            {/* Nebulosas (glow morado/índigo animado) */}
            <div
                className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-30"
                style={{
                    top: '-10%',
                    left: '-10%',
                    background: 'radial-gradient(circle, rgba(155, 89, 182, 0.5), transparent 70%)',
                    animation: 'float-slow 18s ease-in-out infinite',
                }}
            />
            <div
                className="absolute w-[700px] h-[700px] rounded-full blur-[160px] opacity-25"
                style={{
                    bottom: '-20%',
                    right: '-15%',
                    background: 'radial-gradient(circle, rgba(88, 101, 242, 0.5), transparent 70%)',
                    animation: 'float-slow 24s ease-in-out infinite reverse',
                }}
            />
            <div
                className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-20"
                style={{
                    top: '40%',
                    right: '20%',
                    background: 'radial-gradient(circle, rgba(192, 132, 252, 0.4), transparent 70%)',
                    animation: 'glow-pulse 8s ease-in-out infinite',
                }}
            />

            {/* Estrellas titilantes */}
            {stars.map(s => (
                <div
                    key={s.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                        animation: `twinkle ${s.duration}s ease-in-out infinite`,
                        animationDelay: `${s.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
