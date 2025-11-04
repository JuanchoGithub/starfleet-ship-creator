// By importing '@react-three/fiber', we extend JSX to include three.js elements.
import '@react-three/fiber';
import React, { Suspense, useEffect, useMemo } from 'react';
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


export const Scene: React.FC<SceneProps> = ({ shipParams, shipRef, hullMaterial, secondaryMaterial, lightParams }) => {
  return (
    <Canvas 
      camera={{ position: [20, 20, 40], fov: 50 }}
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
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
          <ProceduralNebulaBackground params={lightParams} />
        ) : (
          <Stars radius={200} depth={50} count={10000} factor={6} saturation={0} fade speed={1} />
        )}
        
        <Ship shipParams={shipParams} ref={shipRef} material={hullMaterial} secondaryMaterial={secondaryMaterial} />
        
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
    </Canvas>
  );
};