import '@react-three/fiber';
import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { useFrame } from '@react-three/fiber';

function generateMovieRefitTexture(color1: string, color2: string, centerColor: string, baseColor: string) {
    const size = 256;
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
    emissiveCtx.save();
    emissiveCtx.beginPath();
    emissiveCtx.arc(center, center, radius * 0.85, 0, Math.PI * 2);
    emissiveCtx.strokeStyle = color2;
    emissiveCtx.lineWidth = size * 0.1;
    emissiveCtx.shadowColor = color2;
    emissiveCtx.shadowBlur = size * 0.1;
    emissiveCtx.stroke();
    emissiveCtx.restore();

    // Central glow
    emissiveCtx.save();
    emissiveCtx.beginPath();
    emissiveCtx.arc(center, center, radius * 0.18, 0, Math.PI * 2);
    emissiveCtx.fillStyle = centerColor;
    emissiveCtx.shadowColor = centerColor;
    emissiveCtx.shadowBlur = size * 0.1;
    emissiveCtx.fill();
    emissiveCtx.restore();

    // --- Color Map ---
    mapCtx.fillStyle = baseColor; // Dark coppery brown
    mapCtx.fillRect(0, 0, size, size);
    
    // Copper fins
    const finCount = 72;
    const finInnerRadius = radius * 0.25;
    const finOuterRadius = radius * 0.78;
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
        mapCtx.lineWidth = 3;
        mapCtx.stroke();
    }

    // Central dark area
    mapCtx.beginPath();
    mapCtx.arc(center, center, finInnerRadius, 0, Math.PI * 2);
    mapCtx.fillStyle = '#000000';
    mapCtx.fill();


    const map = new THREE.CanvasTexture(mapCanvas);
    const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);

    return { map, emissiveMap };
}

function generateVortexTexture(color1: string, color2: string) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    const center = size / 2;

    const c1 = new THREE.Color(color1); // Bright yellow
    const c2 = new THREE.Color(color2); // Dark base

    const numLines = 72;
    const swirlFactor = 5;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - center;
            const dy = y - center;
            const r = Math.sqrt(dx * dx + dy * dy);
            const normR = r / center;

            if (normR > 1.0) continue;

            const theta = Math.atan2(dy, dx);
            
            const distortedR = Math.pow(normR, 0.75);
            const swirledTheta = theta + distortedR * swirlFactor;
            
            const lines = (Math.sin(swirledTheta * numLines) * 0.5 + 0.5);
            const lineIntensity = lines > 0.95 ? 1.0 : 0.4;

            const radialGlow = Math.pow(1.0 - normR, 2.0);
            
            let finalColor = new THREE.Color().lerpColors(c2, c1, radialGlow);
            finalColor.multiplyScalar(lineIntensity);

            if (x < center) {
                const fade = Math.max(0, Math.min(1, (x - (center - 2)) / 2)); // Fast smoothstep
                finalColor.multiplyScalar(fade * 0.5 + 0.1);
            }
            
            const index = (y * size + x) * 4;
            data[index] = finalColor.r * 255;
            data[index + 1] = finalColor.g * 255;
            data[index + 2] = finalColor.b * 255;
            data[index + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    // Reflection
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(center, center * 1.55, center * 0.9, center * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 5, 0, 0.5)';
    ctx.fill();
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return { map: texture, emissiveMap: texture };
}

interface DeflectorDishProps {
    params: ShipParameters;
}

export const DeflectorDish: React.FC<DeflectorDishProps> = ({ params }) => {
    
    const textures = useMemo(() => {
        if (params.engineering_dishType === 'Movie Refit') {
            return generateMovieRefitTexture(params.engineering_dishColor1, params.engineering_dishColor2, '#FFFFFF', '#181008');
        }
        if (params.engineering_dishType === 'Advanced Refit') {
            return generateMovieRefitTexture(params.engineering_dishColor1, params.engineering_dishColor2, params.engineering_dishColor3, params.engineering_dishColor4);
        }
        if (params.engineering_dishType === 'Vortex') {
            return generateVortexTexture(params.engineering_dishColor1, params.engineering_dishColor2);
        }
        return null;
    }, [params.engineering_dishType, params.engineering_dishColor1, params.engineering_dishColor2, params.engineering_dishColor3, params.engineering_dishColor4]);

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
        />
    )
};