import * as THREE from 'three';

// A simple pseudorandom number generator for deterministic results based on a seed
function createPRNG(seed: number) {
    let s = seed;
    return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
}

// FIX: Added missing properties to the interface to align with the parameters passed from App.tsx.
interface BridgeTextureGenerationParams {
    seed: number;
    panel_toggle: boolean;
    panelColorVariation: number;
    // FIX: Added the missing 'light_density' property to match the parameters passed from App.tsx.
    light_density: number;
    light_color1: string;
    light_color2: string;
    rotation_offset: number;
    window_bands_toggle: boolean;
    window_bands_count: number;
    window_density: number;
    lit_window_fraction: number;
    window_color1: string;
    window_color2: string;
}

export function generateBridgeTextures(params: BridgeTextureGenerationParams) {
    const size = 1024;
    const { 
        seed, panel_toggle, panelColorVariation, light_density, light_color1, light_color2, rotation_offset,
        window_bands_toggle, window_bands_count, window_density, lit_window_fraction,
        window_color1, window_color2
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

    // --- Apply Rotation ---
    const rotationRad = (rotation_offset || 0) * Math.PI / 180;
    const allContexts = [mapCtx, normalCtx, emissiveCtx];
    allContexts.forEach(ctx => {
        ctx.translate(size / 2, size / 2);
        ctx.rotate(rotationRad);
        ctx.translate(-size / 2, -size / 2);
    });

    // --- Base Colors ---
    const baseGray = 204;
    mapCtx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`;
    mapCtx.fillRect(0, 0, size, size);

    normalCtx.fillStyle = 'rgb(128, 128, 255)'; // Neutral normal
    normalCtx.fillRect(0, 0, size, size);

    emissiveCtx.fillStyle = 'black';
    emissiveCtx.fillRect(0, 0, size, size);

    const center = { x: size / 2, y: size / 2 };
    const lineGray = 150;
    const normalGrooveStrength = 30;

    if (panel_toggle) {
        // --- Draw Plating ---
        const radialSegments = Math.floor(random() * 8) + 16;
        const ringCount = Math.floor(random() * 4) + 4;
        const centralDomeRadius = size * (0.1 + random() * 0.1);
        
        let currentRadius = centralDomeRadius;
        for (let i = 0; i < ringCount; i++) {
            const ringWidth = (size / 2 - currentRadius) / (ringCount - i);
            const nextRadius = currentRadius + ringWidth * (0.8 + random() * 0.4);
            for (let j = 0; j < radialSegments; j++) {
                if (random() > 0.1) {
                    const grayVariation = Math.floor((random() - 0.5) * 2 * panelColorVariation * 255);
                    const panelGray = Math.max(0, Math.min(255, baseGray + grayVariation));
                    mapCtx.fillStyle = `rgb(${panelGray}, ${panelGray}, ${panelGray})`;
                    mapCtx.beginPath();
                    mapCtx.arc(center.x, center.y, nextRadius, (j / radialSegments) * 2 * Math.PI, ((j + 1) / radialSegments) * 2 * Math.PI);
                    mapCtx.arc(center.x, center.y, currentRadius, ((j + 1) / radialSegments) * 2 * Math.PI, (j / radialSegments) * 2 * Math.PI, true);
                    mapCtx.closePath();
                    mapCtx.fill();
                }
            }
            currentRadius = nextRadius;
        }

        // --- Draw Panel Lines ---
        mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
        mapCtx.lineWidth = 2;
        normalCtx.lineWidth = 2;
        
        currentRadius = centralDomeRadius;
        for (let i = 0; i < ringCount; i++) {
            const ringWidth = (size / 2 - currentRadius) / (ringCount - i);
            currentRadius += ringWidth * (0.8 + random() * 0.4);
            if (random() > 0.2) {
                mapCtx.beginPath(); mapCtx.arc(center.x, center.y, currentRadius, 0, 2 * Math.PI); mapCtx.stroke();
            }
        }
        for (let j = 0; j < radialSegments; j++) {
             if (random() > 0.3) {
                const angle = (j / radialSegments) * 2 * Math.PI;
                mapCtx.beginPath();
                mapCtx.moveTo(center.x + Math.cos(angle) * centralDomeRadius, center.y + Math.sin(angle) * centralDomeRadius);
                mapCtx.lineTo(center.x + Math.cos(angle) * (size / 2), center.y + Math.sin(angle) * (size / 2));
                mapCtx.stroke();
            }
        }
    } else {
        // Draw a few major radial lines for definition if panels are off
        mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
        mapCtx.lineWidth = 2;
        for(let i=0; i<4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            mapCtx.beginPath();
            mapCtx.moveTo(center.x, center.y);
            mapCtx.lineTo(center.x + Math.cos(angle) * size / 2, center.y + Math.sin(angle) * size / 2);
            mapCtx.stroke();
        }
    }

    // --- Draw Window Bands ---
    if (window_bands_toggle && window_bands_count > 0) {
        const bandStartRadius = size * 0.25;
        const bandableArea = size/2 - bandStartRadius;
        for(let i=0; i < window_bands_count; i++) {
            const radius = bandStartRadius + bandableArea * (i + 0.5) / window_bands_count;
            const circumference = 2 * Math.PI * radius;
            const numWindows = Math.floor(circumference / 30 * (random() * 0.5 + 0.5));
            for (let j = 0; j < numWindows; j++) {
                if (random() > window_density) continue;

                const angle = (j / numWindows) * 2 * Math.PI + (random()-0.5) * 0.01;
                const x = center.x + Math.cos(angle) * radius;
                const y = center.y + Math.sin(angle) * radius;
                const w = 8 + (random() * 2 - 1) * 2;
                const h = 10 + (random() * 2 - 1) * 2;
                
                mapCtx.save();
                mapCtx.translate(x, y);
                mapCtx.rotate(angle + Math.PI / 2);
                mapCtx.fillStyle = '#222222';
                mapCtx.fillRect(-w/2, -h/2, w, h);
                mapCtx.restore();

                if (random() < lit_window_fraction) {
                    emissiveCtx.save();
                    emissiveCtx.translate(x, y);
                    emissiveCtx.rotate(angle + Math.PI / 2);
                    emissiveCtx.fillStyle = random() > 0.5 ? window_color1 : window_color2;
                    emissiveCtx.fillRect(-w/2, -h/2, w, h);
                    emissiveCtx.restore();
                }
            }
        }
    }
    
    // --- Draw Hatches (with more variance) ---
    const hatchCount = Math.floor(random() * 5) + 3;
    for(let i=0; i < hatchCount; i++) {
        const angle = random() * Math.PI * 2;
        const radius = size * (0.2 + random() * 0.25);
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        
        const hatchType = random();
        mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
        mapCtx.lineWidth = 2;
        if (hatchType < 0.5) { // Round hatch
            const hatchRadius = random() * 10 + 15;
            mapCtx.fillStyle = `rgb(${baseGray - 30}, ${baseGray-30}, ${baseGray-30})`;
            mapCtx.beginPath(); mapCtx.arc(x, y, hatchRadius, 0, Math.PI*2); mapCtx.fill(); mapCtx.stroke();
        } else { // Square hatch
            const hatchSize = random() * 20 + 20;
            mapCtx.save();
            mapCtx.translate(x, y);
            mapCtx.rotate(angle);
            mapCtx.fillStyle = `rgb(${baseGray - 30}, ${baseGray-30}, ${baseGray-30})`;
            mapCtx.fillRect(-hatchSize/2, -hatchSize/2, hatchSize, hatchSize);
            mapCtx.strokeRect(-hatchSize/2, -hatchSize/2, hatchSize, hatchSize);
            mapCtx.restore();
        }
    }
    
    // --- Draw Indicator Lights (decoupled from hatches) ---
    const numLights = light_density * 200 * (random() * 0.5 + 0.5); // Base number on density, with some variance
    for(let i=0; i < numLights; i++) {
        const angle = random() * Math.PI * 2;
        const radius = size * (0.15 + random() * 0.3); // Place them anywhere in the mid-to-outer rings
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        
        emissiveCtx.fillStyle = random() > 0.5 ? light_color1 : light_color2;

        const lightType = random();
        if (lightType < 0.6) { // Small square light
            const lightSize = random() * 2 + 2;
            emissiveCtx.fillRect(x - lightSize/2, y - lightSize/2, lightSize, lightSize);
        } else if (lightType < 0.9) { // Rectangular light
            const lw = random() * 8 + 4;
            const lh = random() * 3 + 2;
            emissiveCtx.save();
            emissiveCtx.translate(x, y);
            emissiveCtx.rotate(angle + Math.PI/2 + (random() - 0.5) * 0.2);
            emissiveCtx.fillRect(-lw/2, -lh/2, lw, lh);
            emissiveCtx.restore();
        } else { // Small cluster of 2-3 lights
            for (let j=0; j<Math.floor(random()*2)+2; j++) {
                const clusterX = x + (random() - 0.5) * 10;
                const clusterY = y + (random() - 0.5) * 10;
                const lightSize = 2;
                emissiveCtx.fillRect(clusterX - lightSize/2, clusterY - lightSize/2, lightSize, lightSize);
            }
        }
    }

    // --- Create Three.js Textures ---
    const map = new THREE.CanvasTexture(mapCanvas);
    const normalMap = new THREE.CanvasTexture(normalCanvas);
    const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);

    return { map, normalMap, emissiveMap };
}