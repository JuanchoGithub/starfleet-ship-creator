
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Box } from '@react-three/drei';

const BussardTOS: React.FC<{ p: any; material: THREE.Material, mirrored: boolean }> = ({ p, material, mirrored }) => {
    const { outerShellGeo, innerCoreGeo, bussardRearGeo } = useMemo(() => {
        const createBussardDome = (radiusScale: number) => {
            const bussardPoints: THREE.Vector2[] = [];
            const bussardPointCount = 32;
            const bussardOuterRadius = p.radius * p.bussardRadius * radiusScale;

            bussardPoints.push(new THREE.Vector2(bussardOuterRadius, p.length));

            for (let i = bussardPointCount; i >= 0; i--) {
                const progress = i / bussardPointCount;
                const rOuter = Math.pow(progress, 0.35) * bussardOuterRadius;
                const yOuter = p.length * 1.01 + p.bussardCurvature * (1 - progress) * bussardOuterRadius * 1.5;
                bussardPoints.push(new THREE.Vector2(rOuter, yOuter));
            }

            const geo = new THREE.LatheGeometry(bussardPoints, Math.floor(p.segments));
            
            geo.scale(p.widthRatio * p.bussardWidthRatio, 1, 1);
            const bussardSkewMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,p.bussardSkewVertical,0, 0,0,1,0, 0,0,0,1);
            geo.applyMatrix4(bussardSkewMatrix);
            geo.computeVertexNormals();
            return geo;
        };

        const baseOuterShellGeo = createBussardDome(1.0);
        const baseInnerCoreGeo = createBussardDome(0.8);
        const baseBussardRearGeo = baseOuterShellGeo.clone().rotateX(Math.PI).scale(1, 4, 1).translate(0, 5 * p.length, 0);

        const mirrorGeo = (geo: THREE.BufferGeometry) => {
            if (!mirrored) return geo;
            const clonedGeo = geo.clone();
            const uvs = clonedGeo.attributes.uv.array as Float32Array;
            for (let i = 0; i < uvs.length; i += 2) {
                uvs[i] = 1.0 - uvs[i];
            }
            clonedGeo.attributes.uv.needsUpdate = true;
            return clonedGeo;
        };

        return { 
            outerShellGeo: mirrorGeo(baseOuterShellGeo),
            innerCoreGeo: mirrorGeo(baseInnerCoreGeo),
            bussardRearGeo: mirrorGeo(baseBussardRearGeo)
        };
    }, [p.radius, p.bussardRadius, p.length, p.bussardCurvature, p.segments, p.widthRatio, p.bussardWidthRatio, p.bussardSkewVertical, mirrored]);
    
    const outerShellMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffccaa'),
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        metalness: 0.2,
        side: THREE.FrontSide,
    }), []);

    useEffect(() => {
        outerShellMaterial.color.set(p.bussardColor1);
        outerShellMaterial.opacity = p.bussardShellOpacity;
    }, [outerShellMaterial, p.bussardColor1, p.bussardShellOpacity]);

    const maxRadius = p.radius * p.bussardRadius * 0.8; // Adjusted for smaller inner core
    
    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            numVanes: { value: 5.0 },
            maxRadius: { value: maxRadius },
            colorCore: { value: new THREE.Color(p.bussardColor2) },
            colorEdge: { value: new THREE.Color(p.bussardColor3) },
            vaneLength: { value: p.bussardVaneLength },
            glowIntensity: { value: 2.0 },
        },
        transparent: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        vertexShader: `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float numVanes;
            uniform float maxRadius;
            uniform vec3 colorCore;
            uniform vec3 colorEdge;
            uniform float vaneLength;
            uniform float glowIntensity;
            varying vec3 vPosition;
          
            // Simple 2D noise for turbulence (gaseous feel)
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float noise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              float a = hash(i);
              float b = hash(i + vec2(1.0, 0.0));
              float c = hash(i + vec2(0.0, 1.0));
              float d = hash(i + vec2(1.0, 1.0));
              vec2 u = f * f * (3.0 - 2.0 * f);
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
          
            void main() {
              // Geometry-aware radial distance for better taper on lathe dome
              float rawR = length(vPosition.xz);
              float r = rawR / maxRadius;
          
              // Proper spherical polar coordinates for better coverage (adapted for Y-axis lathe geometry)
              vec3 pos = normalize(vPosition); // Approximate unit sphere for polar coords
              float phi = acos(pos.y);
              float theta = atan(pos.z, pos.x);
          
              // Core spin: Constant rotation on theta (simplified, direct addition for identical wrapping)
              float spinSpeed = 15.0;
              theta += time * spinSpeed;
          
              // Spinning vanes: Simple distinct blades without harmonics
              float falloff = 1.0 / (vaneLength * 2.0);
              float vanes = abs(sin(theta * numVanes)) * (1.0 - r * falloff) + 0.5;
          
              // Turbulence: Slow, low-amp with restored time drift for gaseous diffusion
              float turb = noise(vec2(theta * 0.2, r * 4.0 + time * 0.2)) * 0.1;
              vanes += turb * (1.0 - r);
          
              // Glow gradient: Pure red to deep orange (no yellow)
              float glow = 1.0 - r;
              glow *= (sin(time * 1.0) * 0.1 + 0.9);
              vec3 color = mix(colorEdge, colorCore, glow);

              // FIX: The original author noted yellow caused issues. High-intensity yellow
              // combined with bloom can create green artifacts. This line clamps the
              // green channel to enforce the intended red/orange visual style.
              color.g *= 0.5;

              color *= vanes * glow * glowIntensity;
          
              // Opaque: Alpha always 1.0
              float alpha = 1.0;
          
              gl_FragColor = vec4(color, alpha);
            }
        `
    }), [maxRadius, p.bussardColor2, p.bussardColor3, p.bussardVaneLength]);

    useEffect(() => {
        shaderMaterial.uniforms.numVanes.value = p.bussardVaneCount || 5.0;
        shaderMaterial.uniforms.maxRadius.value = maxRadius;
        shaderMaterial.uniforms.colorCore.value.set(p.bussardColor2);
        shaderMaterial.uniforms.colorEdge.value.set(p.bussardColor3);
        shaderMaterial.uniforms.vaneLength.value = p.bussardVaneLength;
        shaderMaterial.uniforms.glowIntensity.value = p.bussardGlowIntensity;
    }, [shaderMaterial, p.bussardVaneCount, maxRadius, p.bussardColor2, p.bussardColor3, p.bussardVaneLength, p.bussardGlowIntensity]);

    useFrame(({ clock }) => {
        shaderMaterial.uniforms.time.value = clock.getElapsedTime() * p.bussardAnimSpeed;
    });

    return (
        <group>
            <mesh name="Bussard_Rear_Casing" geometry={bussardRearGeo} material={material} castShadow receiveShadow />
            <mesh name="Bussard_Outer_Shell" geometry={outerShellGeo} material={outerShellMaterial} castShadow />
            <mesh name="Bussard_Inner_Core" geometry={innerCoreGeo} material={shaderMaterial} castShadow />
        </group>
    );
};

const BussardTNGSwirl: React.FC<{ p: any; material: THREE.Material, mirrored: boolean }> = ({ p, material, mirrored }) => {
    const { outerShellGeo, innerCoreGeo, bussardRearGeo } = useMemo(() => {
        const createBussardDome = (radiusScale: number) => {
            const bussardPoints: THREE.Vector2[] = [];
            const bussardPointCount = 32;
            const bussardOuterRadius = p.radius * p.bussardRadius * radiusScale;

            bussardPoints.push(new THREE.Vector2(bussardOuterRadius, p.length));

            for (let i = bussardPointCount; i >= 0; i--) {
                const progress = i / bussardPointCount;
                const rOuter = Math.pow(progress, 0.35) * bussardOuterRadius;
                const yOuter = p.length * 1.01 + p.bussardCurvature * (1 - progress) * bussardOuterRadius * 1.5;
                bussardPoints.push(new THREE.Vector2(rOuter, yOuter));
            }

            const geo = new THREE.LatheGeometry(bussardPoints, Math.floor(p.segments));
            
            geo.scale(p.widthRatio * p.bussardWidthRatio, 1, 1);
            const bussardSkewMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,p.bussardSkewVertical,0, 0,0,1,0, 0,0,0,1);
            geo.applyMatrix4(bussardSkewMatrix);
            geo.computeVertexNormals();
            return geo;
        };

        const baseOuterShellGeo = createBussardDome(1.0);
        const baseInnerCoreGeo = createBussardDome(0.8);
        const baseBussardRearGeo = baseOuterShellGeo.clone().rotateX(Math.PI).scale(1, 4, 1).translate(0, 5 * p.length, 0);

        const mirrorGeo = (geo: THREE.BufferGeometry) => {
            if (!mirrored) return geo;
            const clonedGeo = geo.clone();
            const uvs = clonedGeo.attributes.uv.array as Float32Array;
            for (let i = 0; i < uvs.length; i += 2) {
                uvs[i] = 1.0 - uvs[i];
            }
            clonedGeo.attributes.uv.needsUpdate = true;
            return clonedGeo;
        };

        return { 
            outerShellGeo: mirrorGeo(baseOuterShellGeo),
            innerCoreGeo: mirrorGeo(baseInnerCoreGeo),
            bussardRearGeo: mirrorGeo(baseBussardRearGeo)
        };
    }, [p.radius, p.bussardRadius, p.length, p.bussardCurvature, p.segments, p.widthRatio, p.bussardWidthRatio, p.bussardSkewVertical, mirrored]);
    
    const outerShellMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffccaa'),
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        metalness: 0.2,
        side: THREE.FrontSide,
    }), []);

    useEffect(() => {
        outerShellMaterial.color.set(p.bussardColor1);
        outerShellMaterial.opacity = p.bussardShellOpacity;
    }, [outerShellMaterial, p.bussardColor1, p.bussardShellOpacity]);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            subtleVanes: { value: 1.0 },
            colorCore: { value: new THREE.Color(p.bussardColor3) },
            colorEdge: { value: new THREE.Color(p.bussardColor2) },
            glowIntensity: { value: 1.4 },
        },
        transparent: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        vertexShader: `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float subtleVanes;
            uniform vec3 colorCore;
            uniform vec3 colorEdge;
            uniform float glowIntensity;
            varying vec3 vPosition;
        
            // Periodic noise for seamless theta wrapping (value noise with period 1 in x)
            float hash(vec2 p) { 
                p = fract(p);
                p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
                return -1.0 + 2.0 * fract(sin(p.x) * 43758.5453123);
            }
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                float n = mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                return 0.5 + 0.5 * n; // [0,1] range
            }
            float fbm(vec2 p) { // Reduced octaves for less "multiplication"
                float v = 0.0;
                float a = 0.5;
                for (int i = 0; i < 2; ++i) { // Only 2 octaves to prevent fine buildup
                    v += a * noise(p);
                    p *= 2.0;
                    a *= 0.5;
                }
                return v;
            }
        
            void main() {
                // Adapted for Y-up LatheGeometry from SphereGeometry
                vec3 pos = normalize(vPosition);
                float phi = acos(pos.y);
                float theta = (atan(pos.z, pos.x) + 3.14159265) / 6.2831853; // Proper [0,1) wrap for x/z plane
                
                float r = sin(phi); // 0 at poles (y-axis), 1 at equator (xz-plane)
                
                // Subtle core rotation: Theta-only, uniform speed (no r-dependency to prevent shearing)
                float spinSpeed = 8.0;
                float rotatedTheta = fract(theta + (time * spinSpeed / 6.2831853));
                
                // Plasma intake: Pure angular swirl with static radial structure
                vec2 swirl = vec2(rotatedTheta * 8.0, r * 3.0); // Higher theta scale for finer rotation, low r for broad wisps
                float plasma = fbm(swirl) * (1.0 - r * 0.5); // Fade to edge, no time in r
                
                // Faint streaks: Use uniform rotatedTheta for consistent, non-shearing rotation
                float streaks = subtleVanes * (0.5 + 0.5 * sin(rotatedTheta * 6.2831853 * 3.0)) * 0.3 * (1.0 - r);
                
                // Glow: Softer gradient for diffused look
                float glow = 1.0 - r * 0.4;
                glow *= (sin(time * 0.8) * 0.1 + 0.9);
                vec3 color = mix(colorEdge, colorCore, glow);
                color *= (plasma + streaks + 0.6) * glow * glowIntensity; // Balanced layering
                
                float alpha = 1.0;
                gl_FragColor = vec4(color, alpha);
            }
        `
    }), [p.bussardColor3, p.bussardColor2]);

    useEffect(() => {
        shaderMaterial.uniforms.subtleVanes.value = p.bussardSubtleVanes ? 1.0 : 0.0;
        shaderMaterial.uniforms.colorCore.value.set(p.bussardColor3);
        shaderMaterial.uniforms.colorEdge.value.set(p.bussardColor2);
        shaderMaterial.uniforms.glowIntensity.value = p.bussardGlowIntensity;
    }, [shaderMaterial, p.bussardSubtleVanes, p.bussardColor3, p.bussardColor2, p.bussardGlowIntensity]);

    useFrame(({ clock }) => {
        shaderMaterial.uniforms.time.value = clock.getElapsedTime() * p.bussardAnimSpeed;
    });

    return (
        <group>
            <mesh name="Bussard_Rear_Casing" geometry={bussardRearGeo} material={material} castShadow receiveShadow />
            <mesh name="Bussard_Outer_Shell" geometry={outerShellGeo} material={outerShellMaterial} castShadow />
            <mesh name="Bussard_Inner_Core" geometry={innerCoreGeo} material={shaderMaterial} castShadow />
        </group>
    );
};

const BussardTNG: React.FC<{ p: any }> = ({ p }) => {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    useFrame(({ clock }) => {
        if (materialRef.current) {
             const pulse = (Math.sin(clock.getElapsedTime() * p.bussardAnimSpeed) + 1) / 2;
             materialRef.current.emissiveIntensity = p.bussardGlowIntensity * (0.5 + pulse * 0.5);
        }
    });

    return (
        <group position-y={p.length - p.radius * p.bussardRadius * 0.2}>
            <RoundedBox name="Bussard_Casing" args={[p.radius * 2.2 * p.bussardWidthRatio, p.radius * 1.5 * p.bussardRadius, p.radius * 1.5 * p.bussardRadius ]} radius={p.radius * p.bussardRadius * 0.7} smoothness={4} castShadow receiveShadow>
                <meshStandardMaterial ref={materialRef} color={p.bussardColor2} emissive={p.bussardColor2} emissiveIntensity={p.bussardGlowIntensity} roughness={0.1} />
            </RoundedBox>
        </group>
    );
};

const BussardRadiator: React.FC<{ p: any }> = ({ p }) => {
    const fins = useMemo(() => Array.from({ length: 10 }), []);
    return (
        <group name="Radiator_Assembly" position-y={p.length + p.radius * p.bussardRadius * 0.8}>
            {fins.map((_, i) => (
                <Box key={i} name={`Radiator_Fin_${i}`} args={[p.radius * 1.8 * p.widthRatio * p.bussardWidthRatio, 0.1, p.radius * 1.8 * p.bussardRadius]} position-y={-i * 0.2 * p.bussardRadius} castShadow receiveShadow>
                     <meshStandardMaterial color={p.bussardColor1} emissive={p.bussardColor2} emissiveIntensity={p.bussardGlowIntensity} roughness={0.4}/>
                </Box>
            ))}
        </group>
    );
};

interface BussardCollectorProps {
    params: any;
    material: THREE.Material;
    mirrored?: boolean;
}

export const BussardCollector: React.FC<BussardCollectorProps> = ({ params, material, mirrored }) => {
    switch (params.bussardType) {
        case 'TNG Swirl': return <BussardTNGSwirl p={params} material={material} mirrored={!!mirrored} />;
        case 'TNG': return <BussardTNG p={params} />;
        case 'Radiator': return <BussardRadiator p={params} />;
        case 'TOS':
        default: return <BussardTOS p={params} material={material} mirrored={!!mirrored} />;
    }
}