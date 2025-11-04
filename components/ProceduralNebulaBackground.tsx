import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LightParameters } from '../types';

const vertexShader = `
    varying vec3 vDirection;
    void main() {
        // Pass the world-space position to the fragment shader
        vDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform float uSeed;
    uniform float uDensity;
    uniform float uFalloff;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uStarsIntensity;
    uniform float uStarsCount;
    uniform float uAnimSpeed;

    varying vec3 vDirection;

    // Hashing functions for randomness
    float hash11(float p) {
        p = fract(p * .1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
    }

    // 3D Value Noise
    float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        // Using a more robust hashing for noise to avoid artifacts
        return mix(
            mix(
                mix(hash11(i.x + i.y * 157.0 + i.z * 113.0), hash11(i.x + 1.0 + i.y * 157.0 + i.z * 113.0), f.x),
                mix(hash11(i.x + (i.y + 1.0) * 157.0 + i.z * 113.0), hash11(i.x + 1.0 + (i.y + 1.0) * 157.0 + i.z * 113.0), f.x),
                f.y
            ),
            mix(
                mix(hash11(i.x + i.y * 157.0 + (i.z + 1.0) * 113.0), hash11(i.x + 1.0 + i.y * 157.0 + (i.z + 1.0) * 113.0), f.x),
                mix(hash11(i.x + (i.y + 1.0) * 157.0 + (i.z + 1.0) * 113.0), hash11(i.x + 1.0 + (i.y + 1.0) * 157.0 + (i.z + 1.0) * 113.0), f.x),
                f.y
            ),
            f.z
        );
    }

    // Fractional Brownian Motion
    float fbm(vec3 p, int octaves) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100.0);
        for (int i = 0; i < 8; ++i) {
            if (i >= octaves) break;
            v += a * noise(p);
            p = p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    // Stars generation
    float stars(vec3 p, float seed) {
        vec3 q = fract(p * 250.0) - 0.5;
        vec3 id = floor(p * 250.0);
        float r = length(q);
        if (r > 0.45) return 0.0;
        
        float n = hash11(id.x + id.y * 113.1 + id.z * 157.7 + seed);
        
        // Use uStarsCount to control density.
        float density = uStarsCount / 10000.0;
        float threshold = 1.0 - (density * 0.05); // Increased from 0.02 to 0.05 for more stars
        if (n < threshold) return 0.0;

        float size = (1.0 - r / 0.45);
        float blink = sin(uTime * uAnimSpeed * (0.5 + n * 2.0) + id.x) * 0.5 + 0.5;
        return pow(size, 10.0) * blink;
    }

    void main() {
        vec3 dir = normalize(vDirection);
        float time = uTime * uAnimSpeed;

        // --- Nebula ---
        vec3 noise_coord_base = dir * uDensity + uSeed;
        float shape_noise = fbm(noise_coord_base + time * 0.05, 5);
        
        // A sharper mask for the nebula shape to create empty space between clouds
        float nebula_mask = smoothstep(0.5, 0.6, shape_noise);
        
        // Base deep space color
        vec3 color = vec3(0.01, 0.01, 0.02);
        
        // Only calculate expensive color noise inside the nebula
        if (nebula_mask > 0.01) {
            float color_noise1 = fbm(noise_coord_base * 2.0 + time * 0.02, 6);
            float color_noise2 = fbm(noise_coord_base * 4.0 + time * 0.01, 7);
            
            // uFalloff controls the brightness/density inside the clouds
            float density_inside_cloud = pow(shape_noise, uFalloff);
            
            vec3 nebula_color = uColor1;
            nebula_color = mix(nebula_color, uColor2, color_noise1);
            nebula_color = mix(nebula_color, uColor3, color_noise2);
            
            // Pulsing effect, applied only to the nebula
            float pulse = sin(time * 2.0 + shape_noise * 5.0) * 0.2 + 0.8;

            color += nebula_mask * density_inside_cloud * nebula_color * pulse;
        }

        // --- Stars (additive) ---
        color += vec3(1.0) * stars(dir, uSeed) * uStarsIntensity;

        // --- Lightning (additive) ---
        vec3 storm_coord = dir * 0.5 + uSeed;
        float storm_region = smoothstep(0.6, 0.7, fbm(storm_coord + time * 0.01, 4));

        if (storm_region > 0.01) {
             float lightning_noise = fbm(dir * 20.0 + time * 2.0, 3);
             float lightning = smoothstep(0.8, 0.82, lightning_noise);
             
             // A more chaotic flash trigger based on hashed, quantized time
             float flash_hash = hash11(floor(time * 5.0) + hash11(floor(storm_coord.x * 10.0)));
             float flash_trigger = smoothstep(0.98, 1.0, flash_hash);
             
             color += vec3(0.8, 0.9, 1.0) * lightning * flash_trigger * storm_region * 3.0; // Bluish white, bright flash
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;


interface ProceduralNebulaBackgroundProps {
    params: LightParameters;
}

export const ProceduralNebulaBackground: React.FC<ProceduralNebulaBackgroundProps> = ({ params }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null!);

    const uniforms = useMemo(() => ({
        uTime: { value: 0.0 },
        uSeed: { value: params.nebula_seed },
        uDensity: { value: params.nebula_density },
        uFalloff: { value: params.nebula_falloff },
        uColor1: { value: new THREE.Color(params.nebula_color1) },
        uColor2: { value: new THREE.Color(params.nebula_color2) },
        uColor3: { value: new THREE.Color(params.nebula_color3) },
        uStarsIntensity: { value: params.nebula_stars_intensity },
        uStarsCount: { value: params.nebula_stars_count },
        uAnimSpeed: { value: params.nebula_animSpeed || 1.0 },
    }), []);

    // Update uniforms when params change
    useEffect(() => {
        if(materialRef.current) {
            materialRef.current.uniforms.uSeed.value = params.nebula_seed;
            materialRef.current.uniforms.uDensity.value = params.nebula_density;
            materialRef.current.uniforms.uFalloff.value = params.nebula_falloff;
            materialRef.current.uniforms.uColor1.value.set(params.nebula_color1);
            materialRef.current.uniforms.uColor2.value.set(params.nebula_color2);
            materialRef.current.uniforms.uColor3.value.set(params.nebula_color3);
            materialRef.current.uniforms.uStarsIntensity.value = params.nebula_stars_intensity;
            materialRef.current.uniforms.uStarsCount.value = params.nebula_stars_count;
            materialRef.current.uniforms.uAnimSpeed.value = params.nebula_animSpeed || 1.0;
        }
    }, [params]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh>
            <sphereGeometry args={[500, 64, 32]} />
            <shaderMaterial
                ref={materialRef}
                key={Date.now()} // Force re-creation to ensure the new shader is used
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                side={THREE.BackSide}
            />
        </mesh>
    );
};