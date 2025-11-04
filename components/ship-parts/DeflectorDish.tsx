
import '@react-three/fiber';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ShipParameters } from '../../types';
import { useFrame } from '@react-three/fiber';

interface DeflectorDishProps {
    params: ShipParameters;
}

export const DeflectorDish: React.FC<DeflectorDishProps> = ({ params }) => {
    const deflectorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: params.engineering_dishColor1,
        roughness: 0.1,
    }), [params.engineering_dishColor1]);

    const color1 = useMemo(() => new THREE.Color(params.engineering_dishColor1), [params.engineering_dishColor1]);
    const color2 = useMemo(() => new THREE.Color(params.engineering_dishColor2), [params.engineering_dishColor2]);

    useFrame(({ clock }) => {
        const pulse = (Math.sin(clock.getElapsedTime() * params.engineering_dishAnimSpeed) + 1) / 2; // 0..1
        deflectorMaterial.emissive.lerpColors(color1, color2, pulse);
        deflectorMaterial.emissiveIntensity = params.engineering_dishGlowIntensity;
    });

    const deflectorGeo = useMemo(() => {
        const {
            engineering_length: length,
            engineering_radius: width,
            engineering_widthRatio: widthRatio,
            engineering_dishRadius: dishRadius,
            engineering_dishInset: dishInset,
            engineering_segments: segments,
            engineering_skew: skew
        } = params;

        // Recreate the last point of the engineering hull to attach to
        const engineeringLastPoint = new THREE.Vector2(
            Math.sin(0.65 * Math.PI + 0.35) * width,
            length
        );
        engineeringLastPoint.x *= dishRadius;

        // --- Deflector Dish Profile (concave with antenna) ---
        const deflectorPoints: THREE.Vector2[] = [];
        const deflectorOuterEdge = new THREE.Vector2().copy(engineeringLastPoint);
        deflectorPoints.push(deflectorOuterEdge);
        
        const dishConcavity = 0.2 * width; // Scaled concavity factor
        const deflectorPointCount = 8;
        for (let i = 0; i <= deflectorPointCount; i++) {
            const r = i / deflectorPointCount;
            deflectorPoints.push(
                new THREE.Vector2(
                    deflectorOuterEdge.x * (1.0 - r),
                    deflectorOuterEdge.y - Math.sin(Math.PI * r / 2.0) * dishConcavity - dishInset
                )
            );
        }

        // Antenna Spike
        const lastDishPoint = deflectorPoints[deflectorPoints.length - 1];
        lastDishPoint.setX(deflectorOuterEdge.x * 0.1);
        deflectorPoints.push(
            new THREE.Vector2(0.0, deflectorOuterEdge.y + 0.4 * width)
        );

        const geo = new THREE.LatheGeometry(deflectorPoints, Math.floor(segments));

        // Apply transformations in order: Scale -> Skew
        geo.scale(widthRatio, 1.0, 1.0);
        const matrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 1, skew, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        geo.applyMatrix4(matrix);
        geo.computeVertexNormals();

        return geo;
    }, [params]);

    return (
        <mesh
            name="DeflectorDish"
            geometry={deflectorGeo}
            material={deflectorMaterial}
        />
    )
}
