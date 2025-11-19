
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
                    // Threshold is set to 1 degree. This ensures that the structural grid lines 
                    // of the smooth lathe geometries are drawn (since adjacent segment faces usually 
                    // differ by ~5 degrees), but strictly coplanar diagonals are still hidden.
                    const edges = new THREE.EdgesGeometry(child.geometry, 1);
                    createdGeometries.push(edges);
                    const line = new THREE.LineSegments(edges, lineMaterial);
                    
                    // To correctly position the outline, we apply the world matrix of the original mesh.
                    // This ensures the outline appears exactly where the mesh is, regardless of parent transformations.
                    child.updateWorldMatrix(true, false);
                    line.matrix.copy(child.matrixWorld);
                    line.matrixAutoUpdate = false; // We've set the matrix manually, so disable automatic updates.

                    group.add(line);
                }
            });
        }
        
        // This cleanup function will be called before the next effect runs or on unmount.
        // It's crucial for disposing of the old geometries to prevent memory leaks.
        return () => {
             createdGeometries.forEach(g => g.dispose());
        }

    }, [shipRef, lineMaterial, shipParams]); // Re-run this effect whenever the ship's parameters change

    // On component unmount, dispose of the shared material
    useEffect(() => {
        return () => {
            lineMaterial.dispose();
        }
    }, [lineMaterial]);

    return <group ref={linesRef} />;
};
