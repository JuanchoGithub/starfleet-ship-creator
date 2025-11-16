import * as THREE from 'three';
import { TextOrientation } from '../types';

// A simple pseudorandom number generator for deterministic results based on a seed
function createPRNG(seed: number) {
    let s = seed;
    return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
}

interface SaucerTextureGenerationParams {
    seed: number;
    panelColorVariation: number;
    window_density: number;
    lit_window_fraction: number;
    window_color1: string;
    window_color2: string;
    window_bands: number;
    shipName: string;
    registry: string;
    
    name_toggle: boolean;
    name_color: string;
    name_font_size: number;
    name_angle: number;
    name_curve: number;
    name_orientation: TextOrientation;
    name_distance: number;
    
    registry_toggle: boolean;
    registry_color: string;
    registry_font_size: number;
    registry_angle: number;
    registry_curve: number;
    registry_orientation: TextOrientation;
    registry_distance: number;
    
    bridge_registry_toggle: boolean;
    bridge_registry_font_size: number;
}


/**
 * Draws text on a canvas, with options for curving the text along an arc and rotating characters.
 * @param ctx The 2D rendering context of the canvas.
 * @param text The string to draw.
 * @param centerX The x-coordinate of the canvas center.
 * @param centerY The y-coordinate of the canvas center.
 * @param radius The radial distance from the center to the text's baseline.
 * @param angleDegrees The angle in degrees for the center of the text block.
 * @param curve A value controlling the curvature. 0 for straight text.
 * @param orientation Controls how individual characters are rotated.
 */
function drawText(ctx: CanvasRenderingContext2D, text: string, centerX: number, centerY: number, radius: number, angleDegrees: number, curve: number, orientation: TextOrientation) {
    ctx.save();
    
    const angleRad = angleDegrees * Math.PI / 180;

    // --- Straight Text ---
    if (curve < 0.01) {
        const textWidth = ctx.measureText(text).width;
        ctx.translate(centerX + Math.cos(angleRad) * radius, centerY + Math.sin(angleRad) * radius);
        ctx.rotate(angleRad + Math.PI / 2);
        ctx.fillText(text, -textWidth / 2, 0);
        ctx.restore();
        return;
    }

    // --- Curved Text ---
    const textToRender = orientation === 'Outward' ? text.split('').reverse().join('') : text;
    const textWidth = ctx.measureText(textToRender).width;

    const arcRadius = (ctx.canvas.width * 2.0) / curve;
    const arcCenterX = centerX - Math.cos(angleRad) * (arcRadius - radius);
    const arcCenterY = centerY - Math.sin(angleRad) * (arcRadius - radius);

    let accumulatedWidth = 0;
    for (let i = 0; i < textToRender.length; i++) {
        const char = textToRender[i];
        const charWidth = ctx.measureText(char).width;
        
        const xOffset = accumulatedWidth + charWidth / 2;
        const angleOffset = (xOffset - textWidth / 2) / arcRadius;
        const finalAngle = angleRad + angleOffset;

        const charX = arcCenterX + Math.cos(finalAngle) * arcRadius;
        const charY = arcCenterY + Math.sin(finalAngle) * arcRadius;
        
        if (orientation === 'Upright') {
            ctx.fillText(char, charX, charY);
        } else {
            ctx.save();
            ctx.translate(charX, charY);
            
            let rotationAngle = finalAngle;
            if (orientation === 'Inward') {
                rotationAngle += Math.PI / 2;
            } else { // 'Outward'
                rotationAngle -= Math.PI / 2;
            }
            ctx.rotate(rotationAngle);
            
            ctx.fillText(char, 0, 0);
            
            ctx.restore();
        }
        
        accumulatedWidth += charWidth;
    }

    ctx.restore();
}


export function generateSaucerTextures(params: SaucerTextureGenerationParams) {
    const size = 2048; // Higher resolution for more detail
    const { 
        seed, panelColorVariation, window_density, lit_window_fraction, window_bands,
        shipName, registry, 
        name_toggle, name_color, name_font_size, name_angle, name_curve, name_orientation, name_distance,
        registry_toggle, registry_color, registry_font_size, registry_angle, registry_curve, registry_orientation, registry_distance,
        bridge_registry_toggle, bridge_registry_font_size
    } = params;
    const random = createPRNG(seed);

    // --- Create Canvases ---
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = size;
    mapCanvas.height = size;
    const mapCtx = mapCanvas.getContext('2d')!;

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = size;
    normalCanvas.height = size;
    const normalCtx = normalCanvas.getContext('2d')!;

    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = size;
    emissiveCanvas.height = size;
    const emissiveCtx = emissiveCanvas.getContext('2d')!;

    // --- Base Colors ---
    const baseGray = 204; // #cccccc
    mapCtx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`;
    mapCtx.fillRect(0, 0, size, size);

    normalCtx.fillStyle = 'rgb(128, 128, 255)'; // Neutral normal
    normalCtx.fillRect(0, 0, size, size);

    emissiveCtx.fillStyle = 'black';
    emissiveCtx.fillRect(0, 0, size, size);

    const center = { x: size / 2, y: size / 2 };

    // --- Draw "Aztec" Panel Pattern ---
    const radialSegments = Math.floor(random() * 24) + 32; // 32 to 56 radial segments
    const ringCount = Math.floor(random() * 8) + 12; // 12 to 20 concentric rings
    const ringSpacings: number[] = [];
    const ringIsWindowBand = new Array(ringCount).fill(false);

    for (let i = 0; i < ringCount; i++) {
        ringSpacings.push(random() * 0.5 + 0.5);
    }
    const totalSpacing = ringSpacings.reduce((a, b) => a + b, 0);
    const normalizedSpacings = ringSpacings.map(s => s / totalSpacing);

    // --- Designate Window Bands ---
    const bandCandidates: number[] = [];
    for (let i = 1; i < ringCount - 1; i++) { // Avoid only the innermost and outermost rings
        bandCandidates.push(i);
    }
    for (let i = 0; i < window_bands; i++) {
        if (bandCandidates.length > 0) {
            const randIndex = Math.floor(random() * bandCandidates.length);
            const bandIndex = bandCandidates.splice(randIndex, 1)[0];
            ringIsWindowBand[bandIndex] = true;
        }
    }


    let currentRadius = size * 0.05; // Start with a central circle
    for (let i = 0; i < ringCount; i++) {
        const ringWidth = normalizedSpacings[i] * (size / 2 - size * 0.05);
        const nextRadius = currentRadius + ringWidth;

        for (let j = 0; j < radialSegments; j++) {
            const angleStart = (j / radialSegments) * 2 * Math.PI;
            const angleEnd = ((j + 1) / radialSegments) * 2 * Math.PI;

            if (random() > 0.15 || (i < 2)) {
                const grayVariation = Math.floor((random() - 0.5) * 2 * panelColorVariation * 255);
                const panelGray = Math.max(0, Math.min(255, baseGray + grayVariation));
                
                mapCtx.fillStyle = `rgb(${panelGray}, ${panelGray}, ${panelGray})`;
                mapCtx.beginPath();
                mapCtx.arc(center.x, center.y, nextRadius, angleStart, angleEnd);
                mapCtx.arc(center.x, center.y, currentRadius, angleEnd, angleStart, true);
                mapCtx.closePath();
                mapCtx.fill();
            }
        }
        currentRadius = nextRadius;
    }

    // --- Draw Bridge Registry (in the center, where bridge UVs will map) ---
    if (bridge_registry_toggle && registry) {
        mapCtx.fillStyle = registry_color;
        mapCtx.font = `bold ${bridge_registry_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText(registry.toUpperCase(), center.x, center.y);
    }


    // --- Draw Panel Lines ---
    const lineGray = 150;
    const normalGrooveStrength = 30;
    mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
    mapCtx.lineWidth = 2;
    normalCtx.lineWidth = 2;

    currentRadius = size * 0.05;
    for (let i = 0; i < ringCount; i++) {
        const ringWidth = normalizedSpacings[i] * (size / 2 - size * 0.05);
        currentRadius += ringWidth;
        if (random() > 0.2) {
            mapCtx.beginPath();
            mapCtx.arc(center.x, center.y, currentRadius, 0, 2 * Math.PI);
            mapCtx.stroke();
            
            normalCtx.strokeStyle = `rgb(128, 128, ${255 - normalGrooveStrength})`;
            normalCtx.beginPath();
            normalCtx.arc(center.x, center.y, currentRadius, 0, 2 * Math.PI);
            normalCtx.stroke();
        }
    }
    
    for (let j = 0; j < radialSegments; j++) {
        if (random() > 0.3) {
            const angle = (j / radialSegments) * 2 * Math.PI;
            mapCtx.beginPath();
            mapCtx.moveTo(center.x + Math.cos(angle) * size * 0.05, center.y + Math.sin(angle) * size * 0.05);
            mapCtx.lineTo(center.x + Math.cos(angle) * (size / 2), center.y + Math.sin(angle) * (size / 2));
            mapCtx.stroke();
            
            const normalAngle = angle + Math.PI / 2;
            const highlight = `rgb(${128 - Math.cos(normalAngle) * normalGrooveStrength}, ${128 - Math.sin(normalAngle) * normalGrooveStrength}, 255)`;
            const shadow = `rgb(${128 + Math.cos(normalAngle) * normalGrooveStrength}, ${128 + Math.sin(normalAngle) * normalGrooveStrength}, 255)`;
            
            const grad = normalCtx.createLinearGradient(
                center.x - Math.cos(angle) * 2, center.y - Math.sin(angle) * 2,
                center.x + Math.cos(angle) * 2, center.y + Math.sin(angle) * 2
            );
            grad.addColorStop(0, highlight);
            grad.addColorStop(1, shadow);

            normalCtx.strokeStyle = grad;
            normalCtx.beginPath();
            normalCtx.moveTo(center.x + Math.cos(angle) * size * 0.05, center.y + Math.sin(angle) * size * 0.05);
            normalCtx.lineTo(center.x + Math.cos(angle) * (size / 2), center.y + Math.sin(angle) * (size / 2));
            normalCtx.stroke();
        }
    }

    // --- Draw Windows in Bands ---
    currentRadius = size * 0.05;
    for (let i = 0; i < ringCount; i++) {
        const ringWidth = normalizedSpacings[i] * (size / 2 - size * 0.05);
        
        if (ringIsWindowBand[i]) {
            const radius = currentRadius + ringWidth / 2;
            const circumference = 2 * Math.PI * radius;

            const baseWindowWidth = 12;
            const baseWindowSpacing = 8;
            const numWindows = Math.floor(circumference / (baseWindowWidth + baseWindowSpacing));
            const baseWindowHeight = 16;
            
            for (let j = 0; j < numWindows; j++) {
                // Use window_density to control the presence of a physical window (creating gaps).
                if (random() > window_density) {
                    continue;
                }

                const angle = (j / numWindows) * 2 * Math.PI;
                const x = center.x + Math.cos(angle) * radius;
                const y = center.y + Math.sin(angle) * radius;
                
                // Randomize window dimensions for a more organic look.
                const widthVariation = baseWindowWidth * 0.25 * (random() * 2 - 1); // +/- 25%
                const heightVariation = baseWindowHeight * 0.2 * (random() * 2 - 1); // +/- 20%
                const windowWidth = baseWindowWidth + widthVariation;
                const windowHeight = baseWindowHeight + heightVariation;

                mapCtx.save();
                mapCtx.translate(x, y);
                mapCtx.rotate(angle + Math.PI / 2); // Align with radial lines
                mapCtx.fillStyle = '#222222'; // Dark unlit window
                mapCtx.fillRect(-windowWidth / 2, -windowHeight / 2, windowWidth, windowHeight);
                mapCtx.restore();

                // Use the lit_window_fraction to determine if this existing window is lit.
                if (random() < lit_window_fraction) {
                    emissiveCtx.save();
                    emissiveCtx.translate(x, y);
                    emissiveCtx.rotate(angle + Math.PI / 2); // Align with radial lines
                    emissiveCtx.fillStyle = random() > 0.5 ? params.window_color1 : params.window_color2;
                    emissiveCtx.fillRect(-windowWidth / 2, -windowHeight / 2, windowWidth, windowHeight);
                    emissiveCtx.restore();
                }
            }
        }
        currentRadius += ringWidth;
    }

    // --- Draw Ship Name & Registry ---
    if (registry_toggle && registry) {
        mapCtx.fillStyle = registry_color;
        mapCtx.font = `bold ${registry_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        drawText(mapCtx, registry.toUpperCase(), center.x, center.y, size * registry_distance, registry_angle, registry_curve, registry_orientation);
    }
    if (name_toggle && shipName) {
        mapCtx.fillStyle = name_color;
        mapCtx.font = `bold ${name_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        drawText(mapCtx, shipName.toUpperCase().replace('*', ''), center.x, center.y, size * name_distance, name_angle, name_curve, name_orientation);
    }

    // --- Escape Pod Hatches ---
    const hatchCount = Math.floor(random() * 8) + 8;
    for(let i=0; i < hatchCount; i++) {
        const r = size * (random() * 0.3 + 0.15);
        const a = random() * Math.PI * 2;
        const x = center.x + Math.cos(a) * r;
        const y = center.y + Math.sin(a) * r;
        const hatchRadius = random() * 10 + 15;

        mapCtx.fillStyle = `rgb(${baseGray - 20}, ${baseGray - 20}, ${baseGray - 20})`;
        mapCtx.beginPath();
        mapCtx.arc(x, y, hatchRadius, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
        mapCtx.lineWidth = 2;
        mapCtx.stroke();

        // Add a slight bevel to the normal map
        const normalBevelStrength = 15;
        const grad = normalCtx.createRadialGradient(x, y, hatchRadius - 2, x, y, hatchRadius + 2);
        grad.addColorStop(0, `rgb(128, 128, ${255 - normalBevelStrength})`);
        grad.addColorStop(1, `rgb(128, 128, 255)`);
        normalCtx.fillStyle = grad;
        normalCtx.beginPath();
        normalCtx.arc(x, y, hatchRadius + 2, 0, Math.PI * 2);
        normalCtx.fill();
    }


    // --- Create Three.js Textures ---
    const map = new THREE.CanvasTexture(mapCanvas);
    const normalMap = new THREE.CanvasTexture(normalCanvas);
    const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
    
    map.wrapS = THREE.ClampToEdgeWrapping;
    map.wrapT = THREE.ClampToEdgeWrapping;
    normalMap.wrapS = THREE.ClampToEdgeWrapping;
    normalMap.wrapT = THREE.ClampToEdgeWrapping;
    emissiveMap.wrapS = THREE.ClampToEdgeWrapping;
    emissiveMap.wrapT = THREE.ClampToEdgeWrapping;

    return { map, normalMap, emissiveMap };
}