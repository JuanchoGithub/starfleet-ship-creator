
// By importing '@react-three/fiber', we extend JSX to include three.js elements.
import React, { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Ship } from './Ship';
import { ShipParameters, LightParameters } from '../types';
import { Compass } from './Compass';
import * as THREE from 'three';
import { ProceduralNebulaBackground } from './ProceduralNebulaBackground';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

interface SceneProps {
  shipParams: ShipParameters;
  shipRef: React.RefObject<THREE.Group>;
  hullMaterial: THREE.Material;
  secondaryMaterial: THREE.Material;
  nacelleMaterial: THREE.Material;
  saucerMaterial: THREE.Material;
  bridgeMaterial: THREE.Material;
  engineeringMaterial: THREE.Material;
  neckMaterial: THREE.Material;
  lightParams: LightParameters;
}

const Effects: React.FC<{ lightParams: LightParameters }> = ({ lightParams }) => {
    const { scene, camera, gl, size } = useThree();

    const composer = useMemo(() => {
        const effectComposer = new EffectComposer(gl);
        effectComposer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.5, 0.4, 0.85);
        effectComposer.addPass(bloomPass);
        const outputPass = new OutputPass();
        effectComposer.addPass(outputPass);
        return effectComposer;
    }, [gl, scene, camera, size.width, size.height]);

    useEffect(() => {
        const bloomPass = composer.passes[1] as UnrealBloomPass;
        bloomPass.threshold = lightParams.bloom_threshold;
        bloomPass.strength = lightParams.bloom_strength;
        bloomPass.radius = lightParams.bloom_radius;
        gl.toneMappingExposure = Math.pow(lightParams.toneMapping_exposure, 4.0);
    }, [composer, lightParams, gl]);

    useFrame((_, delta) => {
        composer.render(delta);
    }, 1);

    return null;
}

const SceneContent: React.FC<SceneProps> = ({ shipParams, shipRef, hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, engineeringMaterial, nacelleMaterial, neckMaterial, lightParams }) => {
    const { controls, gl, scene, camera } = useThree();
    const [isInteracting, setIsInteracting] = useState(false);
    const nebulaRef = useRef<THREE.Mesh>(null!);
    const originalBackground = useRef(scene.background);
    const capturedTextureRef = useRef<THREE.CubeTexture | null>(null);

    useEffect(() => {
        const canvas = gl.domElement;
        if (!canvas) return;

        const handleStart = () => setIsInteracting(true);
        const handleEnd = () => setIsInteracting(false);

        // FIX: The type of `controls` from `useThree` is being incorrectly inferred, causing
        // TypeScript to believe no events can be listened to. Casting to `any`
        // bypasses this check as a workaround.
        (controls as any)?.addEventListener('start', handleStart);
        (controls as any)?.addEventListener('end', handleEnd);
        canvas.addEventListener('mousedown', handleStart);
        window.addEventListener('mouseup', handleEnd);

        return () => {
            (controls as any)?.removeEventListener('start', handleStart);
            (controls as any)?.removeEventListener('end', handleEnd);
            canvas.removeEventListener('mousedown', handleStart);
            window.removeEventListener('mouseup', handleEnd);
        };
    }, [controls, gl.domElement]);

    useEffect(() => {
        const ship = scene.getObjectByName("Starship");
        const nebulaMesh = nebulaRef.current;
    
        const restoreLiveNebula = () => {
            scene.background = originalBackground.current;
            if (capturedTextureRef.current) {
                capturedTextureRef.current.dispose();
                capturedTextureRef.current = null;
            }
            if (nebulaMesh) {
                nebulaMesh.visible = lightParams.nebula_enabled;
            }
        };
    
        if (isInteracting && lightParams.nebula_enabled && nebulaMesh) {
            if (!capturedTextureRef.current) {
                if (ship) ship.visible = false;
                nebulaMesh.visible = true;
    
                const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512); // Capture at 512px for performance
                const cubeCamera = new THREE.CubeCamera(1, 10000, cubeRenderTarget);
                // Since the nebula now follows the main camera, we must also position
                // the CubeCamera at the main camera's position to capture the environment correctly.
                cubeCamera.position.copy(camera.position);
                cubeCamera.update(gl, scene);
                
                capturedTextureRef.current = cubeRenderTarget.texture;
                scene.background = capturedTextureRef.current;
                nebulaMesh.visible = false;
                
                if (ship) ship.visible = true;
            }
        } else {
            restoreLiveNebula();
        }
        
        return () => {
            if (isInteracting) {
                restoreLiveNebula();
            }
        };
    
    }, [isInteracting, lightParams.nebula_enabled, scene, gl, camera]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (capturedTextureRef.current) {
                capturedTextureRef.current.dispose();
            }
        }
    }, []);

    return (
        <Suspense fallback={null}>
            {lightParams.ambient_enabled && <ambientLight color={lightParams.ambient_color} intensity={lightParams.ambient_intensity} />}
            {lightParams.directional_enabled && <directionalLight 
            color={lightParams.directional_color}
            position={[lightParams.directional_position_x, lightParams.directional_position_y, lightParams.directional_position_z]} 
            intensity={lightParams.directional_intensity} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            />}
            
            {lightParams.env_enabled && <Environment preset={lightParams.env_preset} />}
            
            {lightParams.nebula_enabled ? (
                <ProceduralNebulaBackground ref={nebulaRef} params={lightParams} isAnimationPaused={isInteracting} />
            ) : (
                <Stars radius={200} depth={50} count={10000} factor={6} saturation={0} fade speed={1} />
            )}
            
            <Ship shipParams={shipParams} ref={shipRef} material={hullMaterial} secondaryMaterial={secondaryMaterial} nacelleMaterial={nacelleMaterial} saucerMaterial={saucerMaterial} bridgeMaterial={bridgeMaterial} engineeringMaterial={engineeringMaterial} neckMaterial={neckMaterial} />
            
            <OrbitControls 
            enableDamping 
            dampingFactor={0.1}
            rotateSpeed={0.5}
            minDistance={10}
            maxDistance={200}
            />
            
            <Compass />

            {lightParams.bloom_enabled && <Effects lightParams={lightParams} />}
        </Suspense>
    )
}


export const Scene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas 
      camera={{ position: [20, 20, 40], fov: 50 }}
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: true }}
    >
        <SceneContent {...props} />
    </Canvas>
  );
};