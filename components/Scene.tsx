// By importing '@react-three/fiber', we extend JSX to include three.js elements.
import '@react-three/fiber';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Ship } from './Ship';
import { ShipParameters, LightParameters } from '../types';
import { Compass } from './Compass';
import * as THREE from 'three';
import { ProceduralNebulaBackground } from './ProceduralNebulaBackground';

interface SceneProps {
  shipParams: ShipParameters;
  shipRef: React.RefObject<THREE.Group>;
  hullMaterial: THREE.Material;
  secondaryMaterial: THREE.Material;
  lightParams: LightParameters;
}

export const Scene: React.FC<SceneProps> = ({ shipParams, shipRef, hullMaterial, secondaryMaterial, lightParams }) => {
  return (
    <Canvas 
      camera={{ position: [20, 20, 40], fov: 50 }}
      shadows
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
      </Suspense>
    </Canvas>
  );
};