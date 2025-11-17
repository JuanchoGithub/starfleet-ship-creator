import * as THREE from 'three';

// A simple pseudorandom number generator for deterministic results based on a seed
function createPRNG(seed: number) {
    let s = seed;
    return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
}

interface EngineeringTextureGenerationParams {
    seed: number;
    panelColorVariation: number;
    window_density: number;
    lit_window_fraction: number;
    window_bands: number;
    window_color1: string;
    window_color2: string;
    registry: string;
    registry_toggle: boolean;
    registry_color: string;
    registry_font_size: number;
    registry_position_x: number;
    registry_position_y: number;
    registry_rotation: number;
}


export function generateEngineeringTextures(params: EngineeringTextureGenerationParams) {
    const width = 1024;
    const height = 2048; // Taller texture for the length of the hull
    const { 
        seed, panelColorVariation, window_density, lit_window_fraction, window_bands,
        registry, registry_toggle, registry_color, registry_font_size,
        registry_position_x, registry_position_y, registry_rotation
    } = params;
    const random = createPRNG(seed);

    // --- Create Canvases ---
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    const mapCtx = mapCanvas.getContext('2d')!;

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

    // --- Draw Panels ---
    // Panels are wider than they are tall, so their long edge wraps around the hull's circumference (U-axis).
    const panelSizeX = 256;
    const panelSizeY = 128;
    const numPanelsX = Math.ceil(width / panelSizeX);
    const numPanelsY = Math.ceil(height / panelSizeY);

    for (let i = 0; i < numPanelsX; i++) {
        for (let j = 0; j < numPanelsY; j++) {
            if (random() > 0.05) {
                const grayVariation = Math.floor((random() - 0.5) * 2 * panelColorVariation * 255);
                const panelGray = Math.max(0, Math.min(255, baseGray + grayVariation));
                mapCtx.fillStyle = `rgb(${panelGray}, ${panelGray}, ${panelGray})`;
                mapCtx.fillRect(i * panelSizeX, j * panelSizeY, panelSizeX, panelSizeY);
            }
        }
    }
    
    // --- Draw Panel Lines ---
    const lineGray = 150;
    const normalGrooveStrength = 30;
    mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
    mapCtx.lineWidth = 2;
    normalCtx.lineWidth = 2;
    
    // Horizontal lines
    for (let j = 0; j <= numPanelsY; j++) {
         if (random() > 0.2) {
            const y = j * panelSizeY;
            mapCtx.beginPath(); mapCtx.moveTo(0, y); mapCtx.lineTo(width, y); mapCtx.stroke();
            normalCtx.strokeStyle = `rgb(128, ${128 - normalGrooveStrength}, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(0, y - 1); normalCtx.lineTo(width, y - 1); normalCtx.stroke();
            normalCtx.strokeStyle = `rgb(128, ${128 + normalGrooveStrength}, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(0, y + 1); normalCtx.lineTo(width, y + 1); normalCtx.stroke();
        }
    }
    // Vertical lines
     for (let i = 0; i <= numPanelsX; i++) {
         if (random() > 0.2) {
            const x = i * panelSizeX;
            mapCtx.beginPath(); mapCtx.moveTo(x, 0); mapCtx.lineTo(x, height); mapCtx.stroke();
            normalCtx.strokeStyle = `rgb(${128 - normalGrooveStrength}, 128, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(x - 1, 0); normalCtx.lineTo(x - 1, height); normalCtx.stroke();
            normalCtx.strokeStyle = `rgb(${128 + normalGrooveStrength}, 128, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(x + 1, 0); normalCtx.lineTo(x + 1, height); normalCtx.stroke();
        }
    }

    // --- Draw Windows in Structured Bands ---
    // This logic assumes both sides of the hull are mapped to the left half of the texture (U=0 to 0.5).
    // We create two symmetrical sets of window bands within this region to ensure they appear on both port and starboard sides.
    if (window_bands > 0) {
        const bands_per_side = Math.max(1, Math.floor(window_bands / 2));
        const band_centers_u: number[] = [];

        // Starboard side bands (U = 0 to 0.25)
        for (let i = 0; i < bands_per_side; i++) {
            band_centers_u.push(0.1 + (i / bands_per_side) * 0.15);
        }
        // Port side bands (U = 0.25 to 0.5)
        for (let i = 0; i < bands_per_side; i++) {
            band_centers_u.push(0.4 + (i / bands_per_side) * -0.15);
        }

        const windowHeight = 12;
        const windowWidth = 8;
        const verticalSpacing = 24;

        for (const u of band_centers_u) {
            for (let y = verticalSpacing; y < height - verticalSpacing; y += verticalSpacing) {
                if (random() < window_density) {
                    const xPos = u * width + (random() - 0.5) * 4;
                    const yPos = y + (random() - 0.5) * 4;
                    
                    mapCtx.fillStyle = '#111';
                    mapCtx.fillRect(xPos - windowWidth/2, yPos - windowHeight/2, windowWidth, windowHeight);
                    
                    if (random() < lit_window_fraction) {
                        emissiveCtx.fillStyle = random() > 0.5 ? params.window_color1 : params.window_color2;
                        emissiveCtx.fillRect(xPos - windowWidth/2, yPos - windowHeight/2, windowWidth, windowHeight);
                    }
                }
            }
        }
    }


    // --- Draw Greebles & Hatches ---
    const numGreebles = 50;
    for (let i=0; i<numGreebles; i++) {
        const x = random() * width;
        const y = random() * height;
        const size = random() * 20 + 5;
        const gray = baseGray - 20 - random() * 30;
        mapCtx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        mapCtx.fillRect(x, y, size, size/2);
    }
    
    // Bottom triangular hatches (inspired by reference image)
    const numHatches = 8;
    for (let i=0; i<numHatches; i++) {
        const h = 40; const w = 25;
        const x = width * 0.5 + (random() - 0.5) * width * 0.4;
        const y = random() * height;
        
        mapCtx.beginPath();
        mapCtx.moveTo(x, y);
        mapCtx.lineTo(x + w/2, y + h);
        mapCtx.lineTo(x - w/2, y + h);
        mapCtx.closePath();
        mapCtx.fillStyle = `rgb(${baseGray - 30}, ${baseGray - 30}, ${baseGray-30})`;
        mapCtx.fill();
        mapCtx.strokeStyle = `rgb(${lineGray-20}, ${lineGray-20}, ${lineGray-20})`;
        mapCtx.stroke();
    }
    
    // --- Mirror Texture for Symmetry ---
    // Even if the model only uses the left half, we mirror it so the texture is complete.
    const mirrorCanvasHalf = (ctx: CanvasRenderingContext2D) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width / 2;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(ctx.canvas, 0, 0, width / 2, height, 0, 0, width / 2, height);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    };

    mirrorCanvasHalf(mapCtx);
    mirrorCanvasHalf(emissiveCtx);

    // Mirror normal map with R-channel inversion for correct lighting
    const leftHalfData = normalCtx.getImageData(0, 0, width / 2, height);
    const rightHalfData = normalCtx.createImageData(width / 2, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width / 2; x++) {
            const sourceIndex = (y * (width / 2) + x) * 4;
            const targetX = (width / 2) - 1 - x;
            const targetIndex = (y * (width / 2) + targetX) * 4;

            const r = leftHalfData.data[sourceIndex];
            const g = leftHalfData.data[sourceIndex + 1];
            const b = leftHalfData.data[sourceIndex + 2];
            const a = leftHalfData.data[sourceIndex + 3];
            
            rightHalfData.data[targetIndex] = 255 - r;
            rightHalfData.data[targetIndex + 1] = g;
            rightHalfData.data[targetIndex + 2] = b;
            rightHalfData.data[targetIndex + 3] = a;
        }
    }
    normalCtx.putImageData(rightHalfData, width / 2, 0);

    // --- Draw Registry (after mirroring to prevent duplication) ---
    if (registry_toggle && registry) {
        mapCtx.save();
        mapCtx.translate(width * registry_position_x, height * registry_position_y);
        mapCtx.rotate((registry_rotation - 90) * Math.PI / 180);
        mapCtx.fillStyle = registry_color;
        mapCtx.font = `bold ${registry_font_size}px Orbitron, sans-serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText(registry.toUpperCase(), 0, 0);
        mapCtx.restore();
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