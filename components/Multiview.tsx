
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
  bridgeMaterial: THREE.Material;
  nacelleMaterial: THREE.Material;
  engineeringMaterial: THREE.Material;
  renderType: 'shaded' | 'wireframe' | 'blueprint';
  children?: React.ReactNode;
}

const Viewport: React.FC<ViewportProps> = ({ label, cameraProps, shipParams, hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial, renderType, children }) => {
    const shipRef = useRef<THREE.Group>(null!);

    const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#58A6FF', wireframe: true }), []);
    const blueprintMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#0D1117', wireframe: true }), []);

    const finalHullMaterial = useMemo(() => {
        if (renderType === 'wireframe') return wireframeMaterial;
        if (renderType === 'blueprint') return blueprintMaterial;
        return hullMaterial;
    }, [renderType, wireframeMaterial, blueprintMaterial, hullMaterial]);

    const finalSecondaryMaterial = useMemo(() => {
        if (renderType === 'wireframe') return wireframeMaterial;
        if (renderType === 'blueprint') return blueprintMaterial;
        return secondaryMaterial;
    }, [renderType, wireframeMaterial, blueprintMaterial, secondaryMaterial]);
    
    const finalSaucerMaterial = useMemo(() => {
        if (renderType === 'wireframe') return wireframeMaterial;
        if (renderType === 'blueprint') return blueprintMaterial;
        return saucerMaterial;
    }, [renderType, wireframeMaterial, blueprintMaterial, saucerMaterial]);

    const finalBridgeMaterial = useMemo(() => {
        if (renderType === 'wireframe') return wireframeMaterial;
        if (renderType === 'blueprint') return blueprintMaterial;
        return bridgeMaterial;
    }, [renderType, wireframeMaterial, blueprintMaterial, bridgeMaterial]);

    const finalNacelleMaterial = useMemo(() => {
        if (renderType === 'wireframe') return wireframeMaterial;
        if (renderType === 'blueprint') return blueprintMaterial;
        return nacelleMaterial;
    }, [renderType, wireframeMaterial, blueprintMaterial, nacelleMaterial]);

    const finalEngineeringMaterial = useMemo(() => {
        if (renderType === 'wireframe') return wireframeMaterial;
        if (renderType === 'blueprint') return blueprintMaterial;
        return engineeringMaterial;
    }, [renderType, wireframeMaterial, blueprintMaterial, engineeringMaterial]);

    return (
        <div className="flex-1 relative border-b border-space-light last:border-b-0 overflow-hidden">
            <div className="absolute top-1 left-2 text-xs text-mid-gray bg-space-dark/50 px-1 rounded z-10 pointer-events-none">{label}</div>
            <Canvas>
            <Suspense fallback={null}>
                <OrthographicCamera makeDefault {...cameraProps} />
                <ambientLight intensity={renderType === 'shaded' ? 1.5 : 1} />
                {renderType === 'shaded' && <directionalLight position={[10, 20, 5]} intensity={1} />}
                
                {renderType === 'blueprint' && <color attach="background" args={['#388BFD']} />}

                <group scale={[0.8, 0.8, 0.8]}>
                  {(renderType === 'shaded' || renderType === 'wireframe') && (
                      <Ship shipParams={shipParams} ref={shipRef} material={finalHullMaterial} secondaryMaterial={finalSecondaryMaterial} saucerMaterial={finalSaucerMaterial} bridgeMaterial={finalBridgeMaterial} nacelleMaterial={finalNacelleMaterial} engineeringMaterial={finalEngineeringMaterial} />
                  )}
                  {renderType === 'blueprint' && (
                      // The Ship component is still needed to provide the geometry for the outlines
                      <>
                        <group visible={false}>
                            <Ship shipParams={shipParams} ref={shipRef} material={finalHullMaterial} secondaryMaterial={finalSecondaryMaterial} saucerMaterial={finalSaucerMaterial} bridgeMaterial={finalBridgeMaterial} nacelleMaterial={finalNacelleMaterial} engineeringMaterial={finalEngineeringMaterial} />
                        </group>
                        <ShipOutlines shipRef={shipRef} shipParams={shipParams}/>
                      </>
                  )}
                </group>
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
}

export const Multiview: React.FC<MultiviewProps> = ({ shipParams, width, setWidth, hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial }) => {
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
                <Viewport label="TOP" cameraProps={{ position: [0, 80, 0], rotation: [-Math.PI / 2, 0, 0], zoom: 8 }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial}} renderType="shaded" />
                <Viewport label="FRONT" cameraProps={{ position: [0, 0, 80], zoom: 8 }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial}} renderType="shaded" />
                <Viewport label="SIDE" cameraProps={{ position: [80, 0, 0], rotation: [0, Math.PI / 2, 0], zoom: 8 }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial}} renderType="wireframe" />
                <Viewport label="BLUEPRINT" cameraProps={{ position: [0, 80, 0], rotation: [-Math.PI / 2, 0, 0], zoom: 8 }} shipParams={shipParams} {...{hullMaterial, secondaryMaterial, saucerMaterial, bridgeMaterial, nacelleMaterial, engineeringMaterial}} renderType="blueprint" />
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
