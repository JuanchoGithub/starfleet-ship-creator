
import React, { Suspense, useCallback, useEffect, useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Bounds } from '@react-three/drei';
import { Ship } from './Ship';
import { ShipParameters } from '../types';
import { ShipOutlines } from './ShipOutlines';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Custom Edge Detection Shader (Sobel Operator)
const EdgeDetectionShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(800, 600) },
        outlineColor: { value: new THREE.Color(0xffffff) },
        backgroundColor: { value: new THREE.Color(0x000000) },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform vec3 outlineColor;
        uniform vec3 backgroundColor;
        varying vec2 vUv;

        void main() {
            vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y);
            
            float gx[9];
            gx[0] = -1.0; gx[1] = 0.0; gx[2] = 1.0;
            gx[3] = -2.0; gx[4] = 0.0; gx[5] = 2.0;
            gx[6] = -1.0; gx[7] = 0.0; gx[8] = 1.0;

            float gy[9];
            gy[0] = -1.0; gy[1] = -2.0; gy[2] = -1.0;
            gy[3] =  0.0; gy[4] =  0.0; gy[5] =  0.0;
            gy[6] =  1.0; gy[7] =  2.0; gy[8] =  1.0;

            vec3 sampleColor;
            vec3 gradX = vec3(0.0);
            vec3 gradY = vec3(0.0);
            
            for(int i=0; i<3; i++) {
                for(int j=0; j<3; j++) {
                    vec2 offset = vec2(float(i-1), float(j-1)) * texel;
                    sampleColor = texture2D(tDiffuse, vUv + offset).rgb;
                    
                    gradX += sampleColor * gx[i*3+j];
                    gradY += sampleColor * gy[i*3+j];
                }
            }
            
            float magX = length(gradX);
            float magY = length(gradY);
            float dist = sqrt(magX*magX + magY*magY);
            
            // Threshold for edge detection
            if (dist > 0.8) { 
                gl_FragColor = vec4(outlineColor, 1.0);
            } else {
                gl_FragColor = vec4(backgroundColor, 1.0);
            }
        }
    `
};

const BlueprintRenderer: React.FC<{ renderType: 'shaded' | 'wireframe' | 'blueprint' }> = ({ renderType }) => {
    const { gl, scene, camera, size } = useThree();
    const composer = useRef<EffectComposer | null>(null);
    const normalMaterial = useMemo(() => new THREE.MeshNormalMaterial(), []);

    useEffect(() => {
        // Only use the Sobel filter for Blueprint mode.
        // Wireframe now uses actual geometry lines, and Shaded uses standard rendering.
        if (renderType !== 'blueprint') {
            composer.current = null;
            scene.overrideMaterial = null;
            if (renderType === 'shaded') {
                scene.background = null;
            }
            return;
        }

        const newComposer = new EffectComposer(gl);
        
        // 1. Render Pass
        const renderPass = new RenderPass(scene, camera);
        newComposer.addPass(renderPass);

        // 2. Edge Detection Pass
        const edgePass = new ShaderPass(EdgeDetectionShader);
        edgePass.uniforms['resolution'].value.set(size.width, size.height);
        edgePass.uniforms['outlineColor'].value.set('#388BFD'); // Blueprint Blue
        edgePass.uniforms['backgroundColor'].value.set('#000000'); // Black
        
        newComposer.addPass(edgePass);
        composer.current = newComposer;

        // Set override material for the base render to be Normal Material.
        scene.overrideMaterial = normalMaterial;
        scene.background = new THREE.Color(0x000000); 

        return () => {
            scene.overrideMaterial = null;
            scene.background = null;
            if (composer.current) composer.current.dispose();
        };
    }, [gl, scene, camera, size, renderType, normalMaterial]);

    useFrame(() => {
        if (composer.current && renderType === 'blueprint') {
            composer.current.render();
        } else {
            // Default render
            gl.render(scene, camera);
        }
    }, 1); // Render priority 1

    return null;
}

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
    
    // Material used for occlusion in wireframe mode.
    // Matches background color to hide back-facing lines (hidden line removal).
    const maskMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
        color: '#161B22', 
        polygonOffset: true,
        polygonOffsetFactor: 1, // Push geometry back slightly so lines draw on top
        polygonOffsetUnits: 1
    }), []);
    
    const isWireframe = renderType === 'wireframe';
    
    // If in wireframe mode, swap all materials to the mask material
    const activeHullMat = isWireframe ? maskMaterial : hullMaterial;
    const activeSecMat = isWireframe ? maskMaterial : secondaryMaterial;
    const activeSaucerMat = isWireframe ? maskMaterial : saucerMaterial;
    const activeBridgeMat = isWireframe ? maskMaterial : bridgeMaterial;
    const activeNacelleMat = isWireframe ? maskMaterial : nacelleMaterial;
    const activeEngMat = isWireframe ? maskMaterial : engineeringMaterial;

    return (
        <div className="flex-1 relative border-b border-space-light last:border-b-0 overflow-hidden">
            <div className="absolute top-1 left-2 text-xs text-mid-gray bg-space-dark/50 px-1 rounded z-10 pointer-events-none">{label}</div>
            <Canvas frameloop="always">
            <Suspense fallback={null}>
                <OrthographicCamera makeDefault {...cameraProps} near={-500} far={500} />
                
                {isWireframe && <color attach="background" args={['#161B22']} />}

                {renderType === 'shaded' && (
                    <>
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[10, 20, 5]} intensity={1} />
                    </>
                )}

                <Bounds fit clip observe margin={1.2}>
                     <Ship 
                        shipParams={shipParams} 
                        ref={shipRef} 
                        material={activeHullMat} 
                        secondaryMaterial={activeSecMat} 
                        saucerMaterial={activeSaucerMat} 
                        bridgeMaterial={activeBridgeMat} 
                        nacelleMaterial={activeNacelleMat} 
                        engineeringMaterial={activeEngMat} 
                    />
                </Bounds>
                
                {isWireframe && (
                    <ShipOutlines shipRef={shipRef} shipParams={shipParams} color="#58A6FF" />
                )}

                <BlueprintRenderer renderType={renderType} />
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
