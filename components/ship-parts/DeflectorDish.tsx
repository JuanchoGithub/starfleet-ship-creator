
import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { useFrame } from '@react-three/fiber';

function generateMovieRefitTexture(
    color1: string, 
    color2: string, 
    centerColor: string, 
    baseColor: string,
    lineCount: number,
    lineLength: number,
    lineThickness: number,
    centerRadiusScale: number,
    ringWidth: number
) {
    const size = 512; // Increased resolution slightly
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = size;
    mapCanvas.height = size;
    const mapCtx = mapCanvas.getContext('2d')!;

    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = size;
    emissiveCanvas.height = size;
    const emissiveCtx = emissiveCanvas.getContext('2d')!;

    const center = size / 2;
    const radius = size / 2;

    // --- Emissive Map ---
    emissiveCtx.fillStyle = 'black';
    emissiveCtx.fillRect(0, 0, size, size);

    // Outer blue ring
    // ringWidth param (0-1) maps to a portion of the radius
    const outerRingRadius = radius * 0.9;
    const outerRingThickness = radius * Math.max(0.05, ringWidth);

    emissiveCtx.save();
    emissiveCtx.beginPath();
    emissiveCtx.arc(center, center, outerRingRadius - outerRingThickness/2, 0, Math.PI * 2);
    emissiveCtx.strokeStyle = color2;
    emissiveCtx.lineWidth = outerRingThickness;
    emissiveCtx.shadowColor = color2;
    emissiveCtx.shadowBlur = outerRingThickness;
    emissiveCtx.stroke();
    emissiveCtx.restore();

    // Central glow
    const centralGlowRadius = radius * Math.max(0.1, centerRadiusScale);
    emissiveCtx.save();
    emissiveCtx.beginPath();
    emissiveCtx.arc(center, center, centralGlowRadius, 0, Math.PI * 2);
    emissiveCtx.fillStyle = centerColor;
    emissiveCtx.shadowColor = centerColor;
    emissiveCtx.shadowBlur = size * 0.1;
    emissiveCtx.fill();
    emissiveCtx.restore();

    // --- Color Map ---
    mapCtx.fillStyle = baseColor; 
    mapCtx.fillRect(0, 0, size, size);
    
    // Copper fins
    const finCount = Math.max(2, Math.floor(lineCount));
    const finInnerRadius = radius * 0.25; // Start slightly outside center
    // lineLength param controls how far out they go
    const maxFinLen = radius * 0.9;
    const finOuterRadius = finInnerRadius + (maxFinLen - finInnerRadius) * lineLength;

    // Configure emissive drawing for fins
    emissiveCtx.globalAlpha = 0.7; 
    const thickness = Math.max(1, lineThickness);
    emissiveCtx.lineWidth = thickness;
    emissiveCtx.strokeStyle = color1;

    for (let i = 0; i < finCount; i++) {
        const angle = (i / finCount) * Math.PI * 2;
        
        const gradient = mapCtx.createLinearGradient(
            center + Math.cos(angle) * finInnerRadius,
            center + Math.sin(angle) * finInnerRadius,
            center + Math.cos(angle) * finOuterRadius,
            center + Math.sin(angle) * finOuterRadius
        );
        gradient.addColorStop(0, '#553311');
        gradient.addColorStop(0.5, color1);
        gradient.addColorStop(1, '#664422');

        // Draw on Diffuse Map
        mapCtx.beginPath();
        mapCtx.moveTo(
            center + Math.cos(angle) * finInnerRadius, 
            center + Math.sin(angle) * finInnerRadius
        );
        mapCtx.lineTo(
            center + Math.cos(angle) * finOuterRadius, 
            center + Math.sin(angle) * finOuterRadius
        );
        mapCtx.strokeStyle = gradient;
        mapCtx.lineWidth = thickness * 1.5; // Slightly thicker on diffuse
        mapCtx.stroke();

        // Draw on Emissive Map (Glow)
        emissiveCtx.beginPath();
        emissiveCtx.moveTo(
            center + Math.cos(angle) * finInnerRadius, 
            center + Math.sin(angle) * finInnerRadius
        );
        emissiveCtx.lineTo(
            center + Math.cos(angle) * finOuterRadius, 
            center + Math.sin(angle) * finOuterRadius
        );
        emissiveCtx.stroke();
    }
    emissiveCtx.globalAlpha = 1.0;

    // Central dark area (cap over fins)
    // Matches central glow radius but ensures clean cutout on diffuse
    mapCtx.beginPath();
    mapCtx.arc(center, center, centralGlowRadius, 0, Math.PI * 2);
    mapCtx.fillStyle = '#000000';
    mapCtx.fill();


    const map = new THREE.CanvasTexture(mapCanvas);
    const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);

    return { map, emissiveMap };
}

function generateVortexTexture(
    color1: string, 
    color2: string,
    numSectors: number,
    centerRadiusScale: number,
    lineThickness: number
) {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = size;
    emissiveCanvas.height = size;
    const emissiveCtx = emissiveCanvas.getContext('2d')!;

    const center = size / 2;
    const maxRadius = size / 2 * 0.95;
    
    // Colors
    const glowColor = new THREE.Color(color1);
    const baseColor = new THREE.Color(color2);
    
    // --- Backgrounds ---
    // Diffuse: Dark metallic base
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, size, size);
    
    // Emissive: Black start
    emissiveCtx.fillStyle = 'black';
    emissiveCtx.fillRect(0, 0, size, size);

    // --- Configuration ---
    const sectors = Math.max(3, Math.floor(numSectors));
    const numRungs = 10;
    const innerRadius = maxRadius * Math.max(0.1, centerRadiusScale);
    const outerRadius = maxRadius * 0.9;
    const spokeThickness = Math.max(1, lineThickness) * (size / 512); // Scaling based on resolution
    
    // --- 1. Draw The Turbine "Ladders" ---
    for (let i = 0; i < sectors; i++) {
        const angleStep = (Math.PI * 2) / sectors;
        const padding = angleStep * 0.15; // Space for the spoke
        
        const startAngle = i * angleStep + padding;
        const endAngle = (i + 1) * angleStep - padding;
        
        // Draw Rungs
        const rungStep = (outerRadius - innerRadius) / numRungs;
        
        for (let j = 0; j < numRungs; j++) {
            const r = innerRadius + j * rungStep + rungStep * 0.5;
            const thickness = (size * 0.015) * (1 - j/numRungs * 0.3); // Taper thickness slightly

            // Diffuse: Bright color
            ctx.beginPath();
            ctx.arc(center, center, r, startAngle, endAngle);
            ctx.strokeStyle = glowColor.getStyle();
            ctx.lineWidth = thickness;
            ctx.stroke();
            
            // Emissive: Intense glow
            emissiveCtx.beginPath();
            emissiveCtx.arc(center, center, r, startAngle, endAngle);
            emissiveCtx.strokeStyle = glowColor.getStyle();
            emissiveCtx.lineWidth = thickness;
            emissiveCtx.shadowColor = glowColor.getStyle();
            emissiveCtx.shadowBlur = thickness * 2;
            emissiveCtx.stroke();
            emissiveCtx.shadowBlur = 0; // Reset
        }
    }
    
    // --- 2. Draw Spokes (The structure between ladders) ---
    // We draw these on the diffuse map to cover any sloppy rung edges and provide structure
    for (let i = 0; i < sectors; i++) {
        const angle = i * (Math.PI * 2) / sectors;
        const width = size * 0.015 * (spokeThickness / 2);
        
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle);
        
        // Spoke body
        ctx.fillStyle = baseColor.getStyle();
        ctx.fillRect(innerRadius, -width/2, outerRadius - innerRadius, width);
        
        // Highlight edge
        ctx.fillStyle = '#555'; // Highlight
        ctx.fillRect(innerRadius, -width/2, outerRadius - innerRadius, width * 0.2);

        ctx.restore();
    }
    
    // --- 3. Outer Rim ---
    const rimThickness = size * 0.03;
    // Diffuse rim
    ctx.beginPath();
    ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = baseColor.getStyle();
    ctx.lineWidth = rimThickness;
    ctx.stroke();
    
    // Emissive Rim Accents
    // Dashed line around the outside
    const numDashes = sectors * 2;
    for (let i = 0; i < numDashes; i++) {
        const angle = i * (Math.PI * 2) / numDashes;
        const dashLen = (Math.PI * 2) / numDashes * 0.5;
        
        emissiveCtx.beginPath();
        emissiveCtx.arc(center, center, outerRadius + rimThickness, angle, angle + dashLen);
        emissiveCtx.strokeStyle = glowColor.getStyle();
        emissiveCtx.lineWidth = size * 0.01;
        emissiveCtx.stroke();
        
        // Add to diffuse too
        ctx.beginPath();
        ctx.arc(center, center, outerRadius + rimThickness, angle, angle + dashLen);
        ctx.strokeStyle = glowColor.getStyle();
        ctx.lineWidth = size * 0.01;
        ctx.stroke();
    }

    // --- 4. Center Hub ---
    // Dark circle
    ctx.beginPath();
    ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    
    // Glowing "Eye" or inner turbine
    const eyeRadius = innerRadius * 0.6;
    // Draw a starburst pattern in the center
    const numSpikes = 12;
    
    emissiveCtx.save();
    emissiveCtx.translate(center, center);
    emissiveCtx.fillStyle = glowColor.getStyle();
    emissiveCtx.shadowColor = glowColor.getStyle();
    emissiveCtx.shadowBlur = 20;
    
    ctx.save();
    ctx.translate(center, center);
    ctx.fillStyle = glowColor.getStyle();

    for(let i=0; i<numSpikes; i++) {
        const angle = i * (Math.PI * 2) / numSpikes;
        
        // Draw simple trapezoid spike
        const drawSpike = (context: CanvasRenderingContext2D) => {
            context.rotate(angle);
            context.beginPath();
            context.moveTo(eyeRadius * 0.2, 0);
            context.lineTo(eyeRadius, -eyeRadius * 0.1);
            context.lineTo(eyeRadius, eyeRadius * 0.1);
            context.closePath();
            context.fill();
            context.rotate(-angle);
        }
        
        drawSpike(emissiveCtx);
        drawSpike(ctx);
    }
    
    emissiveCtx.restore();
    ctx.restore();
    
    // Center Cap
    const capRadius = eyeRadius * 0.3;
    ctx.beginPath();
    ctx.arc(center, center, capRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;

    const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
    emissiveMap.wrapS = THREE.RepeatWrapping;
    emissiveMap.wrapT = THREE.RepeatWrapping;

    return { map, emissiveMap };
}

interface DeflectorDishProps {
    params: ShipParameters;
}

export const DeflectorDish: React.FC<DeflectorDishProps> = ({ params }) => {
    
    const textures = useMemo(() => {
        if (params.engineering_dishType === 'Movie Refit' || params.engineering_dishType === 'Advanced Refit') {
            // Use Color4 for center, Color3 for base to allow UI customization
            return generateMovieRefitTexture(
                params.engineering_dishColor1,
                params.engineering_dishColor2,
                params.engineering_dishColor4 || '#FFFFFF',
                params.engineering_dishColor3 || '#181008',
                params.engineering_dish_lines,
                params.engineering_dish_line_length,
                params.engineering_dish_line_thickness,
                params.engineering_dish_center_radius,
                params.engineering_dish_ring_width
            );
        }
        if (params.engineering_dishType === 'Vortex') {
            return generateVortexTexture(
                params.engineering_dishColor1, 
                params.engineering_dishColor2,
                params.engineering_dish_lines,
                params.engineering_dish_center_radius,
                params.engineering_dish_line_thickness
            );
        }
        return null;
    }, [
        params.engineering_dishType, 
        params.engineering_dishColor1, params.engineering_dishColor2, params.engineering_dishColor3, params.engineering_dishColor4,
        params.engineering_dish_lines, params.engineering_dish_line_length, params.engineering_dish_line_thickness,
        params.engineering_dish_center_radius, params.engineering_dish_ring_width
    ]);

    const deflectorMaterial = useMemo(() => {
        if ((params.engineering_dishType === 'Movie Refit' || params.engineering_dishType === 'Vortex' || params.engineering_dishType === 'Advanced Refit') && textures) {
            return new THREE.MeshStandardMaterial({
                map: textures.map,
                emissiveMap: textures.emissiveMap,
                emissive: 'white',
                roughness: 0.2,
                metalness: 0.5,
            });
        }
        // Default 'Pulse' style
        return new THREE.MeshStandardMaterial({
            color: params.engineering_dishColor1,
            roughness: 0.1,
        });
    }, [params.engineering_dishType, params.engineering_dishColor1, textures]);

    const color1 = useMemo(() => new THREE.Color(params.engineering_dishColor1), [params.engineering_dishColor1]);
    const color2 = useMemo(() => new THREE.Color(params.engineering_dishColor2), [params.engineering_dishColor2]);

    useFrame(({ clock }) => {
        // Pulse Logic for Pulse, Movie Refit, and Vortex styles
        if (params.engineering_dishType === 'Pulse') {
            const pulse = (Math.sin(clock.getElapsedTime() * params.engineering_dishPulseSpeed) + 1) / 2; // 0..1
            deflectorMaterial.emissive.lerpColors(color1, color2, pulse);
            deflectorMaterial.emissiveIntensity = params.engineering_dishGlowIntensity;
        } else if (params.engineering_dishType === 'Movie Refit' || params.engineering_dishType === 'Vortex' || params.engineering_dishType === 'Advanced Refit') {
            const pulseFactor = params.engineering_dishType === 'Vortex' ? 0.2 : 0.5;
            const pulseBase = params.engineering_dishType === 'Vortex' ? 0.9 : 0.75;
            const pulse = (Math.sin(clock.getElapsedTime() * params.engineering_dishPulseSpeed) + 1) / 2 * pulseFactor + pulseBase;
            deflectorMaterial.emissiveIntensity = params.engineering_dishGlowIntensity * pulse;
        }

        // Texture Animation Logic (for types that support it and aren't handled by a dedicated hook like TNG)
        if ((params.engineering_dishType === 'Movie Refit' || params.engineering_dishType === 'Vortex' || params.engineering_dishType === 'Advanced Refit') && deflectorMaterial.map) {
             const rotation = clock.getElapsedTime() * params.engineering_dishAnimSpeed * -0.1;
             deflectorMaterial.map.rotation = rotation;
             deflectorMaterial.map.needsUpdate = true;
             
             if (deflectorMaterial.emissiveMap && deflectorMaterial.emissiveMap !== deflectorMaterial.map) {
                deflectorMaterial.emissiveMap.rotation = rotation;
                deflectorMaterial.emissiveMap.needsUpdate = true;
             }
        }
    });

    const deflectorGeo = useMemo(() => {
        const {
            engineering_length: length,
            engineering_radius: width,
            engineering_widthRatio: widthRatio,
            engineering_dishRadius: dishRadius,
            engineering_dishInset: dishInset,
            engineering_segments: segments,
            engineering_skew: skew
        } = params;

        // Recreate the last point of the engineering hull to attach to
        const engineeringLastPoint = new THREE.Vector2(
            Math.sin(0.65 * Math.PI + 0.35) * width,
            length
        );
        engineeringLastPoint.x *= dishRadius;

        // --- Deflector Dish Profile (concave with antenna) ---
        const deflectorPoints: THREE.Vector2[] = [];
        const deflectorOuterEdge = new THREE.Vector2().copy(engineeringLastPoint);
        deflectorPoints.push(deflectorOuterEdge);
        
        const dishConcavity = 0.2 * width; // Scaled concavity factor
        const deflectorPointCount = 8;
        for (let i = 0; i <= deflectorPointCount; i++) {
            const r = i / deflectorPointCount;
            deflectorPoints.push(
                new THREE.Vector2(
                    deflectorOuterEdge.x * (1.0 - r),
                    deflectorOuterEdge.y - Math.sin(Math.PI * r / 2.0) * dishConcavity - dishInset
                )
            );
        }

        // Antenna Spike
        const lastDishPoint = deflectorPoints[deflectorPoints.length - 1];
        lastDishPoint.setX(deflectorOuterEdge.x * 0.1);
        deflectorPoints.push(
            new THREE.Vector2(0.0, deflectorOuterEdge.y + 0.4 * width)
        );

        const geo = new THREE.LatheGeometry(deflectorPoints, Math.floor(segments));

        // Apply transformations in order: Scale -> Skew
        geo.scale(widthRatio, 1.0, 1.0);
        const matrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 1, skew, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        geo.applyMatrix4(matrix);

        if (['Vortex', 'Advanced Refit', 'Movie Refit'].includes(params.engineering_dishType)) {
            const positions = geo.attributes.position.array;
            const uvs = new Float32Array(positions.length / 3 * 2);
            geo.computeBoundingBox();
            const bbox = geo.boundingBox!;
            
            const maxDim = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z);
            const centerX = (bbox.min.x + bbox.max.x) / 2;
            const centerZ = (bbox.min.z + bbox.max.z) / 2;

            const {
                engineering_dishTextureScaleX: scaleX,
                engineering_dishTextureScaleY: scaleY,
                engineering_dishTextureShearX: shearX,
                engineering_dishTextureShearY: shearY,
            } = params;
    
            for (let i = 0; i < positions.length / 3; i++) {
                const x = positions[i * 3];
                const z = positions[i * 3 + 2];
                
                // Raw UVs, centered around 0.0
                const u_raw = (x - centerX) / maxDim;
                const v_raw = (z - centerZ) / maxDim;

                // Apply scale and shear transformation
                const u_transformed = u_raw * scaleX + v_raw * shearX;
                const v_transformed = v_raw * scaleY + u_raw * shearY;
                
                // Shift to [0,1] range and flip V for canvas texture
                uvs[i * 2] = u_transformed + 0.5;
                uvs[i * 2 + 1] = 1.0 - (v_transformed + 0.5);
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        }

        geo.computeVertexNormals();
        return geo;
    }, [params]);

    useEffect(() => {
        return () => {
            if (textures) {
                textures.map.dispose();
                if (textures.emissiveMap) textures.emissiveMap.dispose();
            }
            deflectorMaterial.dispose();
        };
    }, [textures, deflectorMaterial]);

    return (
        <mesh
            name="DeflectorDish"
            geometry={deflectorGeo}
            material={deflectorMaterial}
            castShadow
            receiveShadow
        />
    )
};
