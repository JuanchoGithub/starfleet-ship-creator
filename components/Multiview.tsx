// FIX: Add import for react-three-fiber to extend JSX namespace for R3F elements.
import '@react-three/fiber';
import React, { Suspense, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Stars, Environment } from '@react-three/drei';
import { Ship } from './Ship';
import { ShipParameters } from '../types';
import * as THREE from 'three';
import { ShipOutlines } from './ShipOutlines';

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
  saucerMaterial: THREE.Material;
  renderType: 'shaded' | 'wireframe' | 'blueprint';
  children?: React.ReactNode;
}

const Viewport: React.FC<ViewportProps> = ({ label, cameraProps, shipParams, hullMaterial, secondaryMaterial, saucerMaterial, renderType, children }) => {
    const shipRef = useRef<THREE.Group>(null!);
    return (
        <div className="flex-1 relative border-b border-space-light last:border-b-0 overflow-hidden">
            <div className="absolute top-1 left-2 text-xs text-mid-gray bg-space-dark/50 px-1 rounded z-10 pointer-events-none">{label}</div>
            <Canvas>
            <Suspense fallback={null}>
                <OrthographicCamera makeDefault {...cameraProps} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 20, 5]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.2} />
                <Environment preset="city" />
                <Ship ref={shipRef} shipParams={shipParams} material={hullMaterial} secondaryMaterial={secondaryMaterial} saucerMaterial={saucerMaterial} />
                {renderType === 'blueprint' && <ShipOutlines shipRef={shipRef} shipParams={shipParams} />}
            </Suspense>
            </Canvas>
            {children}
        </div>
    );
};

interface MultiviewProps {
  shipParams: ShipParameters;
  width: number;
  setWidth: (width: number) => void;
  hullMaterial: THREE.Material;
  secondaryMaterial: THREE.Material;
  saucerMaterial: THREE.Material;
}

const MIN_WIDTH = 250;
const MAX_WIDTH = 800;

export const Multiview: React.FC<MultiviewProps> = ({ shipParams, width, setWidth, hullMaterial, secondaryMaterial, saucerMaterial }) => {
  const isResizing = useRef(false);
  const [renderType, setRenderType] = useState<'shaded' | 'wireframe' | 'blueprint'>('shaded');

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

  const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#388BFD', wireframe: true }), []);
  const blueprintFillMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#0D1117' }), []);

  const materials = useMemo(() => {
      if (renderType === 'wireframe') {
          return { hull: wireframeMaterial, secondary: wireframeMaterial, saucer: wireframeMaterial };
      }
      if (renderType === 'blueprint') {
          return { hull: blueprintFillMaterial, secondary: blueprintFillMaterial, saucer: blueprintFillMaterial };
      }
      // shaded
      return { hull: hullMaterial, secondary: secondaryMaterial, saucer: saucerMaterial };
  }, [renderType, wireframeMaterial, blueprintFillMaterial, hullMaterial, secondaryMaterial, saucerMaterial]);


  const zoom = 4.5;
  const renderTypes = ['Shaded', 'Wireframe', 'Blueprint'];

  return (
    <div 
        className="h-full bg-space-mid border-r border-space-light flex-shrink-0 flex flex-col overflow-hidden hidden md:flex relative"
        style={{ width: `${width}px` }}
    >
      <div 
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-20 group"
      >
        <div className="w-0.5 h-full bg-space-light group-hover:bg-accent-blue transition-colors duration-200 mx-auto"></div>
      </div>
      
      <div className="p-1 bg-space-dark border-b border-space-light flex justify-center sticky top-0 z-10">
        <div className="inline-flex rounded-md shadow-sm" role="group">
            {renderTypes.map(type => (
                <button
                    key={type}
                    type="button"
                    onClick={() => setRenderType(type.toLowerCase() as any)}
                    className={`px-3 py-1 text-xs font-medium border border-space-light transition-colors 
                        ${renderType === type.toLowerCase() ? 'bg-accent-blue text-white' : 'bg-space-mid text-mid-gray hover:bg-space-light'}
                        first:rounded-l-lg last:rounded-r-lg`}
                >
                    {type}
                </button>
            ))}
        </div>
      </div>

      <div className="flex flex-col flex-grow min-h-0">
        <Viewport 
            label="FRONT"
            cameraProps={{ position: [0, 0, 50], zoom }}
            shipParams={shipParams}
            hullMaterial={materials.hull}
            secondaryMaterial={materials.secondary}
            saucerMaterial={materials.saucer}
            renderType={renderType}
        />
        <Viewport 
            label="TOP"
            cameraProps={{ position: [0, 50, 0], rotation: [-Math.PI / 2, 0, -Math.PI / 2], zoom }}
            shipParams={shipParams}
            hullMaterial={materials.hull}
            secondaryMaterial={materials.secondary}
            saucerMaterial={materials.saucer}
            renderType={renderType}
        />
        <Viewport 
            label="SIDE (PORT)"
            cameraProps={{ position: [-50, 0, 0], rotation: [0, -Math.PI / 2, 0], zoom }}
            shipParams={shipParams}
            hullMaterial={materials.hull}
            secondaryMaterial={materials.secondary}
            saucerMaterial={materials.saucer}
            renderType={renderType}
        />
        <Viewport 
            label="BOTTOM"
            cameraProps={{ position: [0, -50, 0], rotation: [Math.PI / 2, 0, Math.PI / 2], zoom }}
            shipParams={shipParams}
            hullMaterial={materials.hull}
            secondaryMaterial={materials.secondary}
            saucerMaterial={materials.saucer}
            renderType={renderType}
        >
        </Viewport>
      </div>
    </div>
  );
};