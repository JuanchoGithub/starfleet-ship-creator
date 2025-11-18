

import * as THREE from 'three';

// A simple pseudorandom number generator for deterministic results based on a seed
function createPRNG(seed: number) {
    let s = seed;
    return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
}

interface NeckTextureGenerationParams {
    seed: number;
    panelColorVariation: number;
    window_density: number;
    window_lanes: number;
    lit_window_fraction: number;
    window_color1: string;
    window_color2: string;
    torpedo_launcher_toggle: boolean;
}

export function generateNeckTextures(params: NeckTextureGenerationParams) {
    const size = 1024;
    const { 
        seed, panelColorVariation, window_density, window_lanes, lit_window_fraction,
        window_color1, window_color2, torpedo_launcher_toggle
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

    // --- Draw Vertical Panels ---
    // Tall, thin panels to emphasize height and verticality
    const panelWidth = 64;
    const panelHeight = 128;
    const numPanelsX = Math.ceil(size / panelWidth);
    const numPanelsY = Math.ceil(size / panelHeight);

    for (let i = 0; i < numPanelsX; i++) {
        for (let j = 0; j < numPanelsY; j++) {
            if (random() > 0.1) {
                const grayVariation = Math.floor((random() - 0.5) * 2 * panelColorVariation * 255);
                const panelGray = Math.max(0, Math.min(255, baseGray + grayVariation));
                mapCtx.fillStyle = `rgb(${panelGray}, ${panelGray}, ${panelGray})`;
                mapCtx.fillRect(i * panelWidth, j * panelHeight, panelWidth, panelHeight);
            }
        }
    }
    
    // --- Draw Panel Lines ---
    const lineGray = 150;
    const normalGrooveStrength = 30;
    
    mapCtx.lineWidth = 2;
    normalCtx.lineWidth = 2;

    // Strong Vertical Lines
    mapCtx.strokeStyle = `rgb(${lineGray - 20}, ${lineGray - 20}, ${lineGray - 20})`; // Darker vertical lines
    for (let i = 0; i <= numPanelsX; i++) {
         if (random() > 0.1) {
            const x = i * panelWidth;
            mapCtx.beginPath(); mapCtx.moveTo(x, 0); mapCtx.lineTo(x, size); mapCtx.stroke();
            
            // Strong vertical normal grooves
            normalCtx.strokeStyle = `rgb(${128 - normalGrooveStrength}, 128, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(x - 1, 0); normalCtx.lineTo(x - 1, size); normalCtx.stroke();
            normalCtx.strokeStyle = `rgb(${128 + normalGrooveStrength}, 128, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(x + 1, 0); normalCtx.lineTo(x + 1, size); normalCtx.stroke();
        }
    }
    
    // Fainter/Sparsor Horizontal Lines
    mapCtx.strokeStyle = `rgb(${lineGray + 20}, ${lineGray + 20}, ${lineGray + 20})`; // Lighter horizontal lines
    for (let j = 0; j <= numPanelsY; j++) {
         if (random() > 0.4) { // Less frequent
            const y = j * panelHeight;
            mapCtx.beginPath(); mapCtx.moveTo(0, y); mapCtx.lineTo(size, y); mapCtx.stroke();
            
            // Fainter normal lines
            normalCtx.strokeStyle = `rgb(128, ${128 - normalGrooveStrength/2}, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(0, y - 1); normalCtx.lineTo(size, y - 1); normalCtx.stroke();
            normalCtx.strokeStyle = `rgb(128, ${128 + normalGrooveStrength/2}, 255)`;
            normalCtx.beginPath(); normalCtx.moveTo(0, y + 1); normalCtx.lineTo(size, y + 1); normalCtx.stroke();
        }
    }

    // --- Draw Vertical Window Columns ---
    // Explicit user control over lane count
    if (window_lanes > 0) {
        const bayWidth = size / window_lanes;
        const windowWidth = Math.min(bayWidth * 0.6, 16); // constrained width
        const windowHeight = 16; 
        const verticalSpacing = 32;

        for (let i = 0; i < window_lanes; i++) {
            const xCenter = (i + 0.5) * bayWidth;
            
            // Draw column based on user density
            for (let y = verticalSpacing/2; y < size; y += verticalSpacing) {
                // Use window_density to determine if a window exists here at all
                if (random() < window_density) {
                    // Draw hull cutout
                    mapCtx.fillStyle = '#111';
                    mapCtx.fillRect(xCenter - windowWidth/2, y, windowWidth, windowHeight);

                    // Decide if lit
                    if (random() < lit_window_fraction) {
                        emissiveCtx.fillStyle = random() > 0.5 ? window_color1 : window_color2;
                        emissiveCtx.fillRect(xCenter - windowWidth/2, y, windowWidth, windowHeight);
                    }
                }
            }
        }
    }

    // --- Torpedo Launcher (Fore Face) ---
    // Fore Face is mapped to U = 0.50 to 0.75
    if (torpedo_launcher_toggle) {
        const foreZoneStart = 0.5 * size;
        const foreZoneWidth = 0.25 * size;
        const foreCenterX = foreZoneStart + foreZoneWidth / 2;
        
        // Place launcher near the bottom of the neck
        const launcherY = size * 0.8; 
        const launcherWidth = 60;
        const launcherHeight = 40;
        const spacing = 30;

        const drawLauncher = (x: number, y: number) => {
            // Hull plate backdrop
            mapCtx.fillStyle = '#444';
            mapCtx.fillRect(x - launcherWidth/2 - 5, y - launcherHeight/2 - 5, launcherWidth + 10, launcherHeight + 10);
            
            // Tube opening (dark)
            mapCtx.fillStyle = '#050505';
            mapCtx.beginPath();
            mapCtx.ellipse(x, y, launcherWidth/2, launcherHeight/2, 0, 0, Math.PI * 2);
            mapCtx.fill();
            
            // Rim glow (red warning)
            emissiveCtx.strokeStyle = '#ff0000';
            emissiveCtx.lineWidth = 3;
            emissiveCtx.beginPath();
            emissiveCtx.ellipse(x, y, launcherWidth/2 - 2, launcherHeight/2 - 2, 0, 0, Math.PI * 2);
            emissiveCtx.stroke();
            
            // Normal detail (flat bottom to look recessed)
            normalCtx.fillStyle = 'rgb(128, 128, 255)';
            normalCtx.beginPath();
            normalCtx.ellipse(x, y, launcherWidth/2, launcherHeight/2, 0, 0, Math.PI * 2);
            normalCtx.fill();
        };

        // Draw dual launchers centered on the fore face
        drawLauncher(foreCenterX - launcherWidth/2 - spacing/2, launcherY);
        drawLauncher(foreCenterX + launcherWidth/2 + spacing/2, launcherY);
        
        // Add a vertical housing line for the launchers to integrate them
        mapCtx.strokeStyle = '#666';
        mapCtx.lineWidth = 4;
        mapCtx.beginPath();
        mapCtx.moveTo(foreCenterX, launcherY - 100);
        mapCtx.lineTo(foreCenterX, launcherY + 100);
        mapCtx.stroke();
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
