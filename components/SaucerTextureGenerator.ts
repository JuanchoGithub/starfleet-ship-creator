
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
    
    name_top_toggle: boolean;
    name_top_color: string;
    name_top_font_size: number;
    name_top_angle: number;
    name_top_curve: number;
    name_top_orientation: TextOrientation;
    name_top_distance: number;

    name_bottom_toggle: boolean;
    name_bottom_color: string;
    name_bottom_font_size: number;
    name_bottom_angle: number;
    name_bottom_curve: number;
    name_bottom_orientation: TextOrientation;
    name_bottom_distance: number;
    
    registry_top_toggle: boolean;
    registry_top_color: string;
    registry_top_font_size: number;
    registry_top_angle: number;
    registry_top_curve: number;
    registry_top_orientation: TextOrientation;
    registry_top_distance: number;

    registry_bottom_toggle: boolean;
    registry_bottom_color: string;
    registry_bottom_font_size: number;
    registry_bottom_angle: number;
    registry_bottom_curve: number;
    registry_bottom_orientation: TextOrientation;
    registry_bottom_distance: number;
    
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

function drawSymmetricalPatterns(
    mapCtx: CanvasRenderingContext2D,
    normalCtx: CanvasRenderingContext2D,
    emissiveCtx: CanvasRenderingContext2D,
    size: number,
    params: SaucerTextureGenerationParams,
    random: () => number
) {
    const { panelColorVariation, window_density, lit_window_fraction, window_bands } = params;

    // --- Base Colors ---
    const baseGray = 204;
    mapCtx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`;
    mapCtx.fillRect(0, 0, size, size);

    normalCtx.fillStyle = 'rgb(128, 128, 255)';
    normalCtx.fillRect(0, 0, size, size);

    emissiveCtx.fillStyle = 'black';
    emissiveCtx.fillRect(0, 0, size, size);

    const center = { x: size / 2, y: size / 2 };

    // --- Draw "Aztec" Panel Pattern ---
    const radialSegments = Math.floor(random() * 24) + 32;
    const ringCount = Math.floor(random() * 8) + 12;
    const ringSpacings: number[] = [];
    const ringIsWindowBand = new Array(ringCount).fill(false);

    for (let i = 0; i < ringCount; i++) ringSpacings.push(random() * 0.5 + 0.5);
    const totalSpacing = ringSpacings.reduce((a, b) => a + b, 0);
    const normalizedSpacings = ringSpacings.map(s => s / totalSpacing);

    const bandCandidates: number[] = Array.from({ length: ringCount - 2 }, (_, i) => i + 1);
    for (let i = 0; i < window_bands && bandCandidates.length > 0; i++) {
        const randIndex = Math.floor(random() * bandCandidates.length);
        const bandIndex = bandCandidates.splice(randIndex, 1)[0];
        ringIsWindowBand[bandIndex] = true;
    }

    let currentRadius = size * 0.05;
    for (let i = 0; i < ringCount; i++) {
        const ringWidth = normalizedSpacings[i] * (size / 2 - size * 0.05);
        const nextRadius = currentRadius + ringWidth;
        for (let j = 0; j < radialSegments; j++) {
            if (random() > 0.15 || i < 2) {
                const grayVariation = Math.floor((random() - 0.5) * 2 * panelColorVariation * 255);
                mapCtx.fillStyle = `rgb(${Math.max(0, Math.min(255, baseGray + grayVariation))}, ${Math.max(0, Math.min(255, baseGray + grayVariation))}, ${Math.max(0, Math.min(255, baseGray + grayVariation))})`;
                mapCtx.beginPath();
                mapCtx.arc(center.x, center.y, nextRadius, (j / radialSegments) * 2 * Math.PI, ((j + 1) / radialSegments) * 2 * Math.PI);
                mapCtx.arc(center.x, center.y, currentRadius, ((j + 1) / radialSegments) * 2 * Math.PI, (j / radialSegments) * 2 * Math.PI, true);
                mapCtx.closePath();
                mapCtx.fill();
            }
        }
        currentRadius = nextRadius;
    }

    if (params.bridge_registry_toggle && params.registry) {
        mapCtx.fillStyle = params.registry_top_color;
        mapCtx.font = `bold ${params.bridge_registry_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText(params.registry.toUpperCase(), center.x, center.y);
    }

    const lineGray = 150;
    const normalGrooveStrength = 30;
    mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
    mapCtx.lineWidth = 2;
    normalCtx.lineWidth = 2;

    currentRadius = size * 0.05;
    for (let i = 0; i < ringCount; i++) {
        currentRadius += normalizedSpacings[i] * (size / 2 - size * 0.05);
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
        }
    }

    currentRadius = size * 0.05;
    for (let i = 0; i < ringCount; i++) {
        const ringWidth = normalizedSpacings[i] * (size / 2 - size * 0.05);
        if (ringIsWindowBand[i]) {
            const radius = currentRadius + ringWidth / 2;
            const circumference = 2 * Math.PI * radius;
            const numWindows = Math.floor(circumference / 20);
            for (let j = 0; j < numWindows; j++) {
                if (random() > window_density) continue;
                const angle = (j / numWindows) * 2 * Math.PI;
                const x = center.x + Math.cos(angle) * radius;
                const y = center.y + Math.sin(angle) * radius;
                const w = 12 + (random() * 2 - 1) * 3;
                const h = 16 + (random() * 2 - 1) * 3;
                mapCtx.save();
                mapCtx.translate(x, y);
                mapCtx.rotate(angle + Math.PI / 2);
                mapCtx.fillStyle = '#222222';
                mapCtx.fillRect(-w / 2, -h / 2, w, h);
                mapCtx.restore();
                if (random() < lit_window_fraction) {
                    emissiveCtx.save();
                    emissiveCtx.translate(x, y);
                    emissiveCtx.rotate(angle + Math.PI / 2);
                    emissiveCtx.fillStyle = random() > 0.5 ? params.window_color1 : params.window_color2;
                    emissiveCtx.fillRect(-w / 2, -h / 2, w, h);
                    emissiveCtx.restore();
                }
            }
        }
        currentRadius += ringWidth;
    }

    const hatchCount = Math.floor(random() * 8) + 8;
    for (let i = 0; i < hatchCount; i++) {
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
    }
}


export function generateSaucerTextures(params: SaucerTextureGenerationParams) {
    const size = 2048;
    const { 
        seed, shipName, registry, 
        name_top_toggle, name_top_color, name_top_font_size, name_top_angle, name_top_curve, name_top_orientation, name_top_distance,
        name_bottom_toggle, name_bottom_color, name_bottom_font_size, name_bottom_angle, name_bottom_curve, name_bottom_orientation, name_bottom_distance,
        registry_top_toggle, registry_top_color, registry_top_font_size, registry_top_angle, registry_top_curve, registry_top_orientation, registry_top_distance,
        registry_bottom_toggle, registry_bottom_color, registry_bottom_font_size, registry_bottom_angle, registry_bottom_curve, registry_bottom_orientation, registry_bottom_distance
    } = params;
    const random = createPRNG(seed);

    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = size;
    patternCanvas.height = size;
    const patternCtx = patternCanvas.getContext('2d')!;

    const normalPatternCanvas = document.createElement('canvas');
    normalPatternCanvas.width = size;
    normalPatternCanvas.height = size;
    const normalPatternCtx = normalPatternCanvas.getContext('2d')!;

    const emissivePatternCanvas = document.createElement('canvas');
    emissivePatternCanvas.width = size;
    emissivePatternCanvas.height = size;
    const emissivePatternCtx = emissivePatternCanvas.getContext('2d')!;

    drawSymmetricalPatterns(patternCtx, normalPatternCtx, emissivePatternCtx, size, params, random);

    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = size;
    mapCanvas.height = size;
    const mapCtx = mapCanvas.getContext('2d')!;
    // Draw pattern onto top half (y: 0 to size/2)
    mapCtx.drawImage(patternCanvas, 0, 0, size, size, 0, 0, size, size / 2);
    // Draw pattern onto bottom half (y: size/2 to size)
    mapCtx.drawImage(patternCanvas, 0, 0, size, size, 0, size / 2, size, size / 2);

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = size;
    normalCanvas.height = size;
    const normalCtx = normalCanvas.getContext('2d')!;
    normalCtx.drawImage(normalPatternCanvas, 0, 0, size, size, 0, 0, size, size / 2);
    normalCtx.drawImage(normalPatternCanvas, 0, 0, size, size, 0, size / 2, size, size / 2);

    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = size;
    emissiveCanvas.height = size;
    const emissiveCtx = emissiveCanvas.getContext('2d')!;
    emissiveCtx.drawImage(emissivePatternCanvas, 0, 0, size, size, 0, 0, size, size / 2);
    emissiveCtx.drawImage(emissivePatternCanvas, 0, 0, size, size, 0, size / 2, size, size / 2);

    // --- Draw Top Text --- (Draws on TOP half of canvas, y: 0 to size/2)
    mapCtx.save();
    mapCtx.scale(1, 0.5); // Squash coordinate system into top half
    if (registry_top_toggle && registry) {
        mapCtx.fillStyle = registry_top_color;
        mapCtx.font = `bold ${registry_top_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        drawText(mapCtx, registry.toUpperCase(), size / 2, size / 2, size * registry_top_distance, registry_top_angle, registry_top_curve, registry_top_orientation);
    }
    if (name_top_toggle && shipName) {
        mapCtx.fillStyle = name_top_color;
        mapCtx.font = `bold ${name_top_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        drawText(mapCtx, shipName.toUpperCase().replace('*', ''), size / 2, size / 2, size * name_top_distance, name_top_angle, name_top_curve, name_top_orientation);
    }
    mapCtx.restore();

    // --- Draw Bottom Text --- (Draws on BOTTOM half of canvas, y: size/2 to size)
    mapCtx.save();
    mapCtx.translate(0, size / 2); // Move origin to the start of the bottom half
    mapCtx.scale(1, 0.5); // Squash coordinate system into bottom half
    if (registry_bottom_toggle && registry) {
        mapCtx.fillStyle = registry_bottom_color;
        mapCtx.font = `bold ${registry_bottom_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        drawText(mapCtx, registry.toUpperCase(), size / 2, size / 2, size * registry_bottom_distance, registry_bottom_angle, registry_bottom_curve, registry_bottom_orientation);
    }
    if (name_bottom_toggle && shipName) {
        mapCtx.fillStyle = name_bottom_color;
        mapCtx.font = `bold ${name_bottom_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        drawText(mapCtx, shipName.toUpperCase().replace('*', ''), size / 2, size / 2, size * name_bottom_distance, name_bottom_angle, name_bottom_curve, name_bottom_orientation);
    }
    mapCtx.restore();

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
