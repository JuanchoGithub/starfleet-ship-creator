
import React, { Suspense, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Bounds } from '@react-three/drei';
import { Ship } from './Ship';
import { ShipParameters } from '../types';
import * as THREE from 'three';
import { ShipOutlines } from './ShipOutlines';

interface ViewportProps {
  label: string;
  cameraProps: {
    position: [number, number, number];
    rotation?: [number, number, number];
  };
  shipParams: ShipParameters;
  hullMaterial: THREE.Material;
  secondaryMaterial: THREE.Material;
  saucerMaterial: THREE.Material;
  bridgeMaterial: THREE.Material;
  nacelleMaterial: THREE.Material;
  engineeringMaterial: THREE.Material;
  renderType: 'shaded' | 'wireframe' | 'blueprint';
  children?: React.ReactNode;
}

const Viewport: React.FC<ViewportProps> = ({ label, cameraProps, shipParams, hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial, renderType, children }) => {
    const shipRef = useRef<THREE.Group>(null!);

    // Standard shaded mode uses the passed materials.
    // Wireframe and Blueprint modes now use the ShipOutlines component for clean lines.
    // We still render the Ship mesh invisibly in these modes to provide the geometry source for ShipOutlines and Bounds.

    return (
        <div className="flex-1 relative border-b border-space-light last:border-b-0 overflow-hidden">
            <div className="absolute top-1 left-2 text-xs text-mid-gray bg-space-dark/50 px-1 rounded z-10 pointer-events-none">{label}</div>
            <Canvas>
            <Suspense fallback={null}>
                <OrthographicCamera makeDefault {...cameraProps} near={-500} far={500} />
                <ambientLight intensity={renderType === 'shaded' ? 1.5 : 1} />
                {renderType === 'shaded' && <directionalLight position={[10, 20, 5]} intensity={1} />}
                
                {renderType === 'blueprint' && <color attach="background" args={['#000000']} />}

                <Bounds fit clip observe margin={1.2}>
                    <group>
                        {/* The Ship component is always rendered to provide geometry, but hidden in line modes */}
                        <group visible={renderType === 'shaded'}>
                            <Ship 
                                shipParams={shipParams} 
                                ref={shipRef} 
                                material={hullMaterial} 
                                secondaryMaterial={secondaryMaterial} 
                                saucerMaterial={saucerMaterial} 
                                bridgeMaterial={bridgeMaterial} 
                                nacelleMaterial={nacelleMaterial} 
                                engineeringMaterial={engineeringMaterial} 
                            />
                        </group>
                        
                        {(renderType === 'wireframe' || renderType === 'blueprint') && (
                            <ShipOutlines 
                                shipRef={shipRef} 
                                shipParams={shipParams}
                                // Lighter blue for wireframe on dark gray, Deep blue for blueprint on black
                                color={renderType === 'blueprint' ? '#388BFD' : '#58A6FF'}
                            />
                        )}
                    </group>
                </Bounds>
                {children}
            </Suspense>
            </Canvas>
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
  bridgeMaterial: THREE.Material;
  nacelleMaterial: THREE.Material;
  engineeringMaterial: THREE.Material;
  renderType: 'shaded' | 'wireframe' | 'blueprint';
}

export const Multiview: React.FC<MultiviewProps> = ({ shipParams, width, setWidth, hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial, renderType }) => {
    const resizerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = width;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = startWidth - (moveEvent.clientX - startX);
            if (newWidth > 280 && newWidth < 600) { // Min/max width constraints
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [width, setWidth]);

    return (
        <div className="absolute top-0 left-0 h-full flex z-20" style={{ width: `${width}px` }}>
            <div className="h-full flex-grow flex flex-col bg-space-dark border-r border-space-light">
                <Viewport label="TOP" cameraProps={{ position: [0, 80, 0], rotation: [-Math.PI / 2, 0, -Math.PI / 2] }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial, renderType}} />
                <Viewport label="FRONT" cameraProps={{ position: [0, 0, 80] }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial, renderType}} />
                <Viewport label="SIDE" cameraProps={{ position: [80, 0, 0], rotation: [0, Math.PI / 2, 0] }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial, renderType}} />
                <Viewport label="BOTTOM" cameraProps={{ position: [0, -80, 0], rotation: [Math.PI / 2, 0, Math.PI / 2] }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial, renderType}} />
            </div>
            <div
                ref={resizerRef}
                onMouseDown={handleMouseDown}
                className="w-1.5 h-full cursor-col-resize bg-space-light hover:bg-accent-blue transition-colors"
                title="Resize Ortho Views"
            />
        </div>
    );
};
