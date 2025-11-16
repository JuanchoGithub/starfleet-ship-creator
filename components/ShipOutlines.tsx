// FIX: Add a global import for '@react-three/fiber' to augment JSX types for this file.
import '@react-three/fiber';
import React, { useLayoutEffect, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../types';

export const ShipOutlines = ({ shipRef, shipParams }: { shipRef: React.RefObject<THREE.Group>, shipParams: ShipParameters }) => {
    const linesRef = useRef<THREE.Group>(null!);
    const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#388BFD' }), []);

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
                    // Create edges geometry for the current mesh
                    const edges = new THREE.EdgesGeometry(child.geometry, 20); // 20-degree threshold for edges
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