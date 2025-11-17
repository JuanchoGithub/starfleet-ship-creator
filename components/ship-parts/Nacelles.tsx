



import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { BussardCollector } from './BussardCollector';
import { useFrame } from '@react-three/fiber';

const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uIntensity;
    uniform float uAnimSpeed;
    uniform float uAnimType; // 0: Flow, 1: Pulse, 2: Plasma
    uniform float uSoftness;
    uniform float uBaseGlow;
    uniform float uLineCount;
    uniform float uOrientation; // 0.0 for Horizontal, 1.0 for Vertical

    varying vec2 vUv;

    // Hash function for pseudo-randomness
    float hash1(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
        vec2 uv = vUv;

        vec3 baseColor = uColor3;
        vec3 finalColor = baseColor;

        if (uAnimType == 0.0) { // Flow
            float pulse = (sin(uTime * 2.0) * 0.5 + 0.5) * 0.5 + 0.5; // 0.5 to 1
            
            float lineSpeed = -10.0 * uAnimSpeed;
            
            float linePattern = sin(uv.y * uLineCount + uTime * lineSpeed);

            float edge0 = 0.8;
            float edge1 = edge0 + (uSoftness * 0.18) + 0.02; // Range from 0.02 (sharp) to 0.2 (soft)
            
            float lines = smoothstep(edge0, edge1, linePattern);
            float glow = lines * uIntensity * pulse;
            
            vec3 color = mix(uColor1, uColor2, fract(uv.y * 5.0 + uTime * uAnimSpeed));
            vec3 glowingBase = baseColor * (1.0 + uBaseGlow);
            finalColor = mix(glowingBase, color, glow);
        } else if (uAnimType == 1.0) { // Pulse
            float pulse = (sin(uv.y * 20.0 - uTime * 5.0 * uAnimSpeed) * 0.5 + 0.5);
            float overallPulse = (sin(uTime * 3.0 * uAnimSpeed) * 0.5 + 0.5);
            float glow = pulse * overallPulse;

            vec3 color = mix(uColor1, uColor2, pulse);
            finalColor = mix(baseColor, color, glow * uIntensity);
        } else if (uAnimType == 2.0) { // Plasma Balls
            float totalGlow = 0.0;
            for (float i = 1.0; i <= 3.0; i += 1.0) {
                float speed = (0.8 + i * 0.2) * uAnimSpeed * 0.2;
                vec2 gridUv = fract(uv * vec2(3.0 * i, 7.0) + vec2(0.0, uTime * speed));
                vec2 cellId = floor(uv * vec2(3.0 * i, 7.0) - vec2(0.0, uTime * speed));

                float rand = hash1(cellId);
                if (rand > 0.7) {
                    vec2 center = vec2(0.5, 0.5);
                    center.x += sin(uTime * 0.2 + cellId.y * 1.5) * 0.3; // Wobble
                    
                    float dist = distance(gridUv, center);
                    float radius = (0.2 + hash1(cellId + 10.0) * 0.2); // Random radius
                    
                    float ball = smoothstep(radius, radius * 0.5, dist);
                    totalGlow += ball * 0.5;
                }
            }
            totalGlow = clamp(totalGlow, 0.0, 1.0);
            vec3 color = mix(uColor1, uColor2, totalGlow);
            finalColor = mix(baseColor, color, totalGlow * uIntensity);
        } else if (uAnimType == 3.0) { // Linear Bands
            vec2 coord = vUv;
            if (uOrientation == 1.0) {
                coord = vec2(vUv.y, vUv.x);
            }
            
            // Create a repeating ramp for each band
            float ramp = fract(coord.x * uLineCount);
            
            // Define the width of the bright part of the band (e.g., 60% of the space)
            float band_width = 0.6;
            
            // Use smoothstep to create the bands with soft edges.
            // This creates a "box" pulse instead of a sine wave.
            float softness = 0.05 + uSoftness * 0.1;
            float lines = smoothstep(0.0, softness, ramp) - smoothstep(band_width, band_width + softness, ramp);
            
            // Add a subtle, fast-moving shimmer within the bands
            float shimmer = (sin(coord.y * 300.0 + uTime * uAnimSpeed * 20.0) * 0.5 + 0.5) * 0.15 + 0.85; // Varies brightness from 85% to 100%
            
            // The final glow is the band shape, modulated by the shimmer and master intensity
            float glow = lines * shimmer * uIntensity;
            
            vec3 bandColor = uColor1;
            // Start with a dark base color, possibly with a faint ambient glow
            vec3 ambient = baseColor * (uBaseGlow * 0.2); 
            
            // Additively blend the bright band color
            finalColor = ambient + bandColor * glow;
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const ANIM_TYPE_MAP = {
    'Flow': 0.0,
    'Pulse': 1.0,
    'Plasma Balls': 2.0,
    'Linear Bands': 3.0,
};

interface NacelleAssemblyProps {
    nacelleGeo: THREE.BufferGeometry;
    mirrored: boolean;
    assemblyParams: any;
    material: THREE.Material;
    grillMaterial: THREE.ShaderMaterial;
}

const NacelleAssembly: React.FC<NacelleAssemblyProps> = ({ nacelleGeo, mirrored, assemblyParams, material, grillMaterial }) => {
    
    useFrame(({ clock }) => {
        if (assemblyParams.grill_toggle && grillMaterial?.uniforms) {
            grillMaterial.uniforms.uTime.value = clock.getElapsedTime();
            grillMaterial.uniforms.uAnimSpeed.value = assemblyParams.grill_animSpeed * (mirrored ? -1 : 1);
            grillMaterial.uniforms.uColor1.value.set(assemblyParams.grill_color1);
            grillMaterial.uniforms.uColor2.value.set(assemblyParams.grill_color2);
            grillMaterial.uniforms.uColor3.value.set(assemblyParams.grill_color3);
            grillMaterial.uniforms.uIntensity.value = assemblyParams.grill_intensity;
            grillMaterial.uniforms.uAnimType.value = ANIM_TYPE_MAP[assemblyParams.grill_anim_type as keyof typeof ANIM_TYPE_MAP] || 0.0;
            grillMaterial.uniforms.uOrientation.value = assemblyParams.grill_orientation === 'Vertical' ? 1.0 : 0.0;
            grillMaterial.uniforms.uSoftness.value = assemblyParams.grill_softness;
            grillMaterial.uniforms.uBaseGlow.value = assemblyParams.grill_base_glow;
            grillMaterial.uniforms.uLineCount.value = assemblyParams.grill_line_count;
        }
    });

    return (
        <group name="Nacelle_Assembly" rotation={[-Math.PI / 2, 0, 0]}>
            <mesh 
                name="Nacelle_Body" 
                geometry={nacelleGeo} 
                material={assemblyParams.grill_toggle ? [material, grillMaterial] : material} 
                castShadow 
                receiveShadow 
            />
            <group name="Bussard_Collector" position={[0, assemblyParams.bussardYOffset, assemblyParams.bussardZOffset]}>
                <BussardCollector params={assemblyParams} material={material} mirrored={mirrored} />
            </group>
        </group>
    );
};

interface NacellePairProps {
    x: number; z: number; y: number; rotation: number;
    portNacelleGeo: THREE.BufferGeometry;
    starboardNacelleGeo: THREE.BufferGeometry;
    params: any;
    material: THREE.Material;
    portName: string;
    starboardName: string;
}

const NacellePair: React.FC<NacellePairProps> = (props) => {
    const { x, z, y, rotation, portNacelleGeo, starboardNacelleGeo, params, material, portName, starboardName } = props;

    const starboardParams = useMemo(() => ({
        ...params,
        bussardAnimSpeed: -params.bussardAnimSpeed,
    }), [params]);

    const grillMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(params.grill_color1) },
            uColor2: { value: new THREE.Color(params.grill_color2) },
            uColor3: { value: new THREE.Color(params.grill_color3) },
            uIntensity: { value: params.grill_intensity },
            uAnimSpeed: { value: params.grill_animSpeed },
            uAnimType: { value: 0.0 },
            uOrientation: { value: 0.0 },
            uSoftness: { value: params.grill_softness },
            uBaseGlow: { value: params.grill_base_glow },
            uLineCount: { value: params.grill_line_count },
        },
        vertexShader,
        fragmentShader,
    }), []);

    return (
        <>
            <group name={portName} position={[-x, z, y]} rotation={[0, 0, rotation]}>
                <NacelleAssembly mirrored={true} assemblyParams={params} grillMaterial={grillMaterial} nacelleGeo={portNacelleGeo} material={material} />
            </group>
            <group name={starboardName} position={[x, z, y]} rotation={[0, 0, -rotation]}>
                <NacelleAssembly mirrored={false} assemblyParams={starboardParams} grillMaterial={grillMaterial} nacelleGeo={starboardNacelleGeo} material={material} />
            </group>
        </>
    );
};


export const Nacelles: React.FC<{ params: ShipParameters, material: THREE.Material }> = ({ params, material }) => {

    const generateNacelleGeometries = (
        nacelleParams: any, grillParams: any
    ) => {
        const {
            length, radius, widthRatio, foreTaper, aftTaper, foreCurve, aftCurve,
            segments, skew, slant,
            undercut_top, undercut_top_start, undercut_top_curve,
            undercut_bottom, undercut_bottom_start, undercut_bottom_curve,
            undercut_inward, undercut_inward_start, undercut_inward_curve,
            undercut_outward, undercut_outward_start, undercut_outward_curve,
        } = nacelleParams;

        const nacellePoints: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
        const pointCount = 40;
        for (let i = 0; i <= pointCount; i++) {
            const p = i / pointCount;
            const taper = THREE.MathUtils.lerp(foreTaper, aftTaper, p);
            const shapePower = THREE.MathUtils.lerp(aftCurve, foreCurve, p);
            const shape = Math.pow(Math.sin(p * Math.PI / 2), shapePower) * 0.5 + 0.5;

            nacellePoints.push(new THREE.Vector2(
                shape * radius * taper, 
                p * length
            ));
        }
        nacellePoints.push(new THREE.Vector2(0, length));
        
        const nacelleGeo = new THREE.LatheGeometry(nacellePoints, Math.floor(segments));
        
        nacelleGeo.scale(widthRatio, 1, 1);

        // --- Apply Deformations ---
        const positions = nacelleGeo.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            const x_orig = positions[i * 3];
            const y_orig = positions[i * 3 + 1]; // Length axis
            const z_orig = positions[i * 3 + 2];
            
            let newX = x_orig;
            let newZ = z_orig;
    
            // Vertical Skew
            newZ += y_orig * skew;
            // Horizontal Slant
            newX += y_orig * slant;
    
            const progress = y_orig / length;
    
            // Undercuts
            // Top (+Z in local space)
            if (z_orig > 0 && undercut_top > 0 && progress >= undercut_top_start) {
                const p = (progress - undercut_top_start) / (1 - undercut_top_start);
                const scale = 1.0 - (Math.pow(p, undercut_top_curve) * undercut_top);
                newZ *= scale;
            }
            // Bottom (-Z)
            if (z_orig < 0 && undercut_bottom > 0 && progress >= undercut_bottom_start) {
                 const p = (progress - undercut_bottom_start) / (1 - undercut_bottom_start);
                const scale = 1.0 - (Math.pow(p, undercut_bottom_curve) * undercut_bottom);
                newZ *= scale;
            }
            // Inward (-X, for starboard nacelle)
            if (x_orig < 0 && undercut_inward > 0 && progress >= undercut_inward_start) {
                 const p = (progress - undercut_inward_start) / (1 - undercut_inward_start);
                const scale = 1.0 - (Math.pow(p, undercut_inward_curve) * undercut_inward);
                newX *= scale;
            }
            // Outward (+X)
             if (x_orig > 0 && undercut_outward > 0 && progress >= undercut_outward_start) {
                 const p = (progress - undercut_outward_start) / (1 - undercut_outward_start);
                const scale = 1.0 - (Math.pow(p, undercut_outward_curve) * undercut_outward);
                newX *= scale;
            }
    
            positions[i * 3] = newX;
            positions[i * 3 + 2] = newZ;
        }
        nacelleGeo.attributes.position.needsUpdate = true;
        nacelleGeo.computeVertexNormals();

        if (grillParams.toggle) {
            nacelleGeo.clearGroups();
            const uvs = nacelleGeo.attributes.uv.array;
            const indices = nacelleGeo.index!.array;
            const grillFaces: number[] = [];
            const hullFaces: number[] = [];

            const isVertexInGrill = (u: number, v: number) => {
                // Skew V based on U's horizontal position
                const v_skewed = v + (u - 0.5) * grillParams.skew * -1;
            
                // Define grill V bounds
                const grillCenterV = 0.5 + grillParams.vertical_offset / length;
                const grillLengthV = (length * 0.7 * grillParams.length) / length;
                const grillStartV = grillCenterV - grillLengthV / 2;
                const grillEndV = grillCenterV + grillLengthV / 2;
            
                if (v_skewed < grillStartV || v_skewed > grillEndV) return false;
            
                // Define grill U bounds
                const grillWidthU = (0.25 * grillParams.width) / 2.0;
                const grillCenterU_Port = 0.75;
                const grillCenterU_Starboard = 0.25;
                const rotationOffset = grillParams.rotation / (2.0 * Math.PI);
                
                const rotatedU = THREE.MathUtils.euclideanModulo(u + rotationOffset, 1.0);
            
                const inPortBand = Math.abs(rotatedU - grillCenterU_Port) < grillWidthU;
                const inStarboardBand = Math.abs(rotatedU - grillCenterU_Starboard) < grillWidthU;
            
                if (!inPortBand && !inStarboardBand) return false;
            
                // Handle rounding
                const rounding = grillParams.rounding;
                if (rounding > 0.01) {
                    const roundingRadiusV = grillLengthV * 0.5 * rounding;
                    if (roundingRadiusV > 0.001) {
                        const uDist = inPortBand ? Math.abs(rotatedU - grillCenterU_Port) : Math.abs(rotatedU - grillCenterU_Starboard);
                        
                        // Check bottom rounded corner
                        if (v_skewed < grillStartV + roundingRadiusV) {
                            const vDist = (grillStartV + roundingRadiusV) - v_skewed;
                            if (Math.sqrt(Math.pow(uDist / grillWidthU, 2) + Math.pow(vDist / roundingRadiusV, 2)) > 1) {
                                return false;
                            }
                        } 
                        // Check top rounded corner
                        else if (v_skewed > grillEndV - roundingRadiusV) {
                            const vDist = v_skewed - (grillEndV - roundingRadiusV);
                             if (Math.sqrt(Math.pow(uDist / grillWidthU, 2) + Math.pow(vDist / roundingRadiusV, 2)) > 1) {
                                return false;
                            }
                        }
                    }
                }
                
                return true;
            };

            for (let i = 0; i < indices.length; i += 3) {
                const iA = indices[i];
                const iB = indices[i+1];
                const iC = indices[i+2];

                const isGrillFace = 
                    isVertexInGrill(uvs[iA * 2], uvs[iA * 2 + 1]) &&
                    isVertexInGrill(uvs[iB * 2], uvs[iB * 2 + 1]) &&
                    isVertexInGrill(uvs[iC * 2], uvs[iC * 2 + 1]);
                
                if (isGrillFace) {
                    grillFaces.push(iA, iB, iC);
                } else {
                    hullFaces.push(iA, iB, iC);
                }
            }
            
            const newIndices = new Uint32Array(hullFaces.length + grillFaces.length);
            newIndices.set(hullFaces, 0);
            newIndices.set(grillFaces, hullFaces.length);
            nacelleGeo.setIndex(new THREE.BufferAttribute(newIndices, 1));
            
            nacelleGeo.addGroup(0, hullFaces.length, 0);
            if (grillFaces.length > 0) {
                nacelleGeo.addGroup(hullFaces.length, grillFaces.length, 1);
            }
        }
        
        return { nacelleGeo };
    };

    const upperNacelleGeos = useMemo(() => {
        if (!params.nacelle_toggle) return null;
        const { nacelleGeo: starboardGeo } = generateNacelleGeometries(
            {
                length: params.nacelle_length, radius: params.nacelle_radius, widthRatio: params.nacelle_widthRatio,
                foreTaper: params.nacelle_foreTaper, aftTaper: params.nacelle_aftTaper,
                foreCurve: params.nacelle_foreCurve, aftCurve: params.nacelle_aftCurve,
                segments: params.nacelle_segments, skew: params.nacelle_skew, slant: params.nacelle_slant,
                undercut_top: params.nacelle_undercut_top, undercut_top_start: params.nacelle_undercut_top_start, undercut_top_curve: params.nacelle_undercut_top_curve,
                undercut_bottom: params.nacelle_undercut_bottom, undercut_bottom_start: params.nacelle_undercut_bottom_start, undercut_bottom_curve: params.nacelle_undercut_bottom_curve,
                undercut_inward: params.nacelle_undercut_inward, undercut_inward_start: params.nacelle_undercut_inward_start, undercut_inward_curve: params.nacelle_undercut_inward_curve,
                undercut_outward: params.nacelle_undercut_outward, undercut_outward_start: params.nacelle_undercut_outward_start, undercut_outward_curve: params.nacelle_undercut_outward_curve,
            },
            {
                toggle: params.nacelle_grill_toggle,
                length: params.nacelle_grill_length,
                width: params.nacelle_grill_width,
                vertical_offset: params.nacelle_grill_vertical_offset,
                rotation: params.nacelle_grill_rotation,
                rounding: params.nacelle_grill_rounding,
                skew: params.nacelle_grill_skew,
            }
        );

        const portGeo = starboardGeo.clone();
        const uvs = portGeo.attributes.uv.array as Float32Array;
        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = 1.0 - uvs[i];
        }
        portGeo.attributes.uv.needsUpdate = true;

        return { portGeo, starboardGeo };
    }, [
        params.nacelle_toggle, params.nacelle_length, params.nacelle_radius, params.nacelle_widthRatio, params.nacelle_foreTaper, params.nacelle_aftTaper, 
        params.nacelle_foreCurve, params.nacelle_aftCurve, params.nacelle_segments, params.nacelle_skew, params.nacelle_slant,
        params.nacelle_undercut_top, params.nacelle_undercut_top_start, params.nacelle_undercut_top_curve,
        params.nacelle_undercut_bottom, params.nacelle_undercut_bottom_start, params.nacelle_undercut_bottom_curve,
        params.nacelle_undercut_inward, params.nacelle_undercut_inward_start, params.nacelle_undercut_inward_curve,
        params.nacelle_undercut_outward, params.nacelle_undercut_outward_start, params.nacelle_undercut_outward_curve,
        params.nacelle_grill_toggle, params.nacelle_grill_length, params.nacelle_grill_width, params.nacelle_grill_vertical_offset, params.nacelle_grill_rotation,
        params.nacelle_grill_rounding, params.nacelle_grill_skew
    ]);

    const lowerNacelleGeos = useMemo(() => {
        if (!params.nacelleLower_toggle) return null;
        const { nacelleGeo: starboardGeo } = generateNacelleGeometries(
            {
                length: params.nacelleLower_length, radius: params.nacelleLower_radius, widthRatio: params.nacelleLower_widthRatio,
                foreTaper: params.nacelleLower_foreTaper, aftTaper: params.nacelleLower_aftTaper,
                foreCurve: params.nacelleLower_foreCurve, aftCurve: params.nacelleLower_aftCurve,
                segments: params.nacelleLower_segments, skew: params.nacelleLower_skew, slant: params.nacelleLower_slant,
                undercut_top: params.nacelleLower_undercut_top, undercut_top_start: params.nacelleLower_undercut_top_start, undercut_top_curve: params.nacelleLower_undercut_top_curve,
                undercut_bottom: params.nacelleLower_undercut_bottom, undercut_bottom_start: params.nacelleLower_undercut_bottom_start, undercut_bottom_curve: params.nacelleLower_undercut_bottom_curve,
                undercut_inward: params.nacelleLower_undercut_inward, undercut_inward_start: params.nacelleLower_undercut_inward_start, undercut_inward_curve: params.nacelleLower_undercut_inward_curve,
                undercut_outward: params.nacelleLower_undercut_outward, undercut_outward_start: params.nacelleLower_undercut_outward_start, undercut_outward_curve: params.nacelleLower_undercut_outward_curve,
            },
            {
                toggle: params.nacelleLower_grill_toggle,
                length: params.nacelleLower_grill_length,
                width: params.nacelleLower_grill_width,
                vertical_offset: params.nacelleLower_grill_vertical_offset,
                rotation: params.nacelleLower_grill_rotation,
                rounding: params.nacelleLower_grill_rounding,
                skew: params.nacelleLower_grill_skew,
            }
        );

        const portGeo = starboardGeo.clone();
        const uvs = portGeo.attributes.uv.array as Float32Array;
        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = 1.0 - uvs[i];
        }
        portGeo.attributes.uv.needsUpdate = true;

        return { portGeo, starboardGeo };
    }, [
        params.nacelleLower_toggle, params.nacelleLower_length, params.nacelleLower_radius, params.nacelleLower_widthRatio, params.nacelleLower_foreTaper, 
        params.nacelleLower_aftTaper, params.nacelleLower_foreCurve, params.nacelleLower_aftCurve, params.nacelleLower_segments, params.nacelleLower_skew, params.nacelleLower_slant,
        params.nacelleLower_undercut_top, params.nacelleLower_undercut_top_start, params.nacelleLower_undercut_top_curve,
        params.nacelleLower_undercut_bottom, params.nacelleLower_undercut_bottom_start, params.nacelleLower_undercut_bottom_curve,
        params.nacelleLower_undercut_inward, params.nacelleLower_undercut_inward_start, params.nacelleLower_undercut_inward_curve,
        params.nacelleLower_undercut_outward, params.nacelleLower_undercut_outward_start, params.nacelleLower_undercut_outward_curve,
        params.nacelleLower_grill_toggle, params.nacelleLower_grill_length, params.nacelleLower_grill_width, params.nacelleLower_grill_vertical_offset, params.nacelleLower_grill_rotation,
        params.nacelleLower_grill_rounding, params.nacelleLower_grill_skew
    ]);

    return (
        <>
            {upperNacelleGeos && <NacellePair 
                portName="UpperNacelle_Port"
                starboardName="UpperNacelle_Starboard"
                x={params.nacelle_x}
                z={params.nacelle_z}
                y={params.nacelle_y}
                rotation={params.nacelle_rotation}
                portNacelleGeo={upperNacelleGeos.portGeo}
                starboardNacelleGeo={upperNacelleGeos.starboardGeo}
                material={material}
                params={{
                    length: params.nacelle_length,
                    radius: params.nacelle_radius,
                    widthRatio: params.nacelle_widthRatio,
                    segments: params.nacelle_segments,
                    bussardRadius: params.nacelle_bussardRadius,
                    bussardWidthRatio: params.nacelle_bussardWidthRatio,
                    bussardCurvature: params.nacelle_bussardCurvature,
                    bussardYOffset: params.nacelle_bussardYOffset,
                    bussardZOffset: params.nacelle_bussardZOffset,
                    bussardSkewVertical: params.nacelle_bussardSkewVertical,
                    bussardType: params.nacelle_bussardType,
                    bussardSubtleVanes: params.nacelle_bussardSubtleVanes,
                    bussardVaneCount: params.nacelle_bussardVaneCount,
                    bussardVaneLength: params.nacelle_bussardVaneLength,
                    bussardAnimSpeed: params.nacelle_bussardAnimSpeed,
                    bussardColor1: params.nacelle_bussardColor1,
                    bussardColor2: params.nacelle_bussardColor2,
                    bussardColor3: params.nacelle_bussardColor3,
                    bussardGlowIntensity: params.nacelle_bussardGlowIntensity,
                    bussardShellOpacity: params.nacelle_bussardShellOpacity,
                    grill_toggle: params.nacelle_grill_toggle,
                    grill_animSpeed: params.nacelle_grill_animSpeed,
                    grill_color1: params.nacelle_grill_color1,
                    grill_color2: params.nacelle_grill_color2,
                    grill_color3: params.nacelle_grill_color3,
                    grill_intensity: params.nacelle_grill_intensity,
                    grill_anim_type: params.nacelle_grill_anim_type,
                    grill_orientation: params.nacelle_grill_orientation,
                    grill_softness: params.nacelle_grill_softness,
                    grill_base_glow: params.nacelle_grill_base_glow,
                    grill_line_count: params.nacelle_grill_line_count,
                }}
            />}
            {lowerNacelleGeos && <NacellePair 
                portName="LowerNacelle_Port"
                starboardName="LowerNacelle_Starboard"
                x={params.nacelleLower_x}
                z={params.nacelleLower_z}
                y={params.nacelleLower_y}
                rotation={params.nacelleLower_rotation}
                portNacelleGeo={lowerNacelleGeos.portGeo}
                starboardNacelleGeo={lowerNacelleGeos.starboardGeo}
                material={material}
                params={{
                    length: params.nacelleLower_length,
                    radius: params.nacelleLower_radius,
                    widthRatio: params.nacelleLower_widthRatio,
                    segments: params.nacelleLower_segments,
                    bussardRadius: params.nacelleLower_bussardRadius,
                    bussardWidthRatio: params.nacelleLower_bussardWidthRatio,
                    bussardCurvature: params.nacelleLower_bussardCurvature,
                    bussardYOffset: params.nacelleLower_bussardYOffset,
                    bussardZOffset: params.nacelleLower_bussardZOffset,
                    bussardSkewVertical: params.nacelleLower_bussardSkewVertical,
                    bussardType: params.nacelleLower_bussardType,
                    bussardSubtleVanes: params.nacelleLower_bussardSubtleVanes,
                    bussardVaneCount: params.nacelleLower_bussardVaneCount,
                    bussardVaneLength: params.nacelleLower_bussardVaneLength,
                    bussardAnimSpeed: params.nacelleLower_bussardAnimSpeed,
                    bussardColor1: params.nacelleLower_bussardColor1,
                    bussardColor2: params.nacelleLower_bussardColor2,
                    bussardColor3: params.nacelleLower_bussardColor3,
                    bussardGlowIntensity: params.nacelleLower_bussardGlowIntensity,
                    bussardShellOpacity: params.nacelleLower_bussardShellOpacity,
                    grill_toggle: params.nacelleLower_grill_toggle,
                    grill_animSpeed: params.nacelleLower_grill_animSpeed,
                    grill_color1: params.nacelleLower_grill_color1,
                    grill_color2: params.nacelleLower_grill_color2,
                    grill_color3: params.nacelleLower_grill_color3,
                    grill_intensity: params.nacelleLower_grill_intensity,
                    grill_anim_type: params.nacelleLower_grill_anim_type,
                    grill_orientation: params.nacelleLower_grill_orientation,
                    grill_softness: params.nacelleLower_grill_softness,
                    grill_base_glow: params.nacelleLower_grill_base_glow,
                    grill_line_count: params.nacelleLower_grill_line_count,
                }}
            />}
        </>
    )
};