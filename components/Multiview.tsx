
// FIX: Add import for react-three-fiber to extend JSX namespace for R3F elements.
import '@react-three/fiber';
import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { Ship } from './Ship';
import { ShipParameters } from '../types';
import * as THREE from 'three';

interface ViewportProps {
  label: string;
  cameraProps: {
    position: [number, number, number];
    rotation?: [number, number, number];
    zoom: number;
  };
  shipParams: ShipParameters;
  hullMaterial: THREE.Material;
  secondaryMaterial: THREE.Material;
  overrideMaterial?: THREE.Material;
  children?: React.ReactNode;
  orthoViewMode: 'Schematic' | 'Normal';
}

const Viewport: React.FC<ViewportProps> = ({ label, cameraProps, shipParams, hullMaterial, secondaryMaterial, overrideMaterial, orthoViewMode, children }) => (
  <div className="flex-1 relative border-b border-space-light last:border-b-0 overflow-hidden">
    <div className="absolute top-1 left-2 text-xs text-mid-gray bg-space-dark/50 px-1 rounded z-10 pointer-events-none">{label}</div>
    <Canvas gl={{ alpha: false }}>
      <Suspense fallback={null}>
        <color attach="background" args={['#0D1117']} />
        <OrthographicCamera makeDefault {...cameraProps} />
        {orthoViewMode === 'Normal' && (
          <>
            <ambientLight intensity={1.2} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
          </>
        )}
        <Ship shipParams={shipParams} material={hullMaterial} secondaryMaterial={secondaryMaterial} overrideMaterial={overrideMaterial} />
      </Suspense>
    </Canvas>
    {children}
  </div>
);

interface MultiviewProps {
  shipParams: ShipParameters;
  width: number;
  setWidth: (width: number) => void;
  hullMaterial: THREE.Material;
  secondaryMaterial: THREE.Material;
  orthoViewMode: 'Schematic' | 'Normal';
}

const MIN_WIDTH = 250;
const MAX_WIDTH = 800;

export const Multiview: React.FC<MultiviewProps> = ({ shipParams, width, setWidth, hullMaterial, secondaryMaterial, orthoViewMode }) => {
  const isResizing = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
      if (isResizing.current) {
          let newWidth = e.clientX;
          if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
          if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
          setWidth(newWidth);
      }
  }, [setWidth]);

  const handleMouseUp = useCallback(() => {
      isResizing.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
  }, [handleMouseMove, handleMouseUp]);
  
  // Cleanup listeners on unmount
  useEffect(() => {
      return () => {
           window.removeEventListener('mousemove', handleMouseMove);
           window.removeEventListener('mouseup', handleMouseUp);
      }
  }, [handleMouseMove, handleMouseUp]);

  const silhouetteMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#8B949E', // mid-gray
    wireframe: true 
  }), []);

  const overrideMaterial = orthoViewMode === 'Schematic' ? silhouetteMaterial : undefined;

  const zoom = 4.5;
  return (
    <div 
        className="h-full bg-space-mid border-r border-space-light flex-shrink-0 flex-col overflow-hidden hidden md:flex relative"
        style={{ width: `${width}px` }}
    >
      <div 
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-20 group"
      >
        <div className="w-0.5 h-full bg-space-light group-hover:bg-accent-blue transition-colors duration-200 mx-auto"></div>
      </div>

      <Viewport 
        label="FRONT"
        cameraProps={{ position: [0, 0, 50], zoom }}
        shipParams={shipParams}
        hullMaterial={hullMaterial}
        secondaryMaterial={secondaryMaterial}
        overrideMaterial={overrideMaterial}
        orthoViewMode={orthoViewMode}
      />
      <Viewport 
        label="TOP"
        cameraProps={{ position: [0, 50, 0], rotation: [-Math.PI / 2, 0, -Math.PI / 2], zoom }}
        shipParams={shipParams}
        hullMaterial={hullMaterial}
        secondaryMaterial={secondaryMaterial}
        overrideMaterial={overrideMaterial}
        orthoViewMode={orthoViewMode}
      />
      <Viewport 
        label="SIDE (PORT)"
        cameraProps={{ position: [-50, 0, 0], rotation: [0, -Math.PI / 2, 0], zoom }}
        shipParams={shipParams}
        hullMaterial={hullMaterial}
        secondaryMaterial={secondaryMaterial}
        overrideMaterial={overrideMaterial}
        orthoViewMode={orthoViewMode}
      />
      <Viewport 
        label="BOTTOM"
        cameraProps={{ position: [0, -50, 0], rotation: [Math.PI / 2, 0, Math.PI / 2], zoom }}
        shipParams={shipParams}
        hullMaterial={hullMaterial}
        secondaryMaterial={secondaryMaterial}
        overrideMaterial={overrideMaterial}
        orthoViewMode={orthoViewMode}
      >
      </Viewport>
    </div>
  );
};
