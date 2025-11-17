import * as THREE from 'three';

// A simple pseudorandom number generator for deterministic results based on a seed
function createPRNG(seed: number) {
    let s = seed;
    return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
}

interface NacelleTextureGenerationParams {
    seed: number;
    panelColorVariation: number;
    window_density: number;
    lit_window_fraction: number;
    window_color1: string;
    window_color2: string;
    pennant_toggle: boolean;
    pennant_color: string;
    pennant_length: number;
    pennant_group_width: number;
    pennant_line_width: number;
    pennant_line_count: number;
    pennant_taper_start: number;
    pennant_taper_end: number;
    pennant_sides: 'Outward' | 'Inward' | 'Both';
    pennant_position: number;
    pennant_rotation: number;
    pennant_glow_intensity: number;
    delta_toggle: boolean;
    delta_position: number;
    delta_glow_intensity: number;
    pennant_reflection: number;
}

/**
 * Draws the Starfleet delta symbol path with seed-based variations.
 * @param path The Path2D object to draw into.
 * @param cx The center x-coordinate of the symbol.
 * @param cy The center y-coordinate of the symbol.
 * @param width The total width of the symbol.
 * @param height The total height of the symbol.
 * @param random A seeded random function.
 */
function drawDeltaPath(path: Path2D, cx: number, cy: number, width: number, height: number, random: () => number) {
    const w = width;
    const h = height;

    // Use random function to vary control points for unique shapes
    const topCpX = cx + w * (0.6 + random() * 0.2);
    const topCpY = cy - h * (0.4 + random() * 0.2);
    const bottomCpX = cx + w * (0.4 + random() * 0.2);
    const bottomCpY = cy + h * (0.4 + random() * 0.2);

    // Outer shape
    path.moveTo(cx, cy - h / 2); // Top point
    path.bezierCurveTo(topCpX, topCpY, bottomCpX, bottomCpY, cx, cy + h / 2); // Right side
    path.bezierCurveTo(cx - (bottomCpX - cx), bottomCpY, cx - (topCpX - cx), topCpY, cx, cy - h / 2); // Left side (mirrored)
    path.closePath();

    // Inner "swoosh" cutout
    const swooshWidth = w * 0.15;
    const swooshYOffset = h * 0.1;
    const swooshCpX = swooshWidth * (1.0 + random());
    const swooshCpY = -swooshYOffset * (1.2 + random());

    path.moveTo(cx - w * 0.1, cy + h / 2); // Bottom left
    path.bezierCurveTo(cx - swooshCpX, cy + swooshCpY, cx + swooshCpX, cy + swooshCpY, cx + w * 0.1, cy + h / 2); // Curve up
    path.bezierCurveTo(cx + swooshCpX * 0.8, cy + swooshCpY * 0.5, cx - swooshCpX * 0.8, cy + swooshCpY * 0.5, cx - w * 0.1, cy + h / 2); // Curve down
    path.closePath();
}


export function generateNacelleTextures(params: NacelleTextureGenerationParams) {
    // Taller than wide to match lathe geometry UVs (V runs along length)
    const width = 1024;
    const height = 2048; 
    const { seed, panelColorVariation, window_density, lit_window_fraction } = params;
    const random = createPRNG(seed);

    // --- Create Canvases ---
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    const mapCtx = mapCanvas.getContext('2d')!;
    mapCtx.imageSmoothingEnabled = true;

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;
    const normalCtx = normalCanvas.getContext('2d')!;

    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = width;
    emissiveCanvas.height = height;
    const emissiveCtx = emissiveCanvas.getContext('2d')!;

    // --- Base Colors ---
    const baseGray = 204; // #cccccc
    mapCtx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`;
    mapCtx.fillRect(0, 0, width, height);

    normalCtx.fillStyle = 'rgb(128, 128, 255)'; // Neutral normal
    normalCtx.fillRect(0, 0, width, height);

    emissiveCtx.fillStyle = 'black';
    emissiveCtx.fillRect(0, 0, width, height);

    // --- Draw Panels and Details ---
    const panelSize = 128;
    const numPanelsX = Math.ceil(width / panelSize);
    const numPanelsY = Math.ceil(height / panelSize);

    for (let i = 0; i < numPanelsX; i++) {
        for (let j = 0; j < numPanelsY; j++) {
            if (random() > 0.05) {
                const grayVariation = Math.floor((random() - 0.5) * 2 * panelColorVariation * 255);
                const panelGray = Math.max(0, Math.min(255, baseGray + grayVariation));
                mapCtx.fillStyle = `rgb(${panelGray}, ${panelGray}, ${panelGray})`;
                mapCtx.fillRect(i * panelSize, j * panelSize, panelSize, panelSize);
            }
        }
    }
    
    // --- Draw Panel Lines ---
    const lineGray = 150;
    const normalGrooveStrength = 30;
    mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
    mapCtx.lineWidth = 2;
    normalCtx.lineWidth = 2;
    
    for (let j = 0; j <= numPanelsY; j++) {
         if (random() > 0.2) {
            const y = j * panelSize;
            mapCtx.beginPath(); mapCtx.moveTo(0, y); mapCtx.lineTo(width, y); mapCtx.stroke();
            normalCtx.strokeStyle = `rgb(128, ${128 - normalGrooveStrength}, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(0, y - 1); normalCtx.lineTo(width, y - 1); normalCtx.stroke();
            normalCtx.strokeStyle = `rgb(128, ${128 + normalGrooveStrength}, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(0, y + 1); normalCtx.lineTo(width, y + 1); normalCtx.stroke();
        }
    }
     for (let i = 0; i <= numPanelsX; i++) {
         if (random() > 0.2) {
            const x = i * panelSize;
            mapCtx.beginPath(); mapCtx.moveTo(x, 0); mapCtx.lineTo(x, height); mapCtx.stroke();
            normalCtx.strokeStyle = `rgb(${128 - normalGrooveStrength}, 128, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(x - 1, 0); normalCtx.lineTo(x - 1, height); normalCtx.stroke();
            normalCtx.strokeStyle = `rgb(${128 + normalGrooveStrength}, 128, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(x + 1, 0); normalCtx.lineTo(x + 1, height); normalCtx.stroke();
        }
    }

    // --- Draw Windows ---
    // With phiStart=-PI/2, sides are now at U=0.25 (+X) and U=0.75 (-X).
    const sidesToDrawWindows = [0.25, 0.75];
    for (const sideU of sidesToDrawWindows) {
        for (let j = 0; j < numPanelsY; j++) {
            if (random() < window_density) {
                const panelY = j * panelSize;
                const numWindows = Math.floor(random() * 5) + 2;
                const h = 8; const w = 6; const spacing = 12;
                let xPos = width * sideU - (numWindows * (w + spacing)) / 2; // Center cluster
                const yPos = panelY + random() * (panelSize - h);
                
                for(let k=0; k<numWindows; k++) {
                    mapCtx.fillStyle = '#111';
                    mapCtx.fillRect(xPos, yPos, w, h);

                    if (random() < lit_window_fraction) {
                         emissiveCtx.fillStyle = random() > 0.5 ? params.window_color1 : params.window_color2;
                         emissiveCtx.fillRect(xPos, yPos, w, h);
                    }
                    xPos += w + spacing;
                }
            }
        }
    }

    // --- Draw Pennant Stripe & Delta ---
    if (params.pennant_toggle) {
        const baseSidesToDrawOn = [];
        // For both nacelles after UV mirroring, U=0.25 is the outward face and U=0.75 is the inward face.
        if (params.pennant_sides === 'Outward') baseSidesToDrawOn.push(0.25);
        if (params.pennant_sides === 'Inward') baseSidesToDrawOn.push(0.75);
        if (params.pennant_sides === 'Both') {
            baseSidesToDrawOn.push(0.25);
            baseSidesToDrawOn.push(0.75);
        }
    
        const stripeHeight = height * params.pennant_length;
        const stripeY = params.pennant_position * (height - stripeHeight);
        const groupWidthPx = width * params.pennant_group_width;

        const addBevelToPath = (ctx: CanvasRenderingContext2D, path: Path2D) => {
            const decalNormalStrength = 20;
            ctx.save();
            ctx.clip(path, 'evenodd');
            ctx.fillStyle = 'rgba(128, 128, 255, 1)';
            ctx.shadowColor = `rgb(${128 + decalNormalStrength}, ${128 + decalNormalStrength}, 255)`; // Raised highlight
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = -2;
            ctx.shadowOffsetY = -2;
            ctx.fill(path, 'evenodd');
            ctx.shadowColor = `rgb(${128 - decalNormalStrength}, ${128 - decalNormalStrength}, 255)`; // Depressed shadow
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fill(path, 'evenodd');
            ctx.restore();
        };
        
        const rotationOffset = params.pennant_rotation / 360;

        for (const baseSideU of baseSidesToDrawOn) {
            const sideU = (baseSideU + rotationOffset + 1.0) % 1.0;

            const lineCount = Math.max(1, Math.floor(params.pennant_line_count));
            const totalLineWidth = groupWidthPx * params.pennant_line_width;
            const singleLineWidth = totalLineWidth / lineCount;
            const lineSpacing = lineCount > 1 ? (groupWidthPx - totalLineWidth) / (lineCount - 1) : 0;
            const startX = width * sideU - groupWidthPx / 2;

            for (let i = 0; i < lineCount; i++) {
                const lineXCenter = startX + i * (singleLineWidth + lineSpacing) + singleLineWidth / 2;

                const startWidth = singleLineWidth * params.pennant_taper_start;
                const endWidth = singleLineWidth * params.pennant_taper_end;
                
                const path = new Path2D();
                path.moveTo(lineXCenter - startWidth / 2, stripeY);
                path.lineTo(lineXCenter + startWidth / 2, stripeY);
                path.lineTo(lineXCenter + endWidth / 2, stripeY + stripeHeight);
                path.lineTo(lineXCenter - endWidth / 2, stripeY + stripeHeight);
                path.closePath();
                
                // Draw on color map
                mapCtx.fillStyle = params.pennant_color;
                mapCtx.fill(path);
                
                // Draw glow on emissive map
                const pennantGlowColor = new THREE.Color(params.pennant_color).multiplyScalar(params.pennant_glow_intensity);
                emissiveCtx.fillStyle = pennantGlowColor.getStyle();
                emissiveCtx.fill(path);

                if (params.pennant_reflection > 0) {
                    const grad = mapCtx.createLinearGradient(0, stripeY, 0, stripeY + stripeHeight);
                    grad.addColorStop(0, `rgba(255,255,255,${0.4 * params.pennant_reflection})`);
                    grad.addColorStop(0.4, 'rgba(255,255,255,0.0)');
                    grad.addColorStop(0.6, 'rgba(0,0,0,0.0)');
                    grad.addColorStop(1, `rgba(0,0,0,${0.3 * params.pennant_reflection})`);
                    mapCtx.fillStyle = grad;
                    mapCtx.fill(path);
                }

                addBevelToPath(normalCtx, path);
            }

            if (params.delta_toggle) {
                const deltaHeight = groupWidthPx * 1.8;
                const deltaY = stripeY + stripeHeight * params.delta_position;
                const deltaX = width * sideU;
                
                const deltaPath = new Path2D();
                drawDeltaPath(deltaPath, deltaX, deltaY, groupWidthPx * 0.8, deltaHeight, random);
                
                // Draw on color map (dark version of pennant color)
                mapCtx.fillStyle = new THREE.Color(params.pennant_color).multiplyScalar(0.2).getStyle();
                mapCtx.fill(deltaPath, 'evenodd');
                
                // Draw glow on emissive map
                const deltaGlowColor = new THREE.Color(params.pennant_color).multiplyScalar(params.delta_glow_intensity);
                emissiveCtx.fillStyle = deltaGlowColor.getStyle();
                emissiveCtx.fill(deltaPath, 'evenodd');

                if (params.pennant_reflection > 0) {
                    const grad = mapCtx.createLinearGradient(deltaX - groupWidthPx*0.4, deltaY - deltaHeight/2, deltaX + groupWidthPx*0.4, deltaY + deltaHeight/2);
                    grad.addColorStop(0, `rgba(255,255,255,${0.3 * params.pennant_reflection})`);
                    grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
                    grad.addColorStop(1, `rgba(0,0,0,${0.2 * params.pennant_reflection})`);
                    mapCtx.fillStyle = grad;
                    mapCtx.fill(deltaPath, 'evenodd');
                }

                addBevelToPath(normalCtx, deltaPath);
            }
        }
    }
    
    // --- Create Three.js Textures ---
    const map = new THREE.CanvasTexture(mapCanvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;

    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;

    const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
    emissiveMap.wrapS = THREE.RepeatWrapping;
    emissiveMap.wrapT = THREE.RepeatWrapping;


    return { map, normalMap, emissiveMap };
}