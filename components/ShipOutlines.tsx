
// FIX: Add a global import for '@react-three/fiber' to augment JSX types for this file.
import '@react-three/fiber';
import React, { useLayoutEffect, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../types';

interface ShipOutlinesProps {
    shipRef: React.RefObject<THREE.Group>;
    shipParams: ShipParameters;
    color?: string;
}

export const ShipOutlines: React.FC<ShipOutlinesProps> = ({ shipRef, shipParams, color = '#388BFD' }) => {
    const linesRef = useRef<THREE.Group>(null!);
    
    // Create a stable material instance
    const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color }), []);

    // Update material color when prop changes without recreating the material or geometry
    useEffect(() => {
        lineMaterial.color.set(color);
    }, [color, lineMaterial]);

    useLayoutEffect(() => {
        const group = linesRef.current;
        if (!group) return;

        const createdGeometries: THREE.BufferGeometry[] = [];

        // Clear previous lines from the group
        while (group.children.length) {
            group.remove(group.children[0]);
        }

        if (shipRef.current) {
            shipRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh && child.geometry && child.visible) {
                    // Create edges geometry for the current mesh.
                    // Threshold set to 15 degrees to capture structural edges while ignoring
                    // most of the smooth curvature tessellation.
                    const edges = new THREE.EdgesGeometry(child.geometry, 15);
                    createdGeometries.push(edges);
                    const line = new THREE.LineSegments(edges, lineMaterial);
                    
                    // To correctly position the outline, we apply the world matrix of the original mesh.
                    child.updateWorldMatrix(true, false);
                    line.matrix.copy(child.matrixWorld);
                    line.matrixAutoUpdate = false;

                    group.add(line);
                }
            });
        }
        
        return () => {
             createdGeometries.forEach(g => g.dispose());
        }

    }, [shipRef, lineMaterial, shipParams]);

    useEffect(() => {
        return () => {
            lineMaterial.dispose();
        }
    }, [lineMaterial]);

    return <group ref={linesRef} />;
};
