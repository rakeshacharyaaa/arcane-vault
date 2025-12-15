import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useStore } from '@/lib/store';
import { useLocation } from 'wouter';
import { Sprite, SpriteMaterial, CanvasTexture, AdditiveBlending, Group, FogExp2 } from 'three';

export default function AstralGraph() {
    const { pages } = useStore();
    const [, setLocation] = useLocation();
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

    // 1. Handle Layout / Centering
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setDims({ width, height });
                }
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // 2. Handle Atmosphere & Camera
    useEffect(() => {
        if (fgRef.current) {
            // Unzoom
            fgRef.current.cameraPosition({ z: 400 });

            // Fog for depth
            const scene = fgRef.current.scene();
            scene.fog = new FogExp2(0x000000, 0.002);
            scene.background = null; // Ensure transparent for CSS background
        }
    }, [dims]); // Re-run if dims change significantly? Or just once. Usually once is fine.

    // 3. Data Preparation
    const graphData = useMemo(() => {
        const nodes = pages.map(p => ({
            id: p.id,
            name: p.title,
            group: !p.parentId ? 'root' : 'child',
            size: !p.parentId ? 6 : 3 // Reduced from 30/15 -> 6/3 for cleaner look
        }));

        const links = pages
            .filter(p => p.parentId)
            .map(p => ({
                source: p.parentId!,
                target: p.id
            }))
            .filter(l => nodes.find(n => n.id === l.source));

        return { nodes, links };
    }, [pages]);

    // 4. Texture Utilities
    const getGlowTexture = useCallback(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.4, 'rgba(16, 185, 129, 0.8)'); // Emerald
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 32, 32);
        }
        return new CanvasTexture(canvas);
    }, []);

    const glowTexture = useMemo(() => getGlowTexture(), [getGlowTexture]);

    const createTextTexture = useCallback((text: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return new CanvasTexture(canvas);

        const fontSize = 48;
        ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
        const textWidth = ctx.measureText(text).width;

        canvas.width = textWidth + 20;
        canvas.height = fontSize + 20;

        ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0,0,0,1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        return new CanvasTexture(canvas);
    }, []);

    // 5. Node Rendering
    const createNodeObject = useCallback((node: any) => {
        const group = new Group();

        // Glow Sprite
        const material = new SpriteMaterial({
            map: glowTexture,
            color: node.group === 'root' ? 0xffea00 : 0x10b981,
            transparent: true,
            blending: AdditiveBlending,
        });
        const sprite = new Sprite(material);
        const scale = node.size;
        sprite.scale.set(scale, scale, 1);
        group.add(sprite);

        // Text Label
        if (node.name) {
            const textMap = createTextTexture(node.name);
            const textMaterial = new SpriteMaterial({ map: textMap, transparent: true, depthWrite: false });
            const textSprite = new Sprite(textMaterial);

            const aspect = textMap.image.width / textMap.image.height;
            const textHeight = 4; // Reduced text size relative to node (Node is 6/3)
            textSprite.scale.set(textHeight * aspect, textHeight, 1);
            textSprite.position.set(0, -node.size / 1.5 - 3, 0);

            group.add(textSprite);
        }

        return group;
    }, [glowTexture, createTextTexture]);

    const handleNodeClick = useCallback((node: any) => {
        setLocation(`/page/${node.id}`);
    }, [setLocation]);

    return (
        <div ref={containerRef} className="w-full h-full bg-black relative overflow-hidden">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
            <div className="absolute inset-0 z-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, #022c22 0%, #000000 70%)'
            }}></div>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-black/50 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md">
                            <span className="text-2xl pt-1">🔮</span>
                        </div>
                        <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full -z-10 animate-pulse" />
                    </div>
                    {/* Title */}
                    <div>
                        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
                            Astral Constellation
                        </h1>
                        <p className="text-xs text-emerald-400/60 font-medium tracking-wider uppercase">Navigate your knowledge cosmos</p>
                    </div>
                </div>
            </div>

            {dims.width > 0 && (
                <ForceGraph3D
                    ref={fgRef}
                    width={dims.width}
                    height={dims.height}
                    graphData={graphData}
                    nodeLabel="name"
                    backgroundColor="rgba(0,0,0,0)"
                    nodeThreeObject={createNodeObject}
                    showNavInfo={false}
                    linkColor={() => "rgba(16, 185, 129, 0.2)"}
                    linkWidth={1}
                    linkDirectionalParticles={1}
                    linkDirectionalParticleSpeed={0.005}
                    linkDirectionalParticleWidth={2}
                    linkDirectionalParticleColor={() => "rgba(16, 185, 129, 0.8)"}
                    onNodeClick={handleNodeClick}
                />
            )}
        </div>
    );
}
