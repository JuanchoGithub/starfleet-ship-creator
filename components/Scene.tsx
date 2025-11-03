// By importing '@react-three/fiber', we extend JSX to include three.js elements.
import '@react-three/fiber';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Ship } from './Ship';
import { ShipParameters } from '../types';
import { Compass } from './Compass';
import * as THREE from 'three';

interface SceneProps {
  shipParams: ShipParameters;
  shipRef: React.RefObject<THREE.Group>;
}

export const Scene: React.FC<SceneProps> = ({ shipParams, shipRef }) => {
  return (
    <Canvas 
      camera={{ position: [20, 20, 40], fov: 50 }}
      shadows
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <Environment preset="city" />
        
        <Stars radius={200} depth={50} count={10000} factor={6} saturation={0} fade speed={1} />
        
        <Ship shipParams={shipParams} ref={shipRef} />
        
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