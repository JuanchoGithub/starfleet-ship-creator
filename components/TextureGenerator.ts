import * as THREE from 'three';

// A simple pseudorandom number generator for deterministic results based on a seed
function createPRNG(seed: number) {
    let s = seed;
    return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
}

interface TextureGenerationParams {
    seed: number;
    density: number;
    panelColorVariation: number;
    window_density: number;
    window_color1: string;
    window_color2: string;
}

export function generateTextures(params: TextureGenerationParams) {
    const size = 1024;
    const { seed, density, panelColorVariation, window_density } = params;
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

    emissiveCtx.fillStyle = 'black'; // Emissive map starts black
    emissiveCtx.fillRect(0, 0, size, size);

    // --- Draw Panels and Details ---
    const panelSize = 128;
    const numPanelsX = size / panelSize;
    const numPanelsY = size / panelSize;

    const panelGrid: boolean[][] = Array.from({ length: numPanelsX }, () => Array(numPanelsY).fill(true));

    for (let i = 0; i < numPanelsX; i++) {
        for (let j = 0; j < numPanelsY; j++) {
            if (random() > 0.1) { // Skip some panels to create larger plates
                const grayVariation = Math.floor((random() - 0.5) * 2 * panelColorVariation * 255);
                const panelGray = Math.max(0, Math.min(255, baseGray + grayVariation));
                mapCtx.fillStyle = `rgb(${panelGray}, ${panelGray}, ${panelGray})`;
                mapCtx.fillRect(i * panelSize, j * panelSize, panelSize, panelSize);
            } else {
                panelGrid[i][j] = false;
            }
        }
    }
    
    // --- Draw Panel Lines ---
    const lineGray = 150;
    const normalGrooveStrength = 30; // 0-128
    
    mapCtx.strokeStyle = `rgb(${lineGray}, ${lineGray}, ${lineGray})`;
    mapCtx.lineWidth = 2;
    
    // Horizontal lines
    for (let j = 0; j <= numPanelsY; j++) {
         if (random() > 0.2) {
            const y = j * panelSize;
            mapCtx.beginPath();
            mapCtx.moveTo(0, y);
            mapCtx.lineTo(size, y);
            mapCtx.stroke();
            
            // Normal map groove (Y direction)
            normalCtx.strokeStyle = `rgb(128, ${128 - normalGrooveStrength}, 255)`; // Top highlight
            normalCtx.beginPath();
            normalCtx.moveTo(0, y - 1);
            normalCtx.lineTo(size, y - 1);
            normalCtx.stroke();
            
            normalCtx.strokeStyle = `rgb(128, ${128 + normalGrooveStrength}, 255)`; // Bottom shadow
            normalCtx.beginPath();
            normalCtx.moveTo(0, y + 1);
            normalCtx.lineTo(size, y + 1);
            normalCtx.stroke();
        }
    }
    
    // Vertical lines
     for (let i = 0; i <= numPanelsX; i++) {
         if (random() > 0.2) {
            const x = i * panelSize;
            mapCtx.beginPath();
            mapCtx.moveTo(x, 0);
            mapCtx.lineTo(x, size);
            mapCtx.stroke();
            
            // Normal map groove (X direction)
            normalCtx.strokeStyle = `rgb(${128 - normalGrooveStrength}, 128, 255)`; // Left highlight
            normalCtx.beginPath();
            normalCtx.moveTo(x - 1, 0);
            normalCtx.lineTo(x - 1, size);
            normalCtx.stroke();
            
            normalCtx.strokeStyle = `rgb(${128 + normalGrooveStrength}, 128, 255)`; // Right shadow
            normalCtx.beginPath();
            normalCtx.moveTo(x + 1, 0);
            normalCtx.lineTo(x + 1, size);
            normalCtx.stroke();
        }
    }

    // --- Draw Windows on Emissive Map ---
    for (let i = 0; i < numPanelsX; i++) {
        for (let j = 0; j < numPanelsY; j++) {
            if (!panelGrid[i][j]) continue;

            // Each panel has a chance to have a "window cluster"
            if (random() < window_density * 0.3) {
                const panelX = i * panelSize;
                const panelY = j * panelSize;
                const clusterType = random();
                const spacing = 4;

                // Horizontal strip
                if (clusterType < 0.4) {
                    const numWindows = Math.floor(random() * 8) + 3;
                    const w = 6; const h = 4;
                    const yPos = panelY + spacing + random() * (panelSize - h - spacing * 2);
                    let xPos = panelX + spacing + random() * 20;
                    
                    for(let k=0; k<numWindows; k++) {
                        if (xPos + w > panelX + panelSize - spacing) break;
                        if (random() > 0.25) { // 25% of windows dark
                             emissiveCtx.fillStyle = random() > 0.5 ? params.window_color1 : params.window_color2;
                             emissiveCtx.fillRect(xPos, yPos, w, h);
                        }
                        xPos += w + spacing;
                    }
                } 
                // Vertical strip
                else if (clusterType < 0.8) {
                    const numWindows = Math.floor(random() * 8) + 3;
                    const w = 4; const h = 6;
                    const xPos = panelX + spacing + random() * (panelSize - w - spacing * 2);
                    let yPos = panelY + spacing + random() * 20;
                    
                    for(let k=0; k<numWindows; k++) {
                        if (yPos + h > panelY + panelSize - spacing) break;
                        if (random() > 0.25) {
                             emissiveCtx.fillStyle = random() > 0.5 ? params.window_color1 : params.window_color2;
                             emissiveCtx.fillRect(xPos, yPos, w, h);
                        }
                        yPos += h + spacing;
                    }
                }
                // Scattered large windows (e.g., observation decks)
                else {
                     const numWindows = Math.floor(random() * 3) + 1;
                     for(let k=0; k<numWindows; k++) {
                          if (random() > 0.1) {
                            const w = random() * 8 + 8;
                            const h = random() * 8 + 8;
                            const xPos = panelX + spacing + random() * (panelSize - w - spacing * 2);
                            const yPos = panelY + spacing + random() * (panelSize - h - spacing * 2);
                            emissiveCtx.fillStyle = random() > 0.5 ? params.window_color1 : params.window_color2;
                            emissiveCtx.fillRect(xPos, yPos, w, h);
                          }
                     }
                }
            }
        }
    }
    
    // --- Draw Greebles / Small Details ---
    const numDetails = size * density;
    for (let i = 0; i < numDetails; i++) {
        const x = random() * size;
        const y = random() * size;
        const detailSize = random() * 10 + 4;
        
        mapCtx.fillStyle = `rgba(0,0,0,${random() * 0.2 + 0.1})`;
        mapCtx.fillRect(x, y, detailSize, detailSize);
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